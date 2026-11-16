import relayService from "@/axios/hook";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

const useLogin = () => {

    const handleSubmitLoginForm = async (email: string, password: string) => {
        const response = await relayService({
            url: API_ENDPOINTS.AUTH.LOGIN.url,
            method: API_ENDPOINTS.AUTH.LOGIN.method,
            data: {
                email: email,
                password: password
            }
        });

        if (response) {
            return {
                status: true,
                data: response.data
            };
        }

        return {
            status: false,
            message: "Data Not Found"
        };
    }

    return [{ handleSubmitLoginForm }] as const;

}

export default useLogin;
