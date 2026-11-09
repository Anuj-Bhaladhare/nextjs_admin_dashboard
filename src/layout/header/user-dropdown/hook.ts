import { useCallback } from "react";
import relayService from "@/axios/hook";
import { CurrentUser, CurrentUserResponse } from "./type";

const useUserDropdown = () => {

    const getCurrentUser = useCallback(async (): Promise<CurrentUser | null> => {
        try {

            const response = await relayService<CurrentUserResponse>({
                url: "/api/auth/me",
                method: 'GET'
            })

            return response?.data?.status ? response?.data?.user : null;

        } catch (error) {
            throw error;
        }
    }, []);

    return [{ getCurrentUser }] as const;

}

export default useUserDropdown;
