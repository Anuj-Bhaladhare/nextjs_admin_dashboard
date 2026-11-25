import { NextResponse, NextRequest } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getCurrentUser } from "@/lib/auth/session";
import { getPostgresPool } from "@/lib/db/client";

/**
 * @swagger
 * /api/organizations/{organizationId}/status:
 *   patch:
 *     tags:
 *       - Organizations Management
 *     summary: Update organization status
 *     description: Updates the status of an organization. The authenticated user must have active membership in it.
 *     operationId: updateOrganizationStatus
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *                 description: New organization status.
 *                 example: INACTIVE
 *     responses:
 *       '200':
 *         description: Organization status updated successfully.
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
 *                   example: Organization status updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     code:
 *                       type: string
 *                     description:
 *                       type: [string, 'null']
 *                     status:
 *                       type: string
 *                       enum: [ACTIVE, INACTIVE, SUSPENDED]
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: Organization ID is missing, status is invalid, or the update could not be completed.
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
 *                   examples:
 *                     - Organization status must be one of ACTIVE, INACTIVE, or SUSPENDED.
 *                     - Organization status could not be updated.
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
 *         description: Invalid JSON body or an unexpected server error prevented the status from being updated.
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
const pool = getPostgresPool();

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

const update_DB_Status = async (id: string, status: string) => {
    try {
        const response = await pool.query(
            `
                UPDATE core.organizations
                SET status = $1,
                    updated_at = NOW()
                WHERE id = $2
                RETURNING *;
            `,
            [status, id]
        );

        if (response?.rows?.length === 0 || response?.rowCount === 0) {
            return null;
        }

        return response.rows[0];
    } catch (error) {
        throw error;
    }
};

export const PATCH = async (
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

        let body: { status: string };
        try {
            body = await request.json();
        } catch (e) {
            throw e;
        }

        const { status } = body;
        if (!status || !["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
            return jsonResponse(
                {
                    status: false,
                    message: "Organization status must be one of ACTIVE, INACTIVE, or SUSPENDED."
                },
                400
            );
        }

        const result = await update_DB_Status(organizationId, status);
        if (!result) {
            return jsonResponse(
                {
                    status: false,
                    message: "Organization status could not be updated."
                },
                400
            );
        }

        return jsonResponse(
            {
                status: true,
                message: "Organization status updated successfully",
                data: result
            },
            200
        );
    } catch (error) {
        console.error("PATCH /api/organizations/{organizationId}/status error: ", error);
        return jsonResponse(
            {
                status: false,
                message: "Internal Server Error",
            },
            500
        );
    }
};
