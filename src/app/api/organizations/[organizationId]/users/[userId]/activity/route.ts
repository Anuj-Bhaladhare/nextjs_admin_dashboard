import { jsonResponse } from "@/app/api/jsonResponse";


// User activity summary
export const GET = async() => {
    try {
        
        console.log("User activity summary");

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
