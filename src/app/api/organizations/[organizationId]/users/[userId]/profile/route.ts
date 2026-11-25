import { jsonResponse } from "@/app/api/jsonResponse";


// Retrieve user profile
export const GET = async() => {
    try {
        
        console.log("Retrieve user profile");

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


// Update profile information
export const PATCH = async() => {
    try {
        
        console.log("Update profile information");

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
