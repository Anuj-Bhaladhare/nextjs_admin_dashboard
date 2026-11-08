export interface CurrentUser {
    id: string;
    role: string;
    first_name: string;
    last_name: string;
    organization_id: string | null;
}

export interface CurrentUserResponse {
    status: boolean;
    user: CurrentUser | null;
}
