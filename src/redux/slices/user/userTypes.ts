
export interface CurrentUser {
    id: string;
    email: string;
    username: string;
    mobile: string;
    first_name: string;
    last_name: string;
    role: string | null;
    organization_id: string | null;
    session_id: string | null;
    role_id: string | null;
    status: string;
    email_verified_at: string | null;
    mobile_verified_at: string | null;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
    last_login_at: string | null;
    locked_until: string | null;
    failed_login_attempts: number;
}

export interface CurrentUserResponse {
    status: boolean;
    user: CurrentUser | null;
}
