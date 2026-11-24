import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { jsonResponse } from "@/app/api/jsonResponse";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookie";
import { hashPasswordResetToken } from "@/lib/auth/password-reset-token";
import { getPostgresPool } from "@/lib/db/client";
import { EmailDeliveryError } from "@/lib/email/email.types";
import { getEmailConfig } from "@/lib/email/email.config";
import { sendEmail } from "@/lib/email/email.service";
import { resetPasswordSuccessTemplate } from "@/lib/email/templates/auth/reset-password-success.template";

const invalidTokenResponse = {
    error: "The password reset link is invalid or has expired.",
};
const MAX_BCRYPT_PASSWORD_BYTES = 72;

interface ResetPasswordBody {
    token: string;
    password: string;
    confirmPassword: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset a password with an emailed token
 *     description: >
 *       Consumes the single-use token emailed by the forgot-password endpoint.
 *       Reset links expire after 30 minutes. Successful resets revoke all active sessions.
 *     operationId: resetPassword
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Single-use token from the password reset email.
 *                 example: 5q0dV0rHkA9I5w5YbG8x
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 72
 *                 description: New password, minimum 8 characters and maximum 72 UTF-8 bytes.
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 72
 *                 description: Must match password.
 *     responses:
 *       '200':
 *         description: Password updated; all active sessions were revoked.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successfully.
 *       '400':
 *         description: Invalid request, password mismatch, or invalid/expired/reused reset token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: The password reset link is invalid or has expired.
 *       '500':
 *         description: The password reset could not be completed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unable to reset password. Please try again.
 */
export const POST = async (request: Request): Promise<NextResponse> => {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return jsonResponse({ error: "Request body must be valid JSON." }, 400);
    }

    if (
        !isRecord(body) ||
        typeof body.token !== "string" ||
        typeof body.password !== "string" ||
        typeof body.confirmPassword !== "string"
    ) {
        return jsonResponse(
            { error: "Token, password and confirm password are required." },
            400,
        );
    }

    const resetBody: ResetPasswordBody = {
        token: body.token.trim(),
        password: body.password,
        confirmPassword: body.confirmPassword,
    };

    if (!resetBody.token || resetBody.token.length > 128) {
        return jsonResponse(invalidTokenResponse, 400);
    }

    if (
        resetBody.password.length < 8 ||
        Buffer.byteLength(resetBody.password, "utf8") > MAX_BCRYPT_PASSWORD_BYTES
    ) {
        return jsonResponse(
            {
                error:
                    "Password must be at least 8 characters and no more than 72 UTF-8 bytes.",
            },
            400,
        );
    }

    if (resetBody.password !== resetBody.confirmPassword) {
        return jsonResponse(
            { error: "Password and confirm password do not match." },
            400,
        );
    }

    try {
        const passwordHash = await bcrypt.hash(resetBody.password, 12);
        const pool = getPostgresPool();
        const client = await pool.connect();
        let transactionOpen = false;
        let resetUser: {
            id: string;
            email: string;
            first_name: string;
        } | null = null;

        try {
            await client.query("BEGIN");
            transactionOpen = true;

            const tokenResult = await client.query<{
                id: string;
                user_id: string;
                email: string;
                first_name: string;
            }>(
                `SELECT reset_token.id, reset_token.user_id, user_account.email,
                        user_account.first_name
                 FROM auth.password_reset_tokens AS reset_token
                 JOIN core.users AS user_account
                   ON user_account.id = reset_token.user_id
                 WHERE reset_token.token_hash = $1
                   AND reset_token.used_at IS NULL
                   AND reset_token.expires_at > NOW()
                   AND user_account.status = 'ACTIVE'
                 FOR UPDATE OF reset_token`,
                [hashPasswordResetToken(resetBody.token)],
            );
            const tokenRecord = tokenResult.rows[0];

            if (!tokenRecord) {
                await client.query("ROLLBACK");
                transactionOpen = false;
                return jsonResponse(invalidTokenResponse, 400);
            }

            resetUser = {
                id: tokenRecord.user_id,
                email: tokenRecord.email,
                first_name: tokenRecord.first_name,
            };

            await client.query(
                `UPDATE core.users
                 SET password_hash = $1, updated_at = NOW()
                 WHERE id = $2`,
                [passwordHash, tokenRecord.user_id],
            );
            await client.query(
                `UPDATE auth.password_reset_tokens
                 SET used_at = NOW()
                 WHERE user_id = $1 AND used_at IS NULL`,
                [tokenRecord.user_id],
            );
            await client.query(
                `UPDATE auth.sessions
                 SET revoked_at = NOW()
                 WHERE user_id = $1 AND revoked_at IS NULL`,
                [tokenRecord.user_id],
            );
            await client.query("COMMIT");
            transactionOpen = false;
        } catch (error) {
            if (transactionOpen) {
                await client.query("ROLLBACK");
            }
            throw error;
        } finally {
            client.release();
        }

        if (!resetUser) {
            throw new Error("Reset completed without a user record.");
        }

        try {
            const emailConfig = getEmailConfig();
            const template = resetPasswordSuccessTemplate({
                recipientName: resetUser.first_name,
                signInUrl: new URL("/login", emailConfig.appUrl).toString(),
            });
            const delivery = await sendEmail({
                to: resetUser.email,
                subject: template.subject,
                html: template.html,
                text: template.text,
            });

            if (
                !delivery.accepted.some(
                    (recipient) =>
                        recipient.toLowerCase() === resetUser?.email.toLowerCase(),
                )
            ) {
                throw new EmailDeliveryError(
                    "Password change notification was not accepted.",
                    "RECIPIENT_REJECTED",
                );
            }
        } catch (error) {
            console.error(
                "[Reset Password] Notification delivery failed",
                error instanceof EmailDeliveryError ? error.code : "UNKNOWN",
            );
        }

        const response = jsonResponse({
            message: "Password reset successfully.",
        });
        response.cookies.delete(ACCESS_TOKEN_COOKIE);
        return response;
    } catch (error) {
        console.error("[Reset Password] Request failed", error);
        return jsonResponse(
            { error: "Unable to reset password. Please try again." },
            500,
        );
    }
};
