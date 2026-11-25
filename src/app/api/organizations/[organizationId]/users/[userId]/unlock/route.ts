import { jsonResponse } from "@/app/api/jsonResponse";


// Unlock a locked account
export const POST = async() => {
    try {
        
        console.log("Unlock a locked account");

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
