export interface GetAllUsersParams {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface UsersResponseBody {
    user_id: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    mobile: string;
    user_status: string;
    organization_id: string;
    organization_name: string;
    organization_code: string;
    created_at: string
}

export interface UsersList {
    command: string;
    message: string;
    oid: string;
    rows: UsersResponseBody[];
    status: boolean;
}
