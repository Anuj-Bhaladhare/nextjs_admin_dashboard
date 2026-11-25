import { jsonResponse } from "@/app/api/jsonResponse";


// Get audit records associated with a user
export const GET = async() => {
    try {
        
        console.log("Get audit records associated with a user");

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
