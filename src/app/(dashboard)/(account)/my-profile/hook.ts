import relayService from "@/axios/hook";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";


const useMyProfileHook = () => {

    const getMyProfileDetails = async () => {
        console.log("AAAAAAAAAA")
        // try {

        //     const response = await relayService({
        //         url: API_ENDPOINTS.MY_ACCOUNT_APIs.PROFILE.GET.url,
        //         method: API_ENDPOINTS.MY_ACCOUNT_APIs.PROFILE.GET.method
        //     });

        //     console.log("=======>  response: ", response);

        // } catch (error) {
        //     throw error;
        // }
    }

    return [{ getMyProfileDetails }] as const;

}

export default useMyProfileHook;
