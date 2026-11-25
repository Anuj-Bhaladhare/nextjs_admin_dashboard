import { jsonResponse } from "@/app/api/jsonResponse";

// Change account status
export const PATCH = async() => {
    try {
        
        console.log("Change account status");

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
