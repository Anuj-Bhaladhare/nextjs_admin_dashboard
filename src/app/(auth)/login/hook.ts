import relayService from "@/axios/hook";

const useLogin = () => {

    const handleSubmitLoginForm = async (email: string, password: string) => {
        const response = await relayService({
            url: "/api/auth/login",
            method: "POST",
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
