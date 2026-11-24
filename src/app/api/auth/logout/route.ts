import { NextRequest, NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookie";
import { hashAccessToken } from "@/lib/auth/session";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getPostgresPool } from "@/lib/db/client";

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Log out the current session
 *     description: >
 *       Revokes the session associated with the access_token cookie when the
 *       cookie contains a valid token. A missing or invalid token still
 *       returns success. The access_token cookie is cleared in every response.
 *     operationId: logoutUser
 *     responses:
 *       '200':
 *         description: Logout completed and the access_token cookie was cleared.
 *         headers:
 *           Set-Cookie:
 *             description: Clears the access_token cookie.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout successful.
 *       '500':
 *         description: The session could not be revoked. The access_token cookie is still cleared.
 *         headers:
 *           Set-Cookie:
 *             description: Clears the access_token cookie.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unable to revoke the session.
 */
export async function POST(request: NextRequest) {
    let response: NextResponse;

    try {
        const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

        if (token) {
            const payload = await verifyAccessToken(token);

            if (payload) {
                await getPostgresPool().query(
                    `UPDATE auth.sessions
                     SET revoked_at = COALESCE(revoked_at, NOW())
                     WHERE id = $1
                       AND user_id = $2
                       AND token_hash = $3`,
                    [payload.sessionId, payload.userId, hashAccessToken(token)],
                );
            }
        }

        response = NextResponse.json({ status: true, message: "Logout successful." });
    } catch (error) {
        console.error("Session revocation failed:", error);
        response = NextResponse.json(
            { status: false, message: "Unable to revoke the session." },
            { status: 500 },
        );
    }

    response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
    });

    return response;
}
