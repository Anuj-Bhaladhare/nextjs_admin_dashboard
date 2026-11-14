import { getPostgresPool } from "@/lib/db/client";
import { CreateUserProfileResponse, UserProfile } from "./profile.type";

const pool = getPostgresPool();

const ProfileRepository = () => {
    
    const getUserProfileByUserId = async (user_id: string): Promise<UserProfile | null> => {
        try {
            const response = await pool.query<UserProfile>(
                `
                    SELECT *
                    FROM core.user_profiles
                    WHERE user_id = $1
                `,
                [user_id]
            );

            return response.rows[0] ?? null;
            
        } catch (error: unknown) {
            console.error("getUserProfileByUserId Error:", error);
            throw error;
        }
    }

    const createUserProfileByUserId = async (
        user_id: string,
        display_name: string | null = null,
        bio: string | null = null,
        avatar_url: string | null = null,
        cover_image_url: string | null = null,
        date_of_birth: string | null = null,
        gender: string | null = null,
        alternate_email: string | null = null,
        alternate_mobile: string | null = null,
        address_line_1: string | null = null,
        address_line_2: string | null = null,
        city: string | null = null,
        state: string | null = null,
        country: string | null = null,
        postal_code: string | null = null,
        website_url: string | null = null,
        linkedin_url: string | null = null,
        twitter_url: string | null = null,
        timezone: string = "Asia/Kolkata",
        locale: string = "en-IN",
        preferences: Record<string, unknown> = {},
        is_public: boolean = false
    ): Promise<CreateUserProfileResponse> => {
        try {

            const response = await pool.query(
                `
                    INSERT INTO core.user_profiles
                        (   
                            user_id, display_name, bio, avatar_url, cover_image_url, date_of_birth,
                            gender, alternate_email, alternate_mobile, address_line_1, address_line_2,
                            city, state, country, postal_code, website_url, linkedin_url, twitter_url,
                            timezone, locale, preferences, is_public
                        )
                    VALUES
                        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
                    RETURNING
                        user_id;
                `, 
                [
                    user_id, display_name, bio, avatar_url, cover_image_url, date_of_birth,
                    gender, alternate_email, alternate_mobile, address_line_1, address_line_2,
                    city, state, country, postal_code, website_url, linkedin_url, twitter_url,
                    timezone, locale, preferences, is_public
                ]
            );

            if ( response.rowCount! > 0 && response.rows.length > 0) {
                return {
                    status: true,
                    message: "User Profile Insert Success",
                    user_id: response?.rows[0]?.user_id
                }
            }

            return {
                status: false,
                message: "Database Error in User Profile Insert",
                user_id: null
            };
            
        } catch (error: unknown) {
            console.error("createUserProfileByUserId Error:", error);
            throw error;
        }
    }

    const updateUserProfileByUserId = async (
        user_id: string,
        profile: Partial<Omit<UserProfile, "user_id">>
    ): Promise<CreateUserProfileResponse> => {
        const profileColumnByField: Record<string, string> = {
            display_name: "display_name",
            bio: "bio",
            avatar_url: "avatar_url",
            cover_image_url: "cover_image_url",
            date_of_birth: "date_of_birth",
            gender: "gender",
            alternate_email: "alternate_email",
            alternate_mobile: "alternate_mobile",
            address_line_1: "address_line_1",
            address_line_2: "address_line_2",
            city: "city",
            state: "state",
            country: "country",
            postal_code: "postal_code",
            website_url: "website_url",
            linkedin_url: "linkedin_url",
            twitter_url: "twitter_url",
            timezone: "timezone",
            locale: "locale",
            preferences: "preferences",
            is_public: "is_public",
        };
        const fields = Object.entries(profile).filter(([field]) => profileColumnByField[field]);

        if (fields.length === 0) {
            return {
                status: false,
                message: "No profile fields provided",
                user_id: null,
            };
        }

        const assignments = fields.map(
            ([field], index) => `${profileColumnByField[field]} = $${index + 2}`
        );
        const values = fields.map(([, value]) => value);

        try {
            const response = await pool.query<{ user_id: string }>(
                `
                    UPDATE core.user_profiles
                    SET ${assignments.join(", ")}, updated_at = NOW()
                    WHERE user_id = $1
                    RETURNING user_id
                `,
                [user_id, ...values]
            );

            if (response.rows[0]) {
                return {
                    status: true,
                    message: "User Profile Update Success",
                    user_id: response.rows[0].user_id,
                };
            }

            return {
                status: false,
                message: "User profile not found",
                user_id: null,
            };
        } catch (error: unknown) {
            console.error("updateUserProfileByUserId Error:", error);
            throw error;
        }
    }

    return [{ getUserProfileByUserId, createUserProfileByUserId, updateUserProfileByUserId }] as const;
}

export default ProfileRepository;
