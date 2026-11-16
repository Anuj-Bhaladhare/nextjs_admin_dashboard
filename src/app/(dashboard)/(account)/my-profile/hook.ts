
"use client";

import { useCallback } from "react";
import relayService from "@/axios/hook";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { ProfileApiResponse, UserProfile } from "./types";

const useMyProfileHook = () => {

    const getMyProfileDetails = useCallback(
        async (): Promise<UserProfile | false> => {
            try {
                const response = await relayService<ProfileApiResponse>({
                    url: API_ENDPOINTS.MY_ACCOUNT_APIs.PROFILE.GET.url,
                    method: API_ENDPOINTS.MY_ACCOUNT_APIs.PROFILE.GET.method,
                });

                if (response?.status === 200 && response?.data?.status) {
                    return response.data.profile ?? false;
                }

                return false;

            } catch (error: unknown) {
                console.error("Error fetching profile details:", error);
                throw error;
            }
        },
        []
    );

    return [{ getMyProfileDetails }] as const;

};

export default useMyProfileHook;
