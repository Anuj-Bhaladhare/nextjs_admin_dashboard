// GET	 -> /api/users/me/profile  ->  Get personal profile
// POST	 -> /api/users/me/profile  ->  Create/register personal profile
// PATCH -> /api/users/me/profile  ->  Update existing personal profile

import { jsonResponse } from "@/app/api/jsonResponse";
import { UserProfile } from "./profile.type";
import ProfileRepository from "./profile.repository";
import { getCurrentUser } from "@/lib/auth/session";


const [{ getUserProfileByUserId, createUserProfileByUserId, updateUserProfileByUserId }] = ProfileRepository();

type ProfileData = Omit<UserProfile, "user_id">;

const profileFields: (keyof ProfileData)[] = [
    "display_name", "bio", "avatar_url", "cover_image_url", "date_of_birth",
    "gender", "alternate_email", "alternate_mobile", "address_line_1", "address_line_2",
    "city", "state", "country", "postal_code", "website_url", "linkedin_url",
    "twitter_url", "timezone", "locale", "preferences", "is_public",
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && 
    value !== null && 
    !Array.isArray(value);

    
// Get personal profile
/**
 * @swagger
 * /api/users/me/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get the current user's personal profile
 *     description: Retrieves the personal profile associated with the authenticated user.
 *     operationId: getMyUserProfile
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       '200':
 *         description: User profile retrieved successfully.
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
 *                   example: User profile retrieved successfully.
 *                 profile:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                     display_name:
 *                       type: [string, 'null']
 *                     bio:
 *                       type: [string, 'null']
 *                     avatar_url:
 *                       type: [string, 'null']
 *                     cover_image_url:
 *                       type: [string, 'null']
 *                     date_of_birth:
 *                       type: [string, 'null']
 *                       format: date
 *                     gender:
 *                       type: [string, 'null']
 *                     alternate_email:
 *                       type: [string, 'null']
 *                       format: email
 *                     alternate_mobile:
 *                       type: [string, 'null']
 *                     address_line_1:
 *                       type: [string, 'null']
 *                     address_line_2:
 *                       type: [string, 'null']
 *                     city:
 *                       type: [string, 'null']
 *                     state:
 *                       type: [string, 'null']
 *                     country:
 *                       type: [string, 'null']
 *                     postal_code:
 *                       type: [string, 'null']
 *                     website_url:
 *                       type: [string, 'null']
 *                       format: uri
 *                     linkedin_url:
 *                       type: [string, 'null']
 *                       format: uri
 *                     twitter_url:
 *                       type: [string, 'null']
 *                       format: uri
 *                     timezone:
 *                       type: string
 *                     locale:
 *                       type: string
 *                     preferences:
 *                       type: object
 *                       additionalProperties: true
 *                     is_public:
 *                       type: boolean
 *       '401':
 *         description: Authentication is required.
 *       '404':
 *         description: User profile not found.
 *       '500':
 *         description: An unexpected server error occurred.
 */
export const GET = async () => {
    try {

        const user = await getCurrentUser();
        if (!user) {
            return jsonResponse({ status: false, message: "Unauthorized." }, 401);
        }

        const profile = await getUserProfileByUserId(user.id);
        if (!profile) {
            return jsonResponse({ status: false, message: "User profile not found." }, 404);
        }

        return jsonResponse(
            { status: true, message: "User profile retrieved successfully.", profile },
            200
        );
    } catch (error: unknown) {

        console.error("GET API Error:", error);
        return jsonResponse(
            {
                success: false,
                message: "Internal server error",
            },
            500
        ); 
    }
}


// Create/register personal profile
/**
 * @swagger
 * /api/users/me/profile:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create the current user's personal profile
 *     description: Creates a personal profile for the authenticated user.
 *     operationId: createMyUserProfile
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               display_name:
 *                 type: [string, 'null']
 *               bio:
 *                 type: [string, 'null']
 *               avatar_url:
 *                 type: [string, 'null']
 *               cover_image_url:
 *                 type: [string, 'null']
 *               date_of_birth:
 *                 type: [string, 'null']
 *                 format: date
 *               gender:
 *                 type: [string, 'null']
 *               alternate_email:
 *                 type: [string, 'null']
 *                 format: email
 *               alternate_mobile:
 *                 type: [string, 'null']
 *               address_line_1:
 *                 type: [string, 'null']
 *               address_line_2:
 *                 type: [string, 'null']
 *               city:
 *                 type: [string, 'null']
 *               state:
 *                 type: [string, 'null']
 *               country:
 *                 type: [string, 'null']
 *               postal_code:
 *                 type: [string, 'null']
 *               website_url:
 *                 type: [string, 'null']
 *                 format: uri
 *               linkedin_url:
 *                 type: [string, 'null']
 *                 format: uri
 *               twitter_url:
 *                 type: [string, 'null']
 *                 format: uri
 *               timezone:
 *                 type: string
 *               locale:
 *                 type: string
 *               preferences:
 *                 type: object
 *                 additionalProperties: true
 *               is_public:
 *                 type: boolean
 *     responses:
 *       '201':
 *         description: User profile created successfully.
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
 *                   example: User profile created.
 *                 user_id:
 *                   type: string
 *       '400':
 *         description: The request body must be valid JSON and contain a JSON object.
 *       '401':
 *         description: Authentication is required.
 *       '500':
 *         description: The profile could not be created or an unexpected server error occurred.
 */
export const POST = async (request: Request) => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return jsonResponse({ status: false, message: "Unauthorized." }, 401);
        }

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return jsonResponse({ status: false, message: "Request body must be valid JSON." }, 400);
        }
        if (!isRecord(body)) {
            return jsonResponse({ status: false, message: "Request body must be a JSON object." }, 400);
        }

        const {
            display_name, bio, avatar_url, cover_image_url, date_of_birth,
            gender, alternate_email, alternate_mobile, address_line_1, address_line_2,
            city, state, country, postal_code, website_url, linkedin_url, twitter_url,
            timezone, locale, preferences, is_public
        } = body as Partial<UserProfile>;

        const result = await createUserProfileByUserId(
            user.id, display_name, bio, avatar_url, cover_image_url, date_of_birth,
            gender, alternate_email, alternate_mobile, address_line_1, address_line_2,
            city, state, country, postal_code, website_url, linkedin_url, twitter_url,
            timezone, locale, preferences, is_public
        );

        if (result.status) {
            return jsonResponse(
                {
                    status: true,
                    message: "User profile created.",
                    user_id: result.user_id
                },
                201
            );
        }

        return jsonResponse(
            {
                status: false,
                message: "User profile could not be created."
            },
            500
        );

    } catch (error: unknown) {

        console.error("POST API Error:", error);
        return jsonResponse(
            {
                success: false,
                message: "Internal server error",
            },
            500
        );
    }
}


