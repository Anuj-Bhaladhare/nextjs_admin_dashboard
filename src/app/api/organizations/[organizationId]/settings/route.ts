import { NextResponse, NextRequest } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getPostgresPool } from "@/lib/db/client";

const pool = getPostgresPool();

interface OrganizationSettings {
    id: string;
    setting_key: string;
    setting_value: Record<string, unknown>;
}

// Database Request
const updateOrganizationSetting = async ({ id, setting_key, setting_value }: OrganizationSettings )  => {
    try {
        const response = await pool.query(
            `
                UPDATE 
                    core.organization_settings
                SET 
                    setting_key = $1, setting_value = $2
                WHERE 
                    organization_id = $2
                RETURNING 
                    id;
            `, [ setting_key, setting_value, id ]
        );

        if ( response?.rows?.length === 0 || response?.rowCount === 0 ) {
            return jsonResponse(
                {
                    status: false,
                    message: `Organization Setting of ${id} is Not Update...!`
                },
                404
            );
        } 

        return response?.rows;

    } catch (error) {
        throw error;
    }
}

const getOrganizationSetting = async ( id: string ) => {
    try {
        const response = await pool.query(
            `
                SELECT * FROM core.organization_settings WHERE id=$1;
            `, [id]
        );

        if ( response?.rows?.length === 0 || response?.rowCount === 0 ) {
            return jsonResponse(
                {
                    status: false,
                    message: `Organization Setting of ${id} is Not Found...!`
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
// ********** Get settings ************
export const GET = async (
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

        
        const result = await getOrganizationSetting(organizationId);
        if (!result) {
            return jsonResponse(
                {
                    status: false,
                    message: "Organizations Setting is Not Found"
                }, 
                400
            );
        }

        return jsonResponse(
            {
                status: true,
                message: "Organizations Setting Get Successfull",
                data: result
            }, 
            200
        );

    } catch (error) {
        console.error("PATCH /api/organizations/{organizationId}/setting error: ", error);
        return jsonResponse(
            {  
                status: false, 
                message: "Internal Server Error",
            },
            500
        );
    }
}


// ************ Update settings ************
export const PUT = async (
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

        let body: OrganizationSettings;
        try {
            body = await request.json()  
        } catch (e) {
            throw e;
        }
        const { setting_key, setting_value } = body;
        if ( !setting_key || !setting_value ) {
            return jsonResponse(
                {
                    status: false,
                    message: "Organizations Setting Not found Body"
                }, 
                404
            );
        }

        const result = await updateOrganizationSetting({id: organizationId, setting_key, setting_value});
        if (!result) {
            return jsonResponse(
                {
                    status: false,
                    message: "Organizations Setting is Not Update"
                }, 
                400
            );
        }

        return jsonResponse(
            {
                status: true,
                message: "Organizations Setting Update Successfull",
                data: result
            }, 
            200
        );

    } catch (error) {
        console.error("PATCH /api/organizations/{organizationId}/setting error: ", error);
        return jsonResponse(
            {  
                status: false,
                message: "Internal Server Error",
            },
            500
        );
    }
}
