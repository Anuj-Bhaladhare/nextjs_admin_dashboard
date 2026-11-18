import { NextResponse, NextRequest } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getCurrentUser } from "@/lib/auth/session";
import { getPostgresPool } from "@/lib/db/client";

const pool = getPostgresPool();

interface OrganizationSettings {
    id: string;
    setting_key: string;
    setting_value: Record<string, unknown>;
}

const ensureOrganizationAccess = async (userId: string, organizationId: string) => {
    const access = await pool.query(
        `
            SELECT 1
            FROM core.user_organizations
            WHERE user_id = $1
              AND organization_id = $2
              AND membership_status = 'ACTIVE'
            LIMIT 1;
        `,
        [userId, organizationId]
    );

    return access.rowCount !== null && access.rowCount > 0;
};

const updateOrganizationSetting = async ({
    organization_id,
    setting_key,
    setting_value,
}: {
    organization_id: string;
    setting_key: string;
    setting_value: Record<string, unknown>;
}) => {
    try {
        const response = await pool.query(
            `
                INSERT INTO core.organization_settings
                    (organization_id, setting_key, setting_value)
                VALUES
                    ($1, $2, $3)
                ON CONFLICT (organization_id, setting_key)
                DO UPDATE SET
                    setting_value = EXCLUDED.setting_value,
                    updated_at = NOW()
                RETURNING *;
            `,
            [organization_id, setting_key, setting_value]
        );

        if (response?.rows?.length === 0 || response?.rowCount === 0) {
            return null;
        }

        return response.rows[0];
    } catch (error) {
        throw error;
    }
};

const getOrganizationSetting = async (organizationId: string) => {
    try {
        const response = await pool.query(
            `
                SELECT *
                FROM core.organization_settings
                WHERE organization_id = $1;
            `,
            [organizationId]
        );

        if (response?.rows?.length === 0 || response?.rowCount === 0) {
            return null;
        }

        return response.rows;
    } catch (error) {
        throw error;
    }
};

export const GET = async (
    request: NextRequest,
    { params }: { params: Promise<{ organizationId: string }> }
): Promise<NextResponse> => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return jsonResponse(
                {
                    status: false,
                    message: "Unauthorized."
                },
                401
            );
        }

        const { organizationId } = await params;
        if (!organizationId) {
            return jsonResponse(
                {
                    status: false,
                    message: "Organizations id Not Found id Params"
                },
                400
            );
        }

        const hasAccess = await ensureOrganizationAccess(user.id, organizationId);
        if (!hasAccess) {
            return jsonResponse(
                {
                    status: false,
                    message: "Forbidden: user does not have access to this organization."
                },
                403
            );
        }

        const result = await getOrganizationSetting(organizationId);
        if (!result) {
            return jsonResponse(
                {
                    status: false,
                    message: "Organization settings are not found."
                },
                404
            );
        }

        return jsonResponse(
            {
                status: true,
                message: "Organization settings retrieved successfully",
                data: result
            },
            200
        );
    } catch (error) {
        console.error("GET /api/organizations/{organizationId}/settings error: ", error);
        return jsonResponse(
            {
                status: false, 
                message: "Internal Server Error",
            },
            500
        );
    }
};

export const PUT = async (
    request: NextRequest,
    { params }: { params: Promise<{ organizationId: string }> }
): Promise<NextResponse> => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return jsonResponse(
                {
                    status: false,
                    message: "Unauthorized."
                },
                401
            );
        }

        const { organizationId } = await params;
        if (!organizationId) {
            return jsonResponse(
                {
                    status: false,
                    message: "Organizations id Not Found id Params"
                },
                400
            );
        }

        const hasAccess = await ensureOrganizationAccess(user.id, organizationId);
        if (!hasAccess) {
            return jsonResponse(
                {
                    status: false,
                    message: "Forbidden: user does not have access to this organization."
                },
                403
            );
        }

        let body: OrganizationSettings;
        try {
            body = await request.json();
        } catch (e) {
            throw e;
        }

        const { setting_key, setting_value } = body;
        if (!setting_key || !setting_value) {
            return jsonResponse(
                {
                    status: false,
                    message: "Organization settings payload is incomplete."
                },
                400
            );
        }

        const result = await updateOrganizationSetting({
            organization_id: organizationId,
            setting_key,
            setting_value,
        });

        if (!result) {
            return jsonResponse(
                {
                    status: false,
                    message: "Organization setting could not be updated."
                },
                400
            );
        }

        return jsonResponse(
            {
                status: true,
                message: "Organization setting updated successfully",
                data: result
            },
            200
        );
    } catch (error) {
        console.error("PUT /api/organizations/{organizationId}/settings error: ", error);
        return jsonResponse(
            {
                status: false,
                message: "Internal Server Error",
            },
            500
        );
    }
};
