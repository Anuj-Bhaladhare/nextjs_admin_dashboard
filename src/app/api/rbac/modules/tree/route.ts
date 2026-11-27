import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";


// Return hierarchical module tree
/**
 * @swagger
 * /api/rbac/modules/tree:
 *   get:
 *     tags: [RBAC]
 *     summary: Return the hierarchical module tree
 *     operationId: getRbacModuleTree
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       '200':
 *         description: Hierarchical module tree retrieved successfully.
 *       '500':
 *         description: Internal server error.
 */
export const GET = async () => {
    try {

        console.log("Return hierarchical module tree");

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
