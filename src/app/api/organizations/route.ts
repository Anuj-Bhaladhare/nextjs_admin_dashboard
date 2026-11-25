import { NextResponse, NextRequest } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getCurrentUser } from "@/lib/auth/session";
import { OrganizationBody } from "./organizations.types";
import OrganizationRepository from "./organizations.repository";

const [{ getOrganization, createOrganization }] = OrganizationRepository();

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     tags:
 *       - Organizations Management
 *     summary: List organizations
 *     description: Returns all organizations and their member counts.
 *     operationId: listOrganizations
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       '200':
 *         description: Organizations retrieved successfully.
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
 *                   example: Organizations retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                       description:
 *                         type: [string, 'null']
 *                       status:
 *                         type: string
 *                         enum: [ACTIVE, INACTIVE, SUSPENDED]
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       members:
 *                         type: integer
 *                         description: Number of users associated with the organization.
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
 *       '404':
 *         description: No organizations were found.
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
 *                   example: No organizations found for this user.
 *       '500':
 *         description: An unexpected server error prevented organizations from being retrieved.
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
export const GET = async (): Promise<NextResponse> => {
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

        const result = await getOrganization();

        if (Array.isArray(result) && result.length > 0) {
            return jsonResponse(
                {
                    status: true,
                    message: "Organizations retrieved successfully",
                    data: result
                },
                200
            );
        }

        return jsonResponse(
            {
                status: false,
                message: "No organizations found for this user."
            },
            404
        );
    } catch (error) {
        console.error("GET /api/organizations error: ", error);
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
 * /api/organizations:
 *   post:
 *     tags:
 *       - Organizations Management
 *     summary: Create an organization
 *     description: Creates an organization and adds the authenticated user as an active member.
 *     operationId: createOrganization
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - description
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 200
 *                 description: Organization name.
 *                 example: Acme Security
 *               code:
 *                 type: string
 *                 maxLength: 80
 *                 description: Unique organization code.
 *                 example: ACME-001
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 description: Organization description.
 *                 example: Acme Security regional operations.
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *                 example: ACTIVE
 *     responses:
 *       '201':
 *         description: Organization created successfully.
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
 *                   example: Organization created successfully
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
 *         description: Required organization details are missing or the organization could not be created.
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
 *                     - Please provide organization details to create organization.
 *                     - Organization could not be created.
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
 *       '500':
 *         description: Invalid JSON body or an unexpected server error prevented organization creation.
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
export const POST = async (
    request: NextRequest
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

        let org_body: OrganizationBody;
        try {
            org_body = await request.json();
        } catch (e) {
            throw e;
        }

        const { name, code, description, status } = org_body;

        if (!name || !code || !description || !status) {
            return jsonResponse(
                {
                    status: false,
                    message: "Please provide organization details to create organization."
                },
                400
            );
        }

        const org_result = await createOrganization(
            { name, code, description, status },
            user.id
        );

        if (org_result) {
            return jsonResponse(
                {
                    status: true,
                    message: "Organization created successfully",
                    data: org_result
                },
                201
            );
        }

        return jsonResponse(
            {
                status: false,
                message: "Organization could not be created."
            },
            400
        );
    } catch (error) {
        console.error("POST /api/organizations error: ", error);
        return jsonResponse(
            {
                status: false,
                message: "Internal Server Error",
            },
            500
        );
    }
};
