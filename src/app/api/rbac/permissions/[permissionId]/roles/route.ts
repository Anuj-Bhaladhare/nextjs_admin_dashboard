



import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";


// Get roles containing permission
/**
 * @swagger
 * /api/rbac/permissions/{permissionId}/roles:
 *   get:
 *     tags: [RBAC]
 *     summary: Get roles containing a permission
 *     operationId: getRbacPermissionRoles
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Roles containing the permission retrieved successfully.
 *       '404':
 *         description: Permission not found.
 *       '500':
 *         description: Internal server error.
 */
export const GET = async () => {
    try {

        console.log("Get roles containing permission");

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