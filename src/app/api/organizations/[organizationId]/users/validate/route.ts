import { jsonResponse } from "@/app/api/jsonResponse";


// Validate CSV/Excel user import data
export const POST = async() => {
    try {
        
        console.log("Validate CSV/Excel user import data");

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