// Update existing personal profile
/**
 * @swagger
 * /api/users/me/profile:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update the current user's personal profile
 *     description: Updates one or more profile fields for the authenticated user. At least one supported field must be provided.
 *     operationId: updateMyUserProfile
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               display_name:
 *                 type: [string, 'null']
 *               bio:
 *                 type: [string, 'null']
 *               avatar_url:
 *                 type: [string, 'null']
 *               cover_image_url:
 *                 type: [string, 'null']
 *               date_of_birth:
 *                 type: [string, 'null']
 *                 format: date
 *               gender:
 *                 type: [string, 'null']
 *               alternate_email:
 *                 type: [string, 'null']
 *                 format: email
 *               alternate_mobile:
 *                 type: [string, 'null']
 *               address_line_1:
 *                 type: [string, 'null']
 *               address_line_2:
 *                 type: [string, 'null']
 *               city:
 *                 type: [string, 'null']
 *               state:
 *                 type: [string, 'null']
 *               country:
 *                 type: [string, 'null']
 *               postal_code:
 *                 type: [string, 'null']
 *               website_url:
 *                 type: [string, 'null']
 *                 format: uri
 *               linkedin_url:
 *                 type: [string, 'null']
 *                 format: uri
 *               twitter_url:
 *                 type: [string, 'null']
 *                 format: uri
 *               timezone:
 *                 type: string
 *               locale:
 *                 type: string
 *               preferences:
 *                 type: object
 *                 additionalProperties: true
 *               is_public:
 *                 type: boolean
 *     responses:
 *       '200':
 *         description: User profile updated successfully.
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
 *                   example: User profile updated.
 *                 user_id:
 *                   type: string
 *       '400':
 *         description: The request body must be valid JSON and contain at least one supported profile field.
 *       '401':
 *         description: Authentication is required.
 *       '404':
 *         description: User profile not found.
 *       '500':
 *         description: An unexpected server error occurred.
 */
export const PATCH = async (request: Request) => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return jsonResponse({ status: false, message: "Unauthorized." }, 401);
        }

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return jsonResponse({ status: false, message: "Request body must be valid JSON." }, 400);
        }
        if (!isRecord(body)) {
            return jsonResponse({ status: false, message: "Request body must be a JSON object." }, 400);
        }

        const profile = Object.fromEntries(
            profileFields
                .filter((field) => Object.hasOwn(body, field))
                .map((field) => [field, body[field]])
        ) as Partial<ProfileData>;

        if (Object.keys(profile).length === 0) {
            return jsonResponse({ status: false, message: "At least one profile field is required." }, 400);
        }

        const result = await updateUserProfileByUserId(user.id, profile);
        if (!result.status) {
            return jsonResponse({ status: false, message: "User profile not found." }, 404);
        }

        return jsonResponse(
            { status: true, message: "User profile updated.", user_id: result.user_id },
            200
        );
    } catch (error: unknown) {

        console.error("PATCH API Error:", error);
        return jsonResponse(
            {
                success: false,
                message: "Internal server error",
            },
            500
        );
    }
}
