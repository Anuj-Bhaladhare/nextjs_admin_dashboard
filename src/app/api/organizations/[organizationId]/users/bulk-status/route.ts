import { jsonResponse } from "@/app/api/jsonResponse";


// Change status for multiple users
export const POST = async() => {
    try {
        
        console.log("Change status for multiple users");

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
