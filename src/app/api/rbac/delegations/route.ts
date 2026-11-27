import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";


// List delegation rules
/**
 * @swagger
 * /api/rbac/delegations:
 *   get:
 *     tags: [RBAC]
 *     summary: List delegation rules
 *     operationId: listRbacDelegations
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       '200':
 *         description: Delegation rules retrieved successfully.
 *       '500':
 *         description: Internal server error.
 */
export const GET = async () => {
    try {

        console.log("List delegation rules");

    } catch (error) {
        console.error("Internal Server Error", error);
        return jsonResponse(
            {
                status: false,
                message: "Internal Server Error"
            }, 
            500
        );
    }
}


// Create a delegation rule
/**
 * @swagger
 * /api/rbac/delegations:
 *   post:
 *     tags: [RBAC]
 *     summary: Create a delegation rule
 *     operationId: createRbacDelegation
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       '201':
 *         description: Delegation rule created successfully.
 *       '400':
 *         description: Invalid delegation rule.
 *       '500':
 *         description: Internal server error.
 */
export const POST = async () => {
    try {

        console.log("Create a delegation rule");

    } catch (error) {
        console.error("Internal Server Error", error);
        return jsonResponse(
            {
                status: false,
                message: "Internal Server Error"
            }, 
            500
        );
    }
}
