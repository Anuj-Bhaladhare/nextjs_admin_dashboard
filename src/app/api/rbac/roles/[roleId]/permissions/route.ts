
import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";


// List assigned permissions
/**
 * @swagger
 * /api/rbac/roles/{roleId}/permissions:
 *   get:
 *     tags: [RBAC]
 *     summary: List the role's direct permissions
 *     description: Covers both direct-permission and assigned-permission listings for this role.
 *     operationId: listRbacRolePermissions
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
 *         description: Role permissions retrieved successfully.
 *       '404':
 *         description: Role not found.
 *       '500':
 *         description: Internal server error.
 */
export const GET = async () => {
    try {

        console.log("List assigned permissions");

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



// Replace the role's permission set
/**
 * @swagger
 * /api/rbac/roles/{roleId}/permissions:
 *   put:
 *     tags: [RBAC]
 *     summary: Replace the role's permission set
 *     operationId: replaceRbacRolePermissions
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
 *         description: Role permission set replaced successfully.
 *       '400':
 *         description: Invalid permission set.
 *       '404':
 *         description: Role not found.
 *       '500':
 *         description: Internal server error.
 */
export const PUT = async () => {
    try {

        console.log("Replace the role's permission set");

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



// Add permissions to role
/**
 * @swagger
 * /api/rbac/roles/{roleId}/permissions:
 *   post:
 *     tags: [RBAC]
 *     summary: Add permissions to a role
 *     operationId: addRbacRolePermissions
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
 *         description: Permissions added to the role successfully.
 *       '400':
 *         description: Invalid permission data.
 *       '404':
 *         description: Role not found.
 *       '500':
 *         description: Internal server error.
 */
export const POST = async () => {
    try {

        console.log("Add permissions to role");

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












// // ==========================================================
// // Get direct permissions
// export const GET = async () => {
//     try {

//         console.log("Get direct permissions");

//     } catch (error) {
//         console.error("Internal Server Error", error);
//         return jsonResponse(
//             {
//                 status: false,
//                 message: "Internal Server Error"
//             }, 
//             500
//         );
//     }
// }



