import { jsonResponse } from "@/app/api/jsonResponse";


// Activate account when permitted
export const POST = async() => {
    try {
        
        console.log("Activate account when permitted");

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
