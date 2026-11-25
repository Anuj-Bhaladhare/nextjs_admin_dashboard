import { jsonResponse } from "@/app/api/jsonResponse";


// Generate user export
export const POST = async() => {
    try {
        
        console.log("Generate user export");

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
