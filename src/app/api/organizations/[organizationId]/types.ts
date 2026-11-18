

export interface OrganizationData {
    id: string | null,
    name: string | null,
    code: string | null,
    description: string | null,
    status: string | null
}

export interface OrganizationResponse {
    data: OrganizationData,
    status: boolean
}

export interface ParamsData {
    organizationId: string
}
