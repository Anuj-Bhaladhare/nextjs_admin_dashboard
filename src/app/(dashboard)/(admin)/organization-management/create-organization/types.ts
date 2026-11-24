
export interface CreateOrganizationBody {
    name: string;
    code: string;
    description: string;
    status: string;
}


export interface CreateOrganizationResponseData {
    code: string;
    created_at: string;
    description: string;
    id: string;
    name: string;
    status: string;
    updated_at: string;
}


export interface CreateOrganizationResponse {
    data: CreateOrganizationResponseData;
    id: string,
    message: string;
    status: boolean;
}
