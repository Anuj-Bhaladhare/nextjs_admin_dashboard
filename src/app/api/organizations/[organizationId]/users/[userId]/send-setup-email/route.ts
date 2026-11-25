import { jsonResponse } from "@/app/api/jsonResponse";


// Send initial account setup email
export const POST = async() => {
    try {
        
        console.log("Send initial account setup email");

    } catch (error) {
        console.error("Login failed:", error);
        return jsonResponse(
            {  
                status: false, 
                message: "Internal Server Error",
            },
            500
        );
    }
} 
