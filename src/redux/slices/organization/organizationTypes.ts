
export interface Organization {
    id: string;
    name: string;
    code: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface OrganizationState {
    organization: Organization[];
    loading: boolean;
    error: string | null
}
