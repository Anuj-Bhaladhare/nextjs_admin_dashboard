import { jsonResponse } from "@/app/api/jsonResponse";


// 	List users with pagination, search, filtering and sorting
export const GET = async() => {
    try {
        
        console.log("List users with pagination, search, filtering and sorting");

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


// Create a new user account
export const POST = async() => {
    try {
        
        console.log("Create a new user account");

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

