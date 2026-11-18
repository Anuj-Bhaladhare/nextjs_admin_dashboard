import { jsonResponse } from "@/app/api/jsonResponse";
import { getCurrentUser } from "@/lib/auth/session";
import { getPostgresPool } from "@/lib/db/client";
import { NextRequest, NextResponse } from "next/server";
import { ParamsData, OrganizationData } from "./types";
import OrganizationDetailsRepository from "./repository";

const pool = getPostgresPool();
const [{ getOrganizationDetails, updateOrganizationDetails }] = OrganizationDetailsRepository();

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

// Get organization details
export const GET = async (
    request: NextRequest,
    { params }: { params: Promise<ParamsData> }
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
                    message: "Provide Organization Id In Params"
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

        const result = await getOrganizationDetails({ id: organizationId });

        if (!result) {
            return jsonResponse(
                {
                    status: false,
                    message: `Organization of ${organizationId} is Not Found...!`,
                    organizationId: organizationId
                },
                404
            );
        }

        return jsonResponse(
            {
                status: true,
                message: "Organization Details Get Successfully",
                data: result
            },
            200
        );
    } catch (error) {
        console.error("GET /api/organizations/{organizationId} error: ", error);
        return jsonResponse(
            {
                status: false,
                message: "Internal Server Error",
            },
            500
        );
    }
};

// Update organization
export const PATCH = async (
    request: NextRequest,
    { params }: { params: Promise<ParamsData> }
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

        let org_body: Partial<OrganizationData>;
        try {
            org_body = await request.json();
        } catch (e) {
            throw e;
        }

        const { name, code, description, status } = org_body;
        if (!name && !code && !description && !status) {
            return jsonResponse(
                {
                    status: false,
                    message: "No organization fields were provided for update."
                },
                400
            );
        }

        const org_result = await updateOrganizationDetails({
            id: organizationId,
            name: name ?? null,
            code: code ?? null,
            description: description ?? null,
            status: status ?? null,
        });

        if (org_result) {
            return jsonResponse(
                {
                    status: true,
                    message: "Organization updated successfully",
                    data: org_result
                },
                200
            );
        }

        return jsonResponse(
            {
                status: false,
                message: "Organization could not be updated."
            },
            404
        );
    } catch (error) {
        console.error("PATCH /api/organizations/{organizationId} error: ", error);
        return jsonResponse(
            {
                status: false,
                message: "Internal Server Error",
            },
            500
        );
    }
};
