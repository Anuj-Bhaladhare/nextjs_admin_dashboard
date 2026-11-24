import { CreateOrganizationBody, CreateOrganizationResponse } from "./types";
import relayService from "@/axios/hook";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

const useCreateOrganization = () => {

    const CreateOrganization = async ({name, code, description, status}: CreateOrganizationBody) => {

        try {

            const response = await relayService<CreateOrganizationResponse>({
                url: API_ENDPOINTS.ORGANIZATION.CREATE_ORGANIZATION.url,
                method: API_ENDPOINTS.ORGANIZATION.CREATE_ORGANIZATION.method,
                data: {
                    name: name, 
                    code: code, 
                    description: description, 
                    status: status 
                }
            })

            if ( !response?.data?.status ) {
                return {
                    message: response?.data?.message,
                    status: response?.data?.status
                }
            }

            return {
                id: response?.data?.data.id,
                message: response?.data?.message,
                status: response?.data?.status
            }

        } catch (error) {
            throw error;
        }

    }

    return [{ CreateOrganization }];
}

export default useCreateOrganization;
