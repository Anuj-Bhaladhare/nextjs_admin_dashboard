import { useCallback } from "react";
import relayService from "@/axios/hook";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { Organization, OrganizationResponse } from "./types";

// Redux toolkit state management
import { useAppDispatch } from "@/redux/hooks";
import { setOrganizations } from "@/redux/slices/organization/organizationSlice";


const useOrganizationManagement = () => {

    const dispatch = useAppDispatch();

    const getOrganizations = useCallback(async(): Promise<Organization[]> => {
        try {

            const response = await relayService<OrganizationResponse>({
                url: API_ENDPOINTS.ORGANIZATION.LIST_ORGANIZATIONS.url,
                method: API_ENDPOINTS.ORGANIZATION.LIST_ORGANIZATIONS.method
            });

            if (!response?.data?.status) {
                return [];
            }

            console.log("response =====>  ", response)

            const organizations = response.data.data ?? [];

            dispatch(setOrganizations(organizations));

            return organizations;

        } catch (e) {
            throw e;
        }
    }, [dispatch]);

    return [{ getOrganizations }];

}

export default useOrganizationManagement;
