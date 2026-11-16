import { NextResponse, NextRequest } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";


// List organizations accessible to caller
export const GET = async ( 
    request: NextRequest 
): Promise<NextResponse> => {

    try{

        return jsonResponse(
            {
                status: true,
                message: "Organizations retrieved successfully",
                data: []
            }, 
            200
        );

    } catch (error) {
        console.error("GET /api/organizations error: ", error);
        return jsonResponse(
            {  
                status: false, 
                message: "Internal Server Error",
            },
            500
        );
    }

}


// Create organization
export const POST = async (
    request: NextRequest
): Promise<NextResponse> => {
    try{

        return jsonResponse(
            {
                status: true,
                message: "Organizations retrieved successfully",
                data: []
            }, 
            200
        );

    } catch (error) {
        console.error("POST /api/organizations error: ", error);
        return jsonResponse(
            {  
                status: false, 
                message: "Internal Server Error",
            },
            500
        );
    }
}
