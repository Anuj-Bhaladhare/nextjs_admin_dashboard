
import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";


// Activate/deactivate role
/**
 * @swagger
 * /api/rbac/roles/{roleId}/status:
 *   patch:
 *     tags: [RBAC]
 *     summary: Activate or deactivate a role
 *     operationId: updateRbacRoleStatus
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
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
 *         description: Role status updated successfully.
 *       '400':
 *         description: Invalid status.
 *       '404':
 *         description: Role not found.
 *       '500':
 *         description: Internal server error.
 */
export const PATCH = async () => {
    try {

        console.log("Activate/deactivate role");

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
