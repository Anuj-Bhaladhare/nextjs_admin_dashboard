import { CreateOrganizationBody } from "./types";
import relayService from "@/axios/hook";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

const useCreateOrganization = () => {

    const CreateOrganization = async ({name, code, description, status}: CreateOrganizationBody) => {

        try {

            const response = await relayService({
                url: API_ENDPOINTS.ORGANIZATION.CREATE_ORGANIZATION.url,
                method: API_ENDPOINTS.ORGANIZATION.CREATE_ORGANIZATION.method,
                data: {
                    name, code, description, status
                }
            })
yaha se chalu kar bhai
            console.log("response ====> ", response);

        } catch (error) {
            throw error;
        }

    }

    return [{ CreateOrganization }]
}

export default useCreateOrganization;
