import { jsonResponse } from "@/app/api/jsonResponse";


// Permanently/administratively disable account
export const POST = async() => {
    try {
        
        console.log("Permanently/administratively disable account");

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
