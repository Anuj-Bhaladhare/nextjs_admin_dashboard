import relayService from "@/axios/hook";

type LEDCommand = "ON" | "OFF"

const useGateControll = () => {
    
    
    const controlLED = async (command: LEDCommand) => {

        console.log("useGateControll: ", command);
        try {
            const response = await relayService({
                url: "/api/led",
                method: "POST",
                data: {
                    command
                }
            });

            return response.data;

        } catch (error) {
            console.error("LED Control Error:", error);
            throw error;
        }
    }

    return [{ controlLED }] as const;

}

export default useGateControll;
