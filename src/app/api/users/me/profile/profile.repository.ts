import { getPostgresPool } from "@/lib/db/client";
import { jsonResponse } from "@/app/api/jsonResponse";

const pool = getPostgresPool();

const ProfileRepository = () => {
    
    const getUserProfileByUserId = async () => {
        try {

            console.log("getUserProfileByUserId");
            
        } catch (error: unknown) {
            console.error("getUserProfileByUserId Error:", error);
            return jsonResponse(
                {
                    success: false,
                    message: "Internal server error",
                },
                500
            ); 
        }
    }


    const createUserProfileByUserId = async (
        user_id,
        display_name = null,
        bio = null,
        avatar_url = null,
        cover_image_url = null,
        date_of_birth = null,
        gender = null,
        alternate_email = null,
        alternate_mobile = null,
        address_line_1 = null,
        address_line_2 = null,
        city = null,
        state = null,
        country = null,
        postal_code = null,
        website_url = null,
        linkedin_url = null,
        twitter_url = null,
        timezone = "Asia/Kolkata",
        locale = "en-IN",
        preferences = {},
        is_public = false
    ) => {
        try {

            const response = await pool.query(
                `
                    INSERT INTO core.user_profiles_s
                        ( 
                            user_id, display_name, bio, date_of_birth, gender, alternate_email, 
                            alternate_mobile, address_line_1, address_line_2, city, state, country, 
                            postal_code, website_url, linkedin_url, twitter_url, timezone, locale, 
                            preferences, is_public
                        );
                    VALUES
                        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
                `, 
                [
                    user_id, display_name, bio, date_of_birth, gender, alternate_email, 
                    alternate_mobile, address_line_1, address_line_2, city, state, country, 
                    postal_code, website_url, linkedin_url, twitter_url, timezone, locale, 
                    preferences, is_public
                ]
            );

            console.log("response ========> ", response);

            
        } catch (error: unknown) {
            console.error("createUserProfileByUserId Error:", error);
            return jsonResponse(
                {
                    success: false,
                    message: "Internal server error",
                },
                500
            ); 
        }
    }


    return [{ getUserProfileByUserId, createUserProfileByUserId }] as const;
}

export default ProfileRepository;
