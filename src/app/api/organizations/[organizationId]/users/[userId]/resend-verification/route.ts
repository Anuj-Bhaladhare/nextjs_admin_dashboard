import { jsonResponse } from "@/app/api/jsonResponse";


// Resend verification email
export const POST = async() => {
    try {
        
        console.log("Resend verification email");

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
