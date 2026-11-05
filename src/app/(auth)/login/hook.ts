import relayService from "@/axios/hook";

const useLogin = () => {

    const handleSubmitLoginForm = async (email: string, password: string) => {

        try {
            const response = await relayService({
                url: "/api/auth/login",
                method: "POST",
                data: {
                    email: email,
                    password: password
                }
            })

            if (response) {
                return {
                    status: true,
                    data: response?.data
                }
            } else {
                return {
                    status: false,
                    message: "Data Not Found"
                };
            }

        } catch (error: any) {
            console.error("Login API Error:", error);
            throw error;
        }

    }

    return [{ handleSubmitLoginForm }] as const;

}

export default useLogin;
