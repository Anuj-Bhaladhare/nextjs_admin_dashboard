
import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";


// View users assigned to role
/**
 * @swagger
 * /api/rbac/roles/{roleId}/users:
 *   get:
 *     tags: [RBAC]
 *     summary: View users assigned to a role
 *     operationId: listRbacRoleUsers
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Users assigned to the role retrieved successfully.
 *       '404':
 *         description: Role not found.
 *       '500':
 *         description: Internal server error.
 */
export const GET = async () => {
    try {

        console.log("View users assigned to role");

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
