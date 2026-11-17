import { jsonResponse } from "@/app/api/jsonResponse";
import { NextRequest, NextResponse } from "next/server";
import { ParamsData, OrganizationData } from "./types";
import OrganizationDetailsRepository from "./repository";

const [{ getOrganizationDetails, updateOrganizationDetails }] = OrganizationDetailsRepository();

// Get organization details
export const GET = async ( 
    request: NextRequest,
    { params }: { params: Promise<ParamsData> }
): Promise<NextResponse> => {
    try {

        const { organizationId } = await params;

        if (!organizationId) {
            return jsonResponse (
                {  
                    status: false, 
                    message: "Provide Organization Id In Params"
                },
                404
            );
        }

        const result = await getOrganizationDetails({id: organizationId})
         
        if ( !result ) {
            return jsonResponse(
                {
                    status: false,
                    message: `Organization of ${organizationId} is Not Found...!`,
                    organizationId: organizationId
                },
                404
            );
        }

        return jsonResponse (
            {  
                status: true, 
                message: "Organization Details Get Successfully",
                organizationId: result
            },
            200
        );
    
    } catch (error) {
        console.error("GET /api/organizations/{organizationId} error: ", error);
        return jsonResponse(
            {  
                status: false, 
                message: "Internal Server Error",
            },
            500
        );
    }
}


// Update organization
export const PATCH = async (
    request: NextRequest,
    { params }: { params: Promise<ParamsData> }
): Promise<NextResponse> => {
    try{

        // Get Data from Params
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
        
        // Get Data from Request Body
        let org_body: OrganizationData;
        try {
            org_body = await request.json();
        } catch (e) {
            throw e;
        }

        const { name, code, description, status } = org_body;
        if ( !name || !code || !description || !status ) {
            return jsonResponse(
                {
                    status: false,
                    message: "Organizations Details Not Foound"
                }, 
                404
            );
        }

        const org_result = await updateOrganizationDetails(
            { id: organizationId, name, code, description, status }
        );

        if (org_result) {
            return jsonResponse(
                {
                    status: true,
                    message: "Organizations Update successfully",
                    data: org_result
                }, 
                200
            );
        } 

        return jsonResponse(
            {
                status: false,
                message: "Organization Not Update...!"
            },
            404
        );

    } catch (error) {
        console.error("PATCH /api/organizations/{organizationId} error: ", error);
        return jsonResponse(
            {  
                status: false, 
                message: "Internal Server Error",
            },
            500
        );
    }
}
