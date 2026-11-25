import { jsonResponse } from "@/app/api/jsonResponse";

export const GET = async() => {
    try {
        
        console.log("Create a global user");

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
