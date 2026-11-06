import { NextRequest, NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookie";
import { hashAccessToken } from "@/lib/auth/session";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getPostgresPool } from "@/lib/db/client";

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