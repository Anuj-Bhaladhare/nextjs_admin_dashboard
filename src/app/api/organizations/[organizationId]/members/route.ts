import { NextResponse, NextRequest } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";

const pool = getPostgresPool();

export interface OrganizationMember {
    id: string;
    first_name: string;
    last_name: string | null;
    username: string | null;
    email: string;
    mobile: string | null;
    status: string;
    email_verified_at: Date | null;
    mobile_verified_at: Date | null;
    last_login_at: Date | null;
    created_at: Date;
    updated_at: Date;
}


// Get organization members
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ organizationId: string }> }
): Promise<NextResponse> {
    try {

        const { organizationId } = await params;

        const result = await pool.query(
            `SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.username,
                u.email,
                u.mobile,
                u.status,
                u.email_verified_at,
                u.mobile_verified_at,
                u.last_login_at,
                u.created_at,
                u.updated_at
            FROM core.users u
            INNER JOIN core.user_organizations uo
                ON uo.user_id = u.id
            WHERE
                uo.organization_id = $1
                AND uo.membership_status = 'ACTIVE'
            ORDER BY u.created_at DESC;`,
            [organizationId]
        );

        return jsonResponse(
            {
                status: true,
                message: "Organization members fetched successfully",
                data: result.rows,
            },
            200
        );

    } catch (error) {

        console.error(
            "GET /api/organizations/{organizationId} error:",
            error
        );

        return jsonResponse(
            {
                status: false,
                message: "Internal Server Error",
            },
            500
        );
    }
}
