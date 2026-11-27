import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";


// Remove one permission
/**
 * @swagger
 * /api/rbac/roles/{roleId}/permissions/{permissionId}:
 *   delete:
 *     tags: [RBAC]
 *     summary: Remove one permission from a role
 *     operationId: removeRbacRolePermission
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Permission removed from the role successfully.
 *       '404':
 *         description: Role or permission not found.
 *       '500':
 *         description: Internal server error.
 */
export const DELETE = async () => {
    try {

        console.log("Remove one permission");

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