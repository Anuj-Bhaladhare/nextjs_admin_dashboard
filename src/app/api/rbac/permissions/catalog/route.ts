import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";


// Return grouped permission catalog
export const GET = async () => {
    try {

        console.log("Return grouped permission catalog");

    } catch (error) {
        console.error("Internal Server Error", error);
        return jsonResponse(
            {
                status: false,
                message: "Internal Server Error"
            }, 
            500
        );
    }
}