import { NextResponse, NextRequest } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { OrganizationBody } from "./organizations.types";
import OrganizationRepository from "./organizations.repository";

const [{ getOrganization, createOrganization }] = OrganizationRepository();


// List organizations accessible to caller
export const GET = async ( 
    request: NextRequest 
): Promise<NextResponse> => {

    try{

        // User Authentication Pending

        const result = await getOrganization();

        if (result) {
            return jsonResponse(
                {
                    status: true,
                    message: "Organizations retrieved successfully",
                    data: result
                }, 
                200
            );
        } 

        return jsonResponse(
            {
                status: false,
                message: "Organization List is Not Found...!"
            },
            404
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
      
        let org_body: OrganizationBody;
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
                    message: "Please Provide Organization Details to Create Organization"
                }, 
                404
            );
        }

        const org_result = await createOrganization(
            {name, code, description, status}
        );

        if (org_result) {
            return jsonResponse(
                {
                    status: true,
                    message: "Organizations Created successfully",
                    data: org_result
                }, 
                200
            );
        } 

        return jsonResponse(
            {
                status: false,
                message: "Organization Not Create...!"
            },
            400
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
