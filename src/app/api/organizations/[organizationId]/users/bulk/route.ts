import { jsonResponse } from "@/app/api/jsonResponse";


// Create multiple users
export const POST = async() => {
    try {
        
        console.log("Create multiple users");

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
