import { jsonResponse } from "@/app/api/jsonResponse";


// Check account activation status
export const GET = async() => {
    try {
        
        console.log("Check account activation status");

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
