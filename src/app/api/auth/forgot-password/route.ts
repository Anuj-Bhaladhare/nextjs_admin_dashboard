
import { EmailDeliveryError } from "@/lib/email/email.types";
import { getEmailConfig } from "@/lib/email/email.config";
import { sendEmail } from "@/lib/email/email.service";
import { forgotPasswordTemplate } from "@/lib/email/templates/auth/forgot-password.template";
import {
    createPasswordResetToken,
    PASSWORD_RESET_TOKEN_TTL_MINUTES,
} from "@/lib/auth/password-reset-token";
import { getPostgresPool } from "@/lib/db/client";
import { jsonResponse } from "@/app/api/jsonResponse";
import { NextResponse } from "next/server";

const genericResponse = {
    message:
        "If an active account exists for this email, password reset instructions will be sent.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request a password reset link
 *     description: >
 *       Sends a single-use reset link to the email address of an active account.
 *       The link expires after 30 minutes. The response is the same whether or
 *       not an active account exists, to prevent account enumeration.
 *     operationId: requestPasswordReset
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 255
 *                 description: Email address associated with the account.
 *                 example: user@example.com
 *     responses:
 *       '202':
 *         description: Request accepted. The response does not reveal whether the account exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: If an active account exists for this email, password reset instructions will be sent.
 *       '400':
 *         description: Invalid JSON body or email address.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Please provide a valid email address.
 *       '500':
 *         description: The reset request could not be processed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unable to process the password reset request.
 */
export const POST = async (request: Request): Promise<NextResponse> => {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return jsonResponse({ error: "Request body must be valid JSON." }, 400);
    }

    if (!isRecord(body) || typeof body.email !== "string") {
        return jsonResponse({ error: "A valid email address is required." }, 400);
    }

    const email = body.email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || email.length > 255 || !emailPattern.test(email)) {
        return jsonResponse({ error: "Please provide a valid email address." }, 400);
    }

    try {
        const pool = getPostgresPool();
        const userResult = await pool.query<{
            id: string;
            email: string;
            first_name: string;
        }>(
            `SELECT id, email, first_name
             FROM core.users
             WHERE LOWER(email) = $1
               AND status = 'ACTIVE'
             LIMIT 1`,
            [email],
        );
        const user = userResult.rows[0];

        if (!user) {
            return jsonResponse(genericResponse, 202);
        }

        const { token, tokenHash } = createPasswordResetToken();
        const client = await pool.connect();

        try {
            await client.query("BEGIN");
            await client.query(
                `UPDATE auth.password_reset_tokens
                 SET used_at = NOW()
                 WHERE user_id = $1 AND used_at IS NULL`,
                [user.id],
            );
            await client.query(
                `INSERT INTO auth.password_reset_tokens
                    (user_id, token_hash, expires_at)
                 VALUES ($1, $2, NOW() + ($3::int * INTERVAL '1 minute'))`,
                [user.id, tokenHash, PASSWORD_RESET_TOKEN_TTL_MINUTES],
            );
            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }

        try {
            const emailConfig = getEmailConfig();
            const resetUrl = new URL("/reset-password", emailConfig.appUrl);
            resetUrl.searchParams.set("token", token);
            const template = forgotPasswordTemplate({
                recipientName: user.first_name,
                resetUrl: resetUrl.toString(),
                expiresInMinutes: PASSWORD_RESET_TOKEN_TTL_MINUTES,
            });
            const delivery = await sendEmail({
                to: user.email,
                subject: template.subject,
                html: template.html,
                text: template.text,
            });

            if (
                !delivery.accepted.some(
                    (recipient) =>
                        recipient.toLowerCase() === user.email.toLowerCase(),
                )
            ) {
                throw new EmailDeliveryError(
                    "Reset email was not accepted by the provider.",
                    "RECIPIENT_REJECTED",
                );
            }
        } catch (error) {
            console.error(
                "[Forgot Password] Reset email delivery failed",
                error instanceof EmailDeliveryError ? error.code : "UNKNOWN",
            );

            try {
                await pool.query(
                    `UPDATE auth.password_reset_tokens
                     SET used_at = NOW()
                     WHERE token_hash = $1 AND used_at IS NULL`,
                    [tokenHash],
                );
            } catch (cleanupError) {
                console.error(
                    "[Forgot Password] Failed to invalidate undelivered token",
                    cleanupError,
                );
            }
        }

        return jsonResponse(genericResponse, 202);
    } catch (error) {
        console.error("[Forgot Password] Request failed", error);

        return jsonResponse(
            {
                error: "Unable to process the password reset request.",
            },
            500,
        );
    }
};
