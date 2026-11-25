import { jsonResponse } from "@/app/api/jsonResponse";


// Admin initiates password reset
export const POST = async() => {
    try {
        
        console.log("Admin initiates password reset");

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
