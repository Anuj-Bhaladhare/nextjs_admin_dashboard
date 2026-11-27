import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";


// Get grant detail
/**
 * @swagger
 * /api/rbac/permission-grants/{grantId}:
 *   get:
 *     tags: [RBAC]
 *     summary: Get permission grant details
 *     operationId: getRbacPermissionGrant
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: grantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Permission grant retrieved successfully.
 *       '404':
 *         description: Permission grant not found.
 *       '500':
 *         description: Internal server error.
 */
export const GET = async () => {
    try {

        console.log("Get grant detail");

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


// Remove permission grant
/**
 * @swagger
 * /api/rbac/permission-grants/{grantId}:
 *   delete:
 *     tags: [RBAC]
 *     summary: Remove a permission grant
 *     operationId: deleteRbacPermissionGrant
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: grantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Permission grant removed successfully.
 *       '404':
 *         description: Permission grant not found.
 *       '500':
 *         description: Internal server error.
 */
export const DELETE = async () => {
    try {

        console.log("Remove permission grant");

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
