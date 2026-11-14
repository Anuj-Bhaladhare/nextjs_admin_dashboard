
import "server-only";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "./cookie";
import { getPostgresPool } from "@/lib/db/client";
import { verifyAccessToken } from "./jwt";

export function hashAccessToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

export async function getCurrentUser() {
    const cookieStore = await cookies();

    const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

    console.log("Token:", token);

    if (!token) {
        return null;
    }

    const payload = await verifyAccessToken(token);

    if (!payload) {
        return null;
    }

    const result = await getPostgresPool().query<{ user_role: string }>(
        `SELECT roles.name AS user_role
         FROM auth.sessions AS auth_session
         JOIN core.users AS users ON users.id = auth_session.user_id
         JOIN rbac.user_roles AS user_roles
           ON user_roles.user_id = users.id
          AND user_roles.role_id = $4
          AND user_roles.organization_id IS NOT DISTINCT FROM $5::uuid
          AND user_roles.is_active = TRUE
          AND (user_roles.expires_at IS NULL OR user_roles.expires_at > NOW())
         JOIN rbac.roles AS roles
           ON roles.id = user_roles.role_id
          AND roles.is_active = TRUE
         WHERE auth_session.id = $1
           AND auth_session.user_id = $2
           AND auth_session.token_hash = $3
           AND auth_session.revoked_at IS NULL
           AND auth_session.expires_at > NOW()
           AND users.status = 'ACTIVE'`,
        [
            payload.sessionId,
            payload.userId,
            hashAccessToken(token),
            payload.roleId,
            payload.organizationId,
        ],
    );

    if (result.rowCount !== 1 || !result.rows[0]?.user_role) {
        return null;
    }

    return {
        id: payload.userId,
        role: result.rows[0].user_role,
        organization_id: payload.organizationId,
        sessionId: payload.sessionId,
        roleId: payload.roleId
    };
}
