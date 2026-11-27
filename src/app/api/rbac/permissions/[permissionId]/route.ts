import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";


// Get permission details
/**
 * @swagger
 * /api/rbac/permissions/{permissionId}:
 *   get:
 *     tags: [RBAC]
 *     summary: Get permission details
 *     operationId: getRbacPermission
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
 *         description: Permission details retrieved successfully.
 *       '404':
 *         description: Permission not found.
 *       '500':
 *         description: Internal server error.
 */
export const GET = async () => {
    try {

        console.log("Get permission details");

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


// Update permission metadata
/**
 * @swagger
 * /api/rbac/permissions/{permissionId}:
 *   patch:
 *     tags: [RBAC]
 *     summary: Update permission metadata
 *     operationId: updateRbacPermission
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionId
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
 *         description: Permission metadata updated successfully.
 *       '400':
 *         description: Invalid permission metadata.
 *       '404':
 *         description: Permission not found.
 *       '500':
 *         description: Internal server error.
 */
export const PATCH = async () => {
    try {

        console.log("Update permission metadata");

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
