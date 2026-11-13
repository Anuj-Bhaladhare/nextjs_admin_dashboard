// GET	 -> /api/users/me/profile  ->  Get personal profile
// POST	 -> /api/users/me/profile  ->  Create/register personal profile
// PATCH -> /api/users/me/profile  ->  Update existing personal profile

import { NextRequest } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { UserProfile } from "./profile.type";
import ProfileRepository from "./profile.repository";


const [{ getUserProfileByUserId, createUserProfileByUserId }] = ProfileRepository();


// Get personal profile
export const GET = async ( reqest: NextRequest ) => {
    try {

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
export const POST = async ( request: NextRequest ) => {
    try {

        let body: UserProfile = await request.json();

        const {
            user_id, display_name, bio, date_of_birth, gender, alternate_email, alternate_mobile, address_line_1, address_line_2, city, state, country, 
            postal_code, website_url, linkedin_url, twitter_url, timezone, locale, 
            preferences, is_public
        } = body;

        // const result = await createUserProfileByUserId(
            
        // );

        console.log("Body---> ",user_id, display_name, bio, date_of_birth, gender, alternate_email, alternate_mobile, address_line_1, address_line_2, city, state, country, 
            postal_code, website_url, linkedin_url, twitter_url, timezone, locale, 
            preferences, is_public )


        // if ( result ) {
        //     console.log( "result result: ", result );
        // }

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
export const PATCH = async () => {
    try {

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
