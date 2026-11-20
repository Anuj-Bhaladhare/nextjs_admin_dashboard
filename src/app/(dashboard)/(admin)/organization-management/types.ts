
export interface Organization {
id: string;
    name: string;
    code: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface OrganizationResponse {
    status: boolean;
    data: Organization[];
    message: string;
}
