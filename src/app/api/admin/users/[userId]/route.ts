import { jsonResponse } from "@/app/api/jsonResponse";


// Get any user globally
/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     tags:
 *       - User Management - Super Admin
 *     summary: Get a global user
 *     description: Retrieves a user account by ID across the system. Reserved for ADMIN and SUPER_ADMIN users.
 *     operationId: getGlobalUser
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       '401':
 *         description: Authentication is required.
 *       '403':
 *         description: The authenticated user does not have permission to manage global users.
 *       '404':
 *         description: User not found.
 *       '500':
 *         description: An unexpected server error occurred.
 */
export const GET = async() => {
    try {

        console.log("Get any user globally");

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


// 	Update any user's basic information
/**
 * @swagger
 * /api/admin/users/{userId}:
 *   patch:
 *     tags:
 *       - User Management - Super Admin
 *     summary: Update a global user's basic information
 *     description: Updates basic information for a user account across the system. Reserved for ADMIN and SUPER_ADMIN users.
 *     operationId: updateGlobalUser
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             description: User fields to update.
 *     responses:
 *       '200':
 *         description: User updated successfully.
 *       '400':
 *         description: The request body is invalid.
 *       '401':
 *         description: Authentication is required.
 *       '403':
 *         description: The authenticated user does not have permission to manage global users.
 *       '404':
 *         description: User not found.
 *       '500':
 *         description: An unexpected server error occurred.
 */
export const PATCH = async() => {
    try {
        
        console.log("Update any user's basic information");

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


// 	Delete/soft-delete a global user
/**
 * @swagger
 * /api/admin/users/{userId}:
 *   delete:
 *     tags:
 *       - User Management - Super Admin
 *     summary: Delete or deactivate a global user
 *     description: Deletes or soft-deletes a user account according to the applicable policy. Reserved for ADMIN and SUPER_ADMIN users.
 *     operationId: deleteGlobalUser
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to delete or deactivate.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User deleted or deactivated successfully.
 *       '401':
 *         description: Authentication is required.
 *       '403':
 *         description: The authenticated user does not have permission to manage global users.
 *       '404':
 *         description: User not found.
 *       '500':
 *         description: An unexpected server error occurred.
 */
export const DELETE = async() => {
    try {
        
        console.log("Delete/soft-delete a global user");

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

