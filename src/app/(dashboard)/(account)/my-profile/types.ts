
export interface UserProfile {
    // Primary relationship
    user_id: string;

    // Profile information
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    cover_image_url: string | null;

    // Personal information
    date_of_birth: string | null;
    gender: string | null;

    // Contact and location
    alternate_email: string | null;
    alternate_mobile: string | null;

    address_line_1: string | null;
    address_line_2: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postal_code: string | null;

    // Social profiles
    website_url: string | null;
    linkedin_url: string | null;
    twitter_url: string | null;

    // Preferences
    timezone: string;
    locale: string;
    preferences: Record<string, unknown>;

    // Profile visibility
    is_public: boolean;

}

export interface ProfileApiResponse {
    status: boolean,
    profile: UserProfile | null
}



// user_id: result?.user_id,
// display_name: result?.display_name,
// bio: result?.bio,
// avatar_url: result?.avatar_url,
// cover_image_url: result?.cover_image_url,
// date_of_birth: result?.date_of_birth,
// gender: result?.gender,
// alternate_email: result?.alternate_email,
// alternate_mobile: result?.alternate_mobile,
// address_line_1: result?.address_line_1,
// address_line_2: result?.address_line_2,
// city: result?.city,
// state: result?.state,
// country: result?.country,
// postal_code: result?.postal_code,
// website_url: result?.website_url,
// linkedin_url: result?.linkedin_url,
// twitter_url: result?.twitter_url,
// timezone: result?.timezone,
// locale: result?.locale,
// preferences: result?.preferences,
// is_public: result?.is_public

