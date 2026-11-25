import { jsonResponse } from "@/app/api/jsonResponse";

// Temporarily suspend account
export const POST = async() => {
    try {
        
        console.log("Temporarily suspend account");

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
