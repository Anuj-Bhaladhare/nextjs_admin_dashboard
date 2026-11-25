import { jsonResponse } from "@/app/api/jsonResponse";


// Revoke a specific session
export const DELETE = async() => {
    try {
        
        console.log("Revoke a specific session");

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
