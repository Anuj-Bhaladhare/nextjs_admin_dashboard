import { jsonResponse } from "@/app/api/jsonResponse";


// Check export job status
/**
 * @swagger
 * /api/organizations/{organizationId}/users/export/{exportId}:
 *   get:
 *     tags:
 *       - User Management - Organization
 *     summary: Get user export job status
 *     description: Retrieves the status of an organization user export job. Requires ADMIN or SUPER_ADMIN access.
 *     operationId: getOrganizationUserExport
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         description: ID of the organization.
 *         schema:
 *           type: string
 *       - in: path
 *         name: exportId
 *         required: true
 *         description: ID of the export job.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Export job status retrieved successfully.
 *       '401':
 *         description: Authentication is required.
 *       '403':
 *         description: The authenticated user does not have permission to access this organization.
 *       '404':
 *         description: Export job not found.
 *       '500':
 *         description: An unexpected server error occurred.
 */
export const GET = async() => {
    try {
        
        console.log("Check export job status");

    } catch (error) {
        console.error("Login failed:", error);
        return jsonResponse(
            {  
                status: false, 
                message: "Internal Server Error",
            },
            500
        );
    }
} 
