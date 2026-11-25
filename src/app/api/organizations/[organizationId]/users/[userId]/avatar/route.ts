import { jsonResponse } from "@/app/api/jsonResponse";


// Upload or replace profile avatar
export const PUT = async() => {
    try {
        
        console.log("Upload or replace profile avatar");

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


// Remove profile avatar
export const DELETE = async() => {
    try {
        
        console.log("Remove profile avatar");

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
