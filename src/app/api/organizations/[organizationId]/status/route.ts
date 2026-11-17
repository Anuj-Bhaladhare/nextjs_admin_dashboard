import { NextResponse, NextRequest } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";

const pool = getPostgresPool();

// Database Request
const update_DB_Status = async ( id: string, status: string )  => {
    try {
        const response = await pool.query(
            `
                UPDATE core.organizations
                SET status = $1
                WHERE id = $2
                RETURNING id;
            `, [status, id]
        );

        if ( response?.rows?.length === 0 || response?.rowCount === 0 ) {
            return jsonResponse(
                {
                    status: false,
                    message: `Organization Status of ${id} is Not Update...!`
                },
                404
            );
        } 

        return response?.rows;

    } catch (error) {
        throw error;
    }
}


// API =================================================================
export const PATCH = async (
    request: NextRequest,
    { params }: { params: {organizationId: string} }
): Promise<NextResponse> => {
    try {
        const { organizationId } = await params;
        if (!organizationId) {
            return jsonResponse(
                {
                    status: false,
                    message: "Organizations id Not Found id Params"
                }, 
                404
            );
        }

        let body: {status: string};
        try {
            body = await request.json()  
        } catch (e) {
            throw e;
        }
        const { status } = body;
        if ( !status ) {
            return jsonResponse(
                {
                    status: false,
                    message: "Organizations Status Not found Body"
                }, 
                404
            );
        }

        const result = await update_DB_Status(organizationId, status);
        if (!result) {
            return jsonResponse(
                {
                    status: false,
                    message: "Organizations status is Not Update"
                }, 
                400
            );
        }

        return jsonResponse(
            {
                status: true,
                message: "Organizations status Update Successfull",
                data: result
            }, 
            400
        );

    } catch (error) {
        console.error("PATCH /api/organizations/{organizationId}/status error: ", error);
        return jsonResponse(
            {  
                status: false, 
                message: "Internal Server Error",
            },
            500
        );
    }
}
