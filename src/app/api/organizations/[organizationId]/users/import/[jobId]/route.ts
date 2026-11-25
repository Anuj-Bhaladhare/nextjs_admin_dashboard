import { jsonResponse } from "@/app/api/jsonResponse";


// Check import job status
export const GET = async() => {
    try {
        
        console.log("Check import job status");

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
