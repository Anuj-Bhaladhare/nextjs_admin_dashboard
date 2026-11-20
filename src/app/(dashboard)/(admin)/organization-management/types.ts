
export interface Organization {
    id: string;
    name: string;
    code: string;
    description: string;
    members: number;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    created_at: string;
    updated_at: string;
}

export interface OrganizationResponse {
    status: boolean;
    data: Organization[];
    message: string;
}
