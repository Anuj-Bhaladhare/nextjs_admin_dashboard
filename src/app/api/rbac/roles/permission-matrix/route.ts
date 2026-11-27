
import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";


// View role-permission matrix
export const GET = async () => {
    try {

        console.log("View role-permission matrix");

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
