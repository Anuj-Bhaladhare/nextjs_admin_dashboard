import { NextResponse, NextRequest } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";

const pool = getPostgresPool();

// Get organization statistics
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ organizationId: string }> }
): Promise<NextResponse> {
    try {
        const { organizationId } = await params;

        // Get organization statistics
        const result = await pool.query(
            `SELECT
                COUNT(*) AS total_members,

                COUNT(*) FILTER (
                    WHERE uo.membership_status = 'ACTIVE'
                ) AS active_members,

                COUNT(*) FILTER (
                    WHERE uo.membership_status = 'INACTIVE'
                ) AS inactive_members,

                COUNT(*) FILTER (
                    WHERE uo.membership_status = 'SUSPENDED'
                ) AS suspended_members,

                COUNT(*) FILTER (
                    WHERE u.status = 'ACTIVE'
                ) AS active_users,

                COUNT(*) FILTER (
                    WHERE u.status = 'INVITED'
                ) AS invited_users,

                COUNT(*) FILTER (
                    WHERE u.status = 'DISABLED'
                ) AS disabled_users,

                COUNT(*) FILTER (
                    WHERE u.status = 'LOCKED'
                ) AS locked_users

            FROM core.user_organizations uo

            INNER JOIN core.users u
                ON u.id = uo.user_id

            WHERE uo.organization_id = $1`,
            [organizationId]
        );

        const statistics = result.rows[0];

        return jsonResponse(
            {
                status: true,
                message: "Organization statistics fetched successfully",
                data: {
                    total_members: Number(statistics.total_members),
                    active_members: Number(statistics.active_members),
                    inactive_members: Number(statistics.inactive_members),
                    suspended_members: Number(statistics.suspended_members),

                    active_users: Number(statistics.active_users),
                    invited_users: Number(statistics.invited_users),
                    disabled_users: Number(statistics.disabled_users),
                    locked_users: Number(statistics.locked_users),
                },
            },
            200
        );

    } catch (error) {
        console.error(
            "GET /api/organizations/{organizationId}/statistics error:",
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
