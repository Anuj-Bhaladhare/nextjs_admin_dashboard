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

/**
 * @swagger
 * /api/organizations/{organizationId}:
 *   parameters:
 *     - in: path
 *       name: organizationId
 *       required: true
 *       description: UUID of the organization.
 *       schema:
 *         type: string
 *         format: uuid
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get organization details
 *     description: >
 *       Returns organization details for the specified organization. The
 *       authenticated user must have active membership in the organization.
 *     operationId: getOrganizationDetails
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       '200':
 *         description: Organization details retrieved successfully.
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
 *                   example: Organization Details Get Successfully
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
 *         description: Organization ID is missing.
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
 *                   example: Provide Organization Id In Params
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
 *       '404':
 *         description: Organization was not found.
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
 *                   example: Organization was not found.
 *                 organizationId:
 *                   type: string
 *                   format: uuid
 *       '500':
 *         description: An unexpected server error prevented the organization from being retrieved.
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


/**
 * @swagger
 * /api/organizations/{organizationId}:
 *   parameters:
 *     - in: path
 *       name: organizationId
 *       required: true
 *       description: UUID of the organization.
 *       schema:
 *         type: string
 *         format: uuid
 *   patch:
 *     tags:
 *       - Organizations
 *     summary: Update organization details
 *     description: >
 *       Updates one or more organization fields. The authenticated user must
 *       have active membership in the organization. Omitted or null fields
 *       are left unchanged.
 *     operationId: updateOrganizationDetails
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 200
 *                 description: Updated organization name.
 *                 example: Acme Security
 *               code:
 *                 type: string
 *                 maxLength: 80
 *                 description: Updated unique organization code.
 *                 example: ACME-001
 *               description:
 *                 type: [string, 'null']
 *                 description: Updated description; null leaves the existing value unchanged.
 *                 example: Updated regional operations.
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *                 description: Updated organization status.
 *                 example: ACTIVE
 *     responses:
 *       '200':
 *         description: Organization updated successfully.
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
 *                   example: Organization updated successfully
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
 *         description: Organization ID is missing or no update fields were provided.
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
 *                   example: No organization fields were provided for update.
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
 *       '404':
 *         description: Organization could not be updated or was not found.
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
 *                   example: Organization could not be updated.
 *       '500':
 *         description: Invalid JSON body or an unexpected server error prevented the update.
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
