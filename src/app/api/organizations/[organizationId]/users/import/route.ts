import { jsonResponse } from "@/app/api/jsonResponse";


// Initiate bulk import
export const POST = async() => {
    try {
        
        console.log("Initiate bulk import");

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
