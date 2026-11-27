import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";


// Get delegation detail
/**
 * @swagger
 * /api/rbac/delegations/{delegationId}:
 *   get:
 *     tags: [RBAC]
 *     summary: Get delegation rule details
 *     operationId: getRbacDelegation
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: delegationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Delegation rule retrieved successfully.
 *       '404':
 *         description: Delegation rule not found.
 *       '500':
 *         description: Internal server error.
 */
export const GET = async () => {
    try {

        console.log("Get delegation detail");

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


// Update delegation capabilities
/**
 * @swagger
 * /api/rbac/delegations/{delegationId}:
 *   patch:
 *     tags: [RBAC]
 *     summary: Update delegation capabilities
 *     operationId: updateRbacDelegation
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: delegationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       '200':
 *         description: Delegation capabilities updated successfully.
 *       '400':
 *         description: Invalid delegation capabilities.
 *       '404':
 *         description: Delegation rule not found.
 *       '500':
 *         description: Internal server error.
 */
export const PATCH = async () => {
    try {

        console.log("Update delegation capabilities");

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



// Remove delegation rule
/**
 * @swagger
 * /api/rbac/delegations/{delegationId}:
 *   delete:
 *     tags: [RBAC]
 *     summary: Remove a delegation rule
 *     operationId: deleteRbacDelegation
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: delegationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Delegation rule removed successfully.
 *       '404':
 *         description: Delegation rule not found.
 *       '500':
 *         description: Internal server error.
 */
export const DELETE = async () => {
    try {

        console.log("Remove delegation rule");

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

