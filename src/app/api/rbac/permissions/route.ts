import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";


// List permissions
/**
 * @swagger
 * /api/rbac/permissions:
 *   get:
 *     tags: [RBAC]
 *     summary: List permissions
 *     operationId: listRbacPermissions
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       '200':
 *         description: Permissions retrieved successfully.
 *       '500':
 *         description: Internal server error.
 */
export const GET = async () => {
    try {

        console.log("List permissions");

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


// Create permission
/**
 * @swagger
 * /api/rbac/permissions:
 *   post:
 *     tags: [RBAC]
 *     summary: Create a permission
 *     operationId: createRbacPermission
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
 *         description: Permission created successfully.
 *       '400':
 *         description: Invalid permission data.
 *       '500':
 *         description: Internal server error.
 */
export const POST = async () => {
    try {

        console.log("Create permission");

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
