import { NextResponse, NextRequest } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getCurrentUser } from "@/lib/auth/session";
import { getPostgresPool } from "@/lib/db/client";

const pool = getPostgresPool();

/**
 * @swagger
 * /api/organizations/{organizationId}/members:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: List organization members
 *     description: Returns active members of the organization. The authenticated user must have active membership in it.
 *     operationId: listOrganizationMembers
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         description: UUID of the organization.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Organization members fetched successfully.
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
 *                   example: Organization members fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: [string, 'null']
 *                       username:
 *                         type: [string, 'null']
 *                       email:
 *                         type: string
 *                         format: email
 *                       mobile:
 *                         type: [string, 'null']
 *                       status:
 *                         type: string
 *                         enum: [INVITED, ACTIVE, SUSPENDED, DISABLED, LOCKED]
 *                       email_verified_at:
 *                         type: [string, 'null']
 *                         format: date-time
 *                       mobile_verified_at:
 *                         type: [string, 'null']
 *                         format: date-time
 *                       last_login_at:
 *                         type: [string, 'null']
 *                         format: date-time
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       '400':
 *         description: Organization ID is required.
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
 *                   example: Organization id is required.
 *       '401':
 *         description: Authentication is required.
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
 *                   example: Unauthorized.
 *       '403':
 *         description: The authenticated user does not have active access to this organization.
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
 *                   example: 'Forbidden: user does not have access to this organization.'
 *       '500':
 *         description: An unexpected server error prevented members from being retrieved.
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
 *                   example: Internal Server Error
 */
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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ organizationId: string }> }
): Promise<NextResponse> {
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
                    message: "Organization id is required."
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
            "GET /api/organizations/{organizationId}/members error:",
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
