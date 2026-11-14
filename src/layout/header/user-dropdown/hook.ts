import { useCallback } from "react";
import relayService from "@/axios/hook";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { CurrentUser, CurrentUserResponse } from "./type";


const useUserDropdown = () => {

    const getCurrentUser = useCallback(async (): Promise<CurrentUser | null> => {
        try {

            const response = await relayService<CurrentUserResponse>({
                url: API_ENDPOINTS.AUTH.LOGOUT.url,
                method: API_ENDPOINTS.AUTH.LOGOUT.method
            })

            return response?.data?.status ? response?.data?.user : null;

        } catch (error) {
            throw error;
        }
    }, []);

    return [{ getCurrentUser }] as const;

}

export default useUserDropdown;
