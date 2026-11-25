import { jsonResponse } from "@/app/api/jsonResponse";


// Get import validation/failure details
export const GET = async() => {
    try {
        
        console.log("Get import validation/failure details");

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
