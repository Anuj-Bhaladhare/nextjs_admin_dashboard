import { jsonResponse } from "@/app/api/jsonResponse";


// Revoke all user sessions
export const DELETE = async() => {
    try {
        
        console.log("Revoke all user sessions");

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
