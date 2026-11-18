import { NextResponse, NextRequest } from "next/server";
import { jsonResponse } from "@/app/api/jsonResponse";
import { getCurrentUser } from "@/lib/auth/session";
import { OrganizationBody } from "./organizations.types";
import OrganizationRepository from "./organizations.repository";

const [{ getOrganization, createOrganization }] = OrganizationRepository();

// List organizations accessible to caller
export const GET = async (): Promise<NextResponse> => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return jsonResponse(
                {
                    status: false,
                    message: "Unauthorized."
                },
                401
            );
        }

        const result = await getOrganization(user.id);

        if (Array.isArray(result) && result.length > 0) {
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
                message: "No organizations found for this user."
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
};

// Create organization
export const POST = async (
    request: NextRequest
): Promise<NextResponse> => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return jsonResponse(
                {
                    status: false,
                    message: "Unauthorized."
                },
                401
            );
        }

        let org_body: OrganizationBody;
        try {
            org_body = await request.json();
        } catch (e) {
            throw e;
        }

        const { name, code, description, status } = org_body;
        if (!name || !code || !description || !status) {
            return jsonResponse(
                {
                    status: false,
                    message: "Please provide organization details to create organization."
                },
                400
            );
        }

        const org_result = await createOrganization(
            { name, code, description, status },
            user.id
        );

        if (org_result) {
            return jsonResponse(
                {
                    status: true,
                    message: "Organization created successfully",
                    data: org_result
                },
                201
            );
        }

        return jsonResponse(
            {
                status: false,
                message: "Organization could not be created."
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
};
