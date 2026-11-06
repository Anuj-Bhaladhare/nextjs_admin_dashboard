
import "server-only";

import { cookies } from "next/headers";
import { verifyAccessToken } from "./jwt";

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();

        const token = cookieStore.get("access_token")?.value;

        if (!token) {
            return null;
        }

        const payload = await verifyAccessToken(token);

        if (!payload) {
            return null;
        }

        return {
            id: payload.userId,
            role: payload.userRole,
        };

    } catch (error) {
        console.error("getCurrentUser error:", error);
        return null;
    }
}
