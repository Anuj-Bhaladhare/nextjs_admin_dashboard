import { jsonResponse } from "@/app/api/jsonResponse";


// Download generated export file
export const GET = async() => {
    try {
        
        console.log("Download generated export file");

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
