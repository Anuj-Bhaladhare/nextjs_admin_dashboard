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
