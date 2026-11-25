import { jsonResponse } from "@/app/api/jsonResponse";


// Check export job status
export const GET = async() => {
    try {
        
        console.log("Check export job status");

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
