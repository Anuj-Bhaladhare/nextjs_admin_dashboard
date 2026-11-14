
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


export interface CreateUserProfileResponse {
    status: boolean;
    message: string;
    user_id: string | null;
}
