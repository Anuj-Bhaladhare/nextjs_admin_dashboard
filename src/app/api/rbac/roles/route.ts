import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";


// List roles
/**
 * @swagger
 * /api/rbac/roles:
 *   get:
 *     tags: [RBAC]
 *     summary: List roles
 *     operationId: listRbacRoles
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       '200':
 *         description: Roles retrieved successfully.
 *       '500':
 *         description: Internal server error.
 */
export const GET = async () => {
    try {

        console.log("List roles");

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




// Create a role
/**
 * @swagger
 * /api/rbac/roles:
 *   post:
 *     tags: [RBAC]
 *     summary: Create a role
 *     operationId: createRbacRole
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
 *         description: Role created successfully.
 *       '400':
 *         description: Invalid role data.
 *       '500':
 *         description: Internal server error.
 */
export const POST = async () => {
    try {

        console.log("Create a role");

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