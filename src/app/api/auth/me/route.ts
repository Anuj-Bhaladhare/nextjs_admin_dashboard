import { jsonResponse } from "@/app/api/jsonResponse";
import MeRepository from "./me.repository"
import { getCurrentUser } from "@/lib/auth/session";

const [{ getUserByUserId }] = MeRepository();

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get the current user's profile
 *     description: >
 *       Returns the profile for the authenticated user. Requires a valid
 *       access_token cookie belonging to an active, non-revoked session.
 *     operationId: getCurrentUserProfile
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       '200':
 *         description: Current user's profile was retrieved successfully.
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
 *                   example: User Profile get Successfylly
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: [string, 'null']
 *                     username:
 *                       type: [string, 'null']
 *                     email:
 *                       type: string
 *                       format: email
 *                     mobile:
 *                       type: [string, 'null']
 *                     status:
 *                       type: string
 *                       enum: [INVITED, ACTIVE, SUSPENDED, DISABLED, LOCKED]
 *                     email_verified_at:
 *                       type: [string, 'null']
 *                       format: date-time
 *                     mobile_verified_at:
 *                       type: [string, 'null']
 *                       format: date-time
 *                     failed_login_attempts:
 *                       type: integer
 *                     locked_until:
 *                       type: [string, 'null']
 *                       format: date-time
 *                     last_login_at:
 *                       type: [string, 'null']
 *                       format: date-time
 *                     created_by:
 *                       type: [string, 'null']
 *                       format: uuid
 *                     updated_by:
 *                       type: [string, 'null']
 *                       format: uuid
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     role:
 *                       type: string
 *                     organization_id:
 *                       type: [string, 'null']
 *                       format: uuid
 *                     session_id:
 *                       type: string
 *                       format: uuid
 *                     role_id:
 *                       type: string
 *                       format: uuid
 *       '401':
 *         description: Access token is missing, invalid, expired, or not associated with an active session.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unauthorized.
 *       '500':
 *         description: An unexpected server error prevented the profile from being retrieved.
 */
export async function GET() {

    const user = await getCurrentUser();
    if (!user) {
        return jsonResponse(
            { 
                status: false, 
                message: "Unauthorized." 
            },
            401
        );
    }

    const userProfile = await getUserByUserId(user?.id);

    return userProfile ? 
        jsonResponse(
            { 
                status: true, 
                message: "User Profile get Successfylly",
                user: {
                    ...userProfile,
                    role: user.role,
                    organization_id: user.organization_id,
                    session_id: user.sessionId,
                    role_id: user.roleId
                }
            },
            200
        ) :
        jsonResponse(
            { 
                status: false, 
                message: "Unauthorized." 
            },
            401
        );
}
