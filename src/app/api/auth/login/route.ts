import bcrypt from "bcryptjs" 
import { NextResponse } from "next/server";

import { createAccessToken } from "@/lib/auth/jwt"

import LoginRepository from "./login.repository";
import LoginResponse from "./login.response";
import { LoginBody } from "./login.types";
 
const [{ jsonResponse }]= LoginResponse();  
const [{ getUserByEmail, getUserRoleByUserID, getUserRoleByUserRoleID, getOrganizationByOrganizationID }] = LoginRepository();

export const POST = async (request: Request): Promise<NextResponse> => {
    try {
        
        let body: LoginBody;

        try {
            body = await request.json();
        } catch (error) {
            return jsonResponse(
                { 
                    status: false,
                    error: "Request body must be valid JSON." 
                },
                400,
            );
        }

        const { email, password } = body;

        if (typeof email !== "string" || typeof password !== "string" ) {
            return jsonResponse(
                { 
                    status: false,
                    error: "Email, password and confirm password are required."
                },
                400
            )
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();
        
        // Validate email
        const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if ( !normalizedEmail || normalizedEmail.length > 255 || !EMAIL_PATTERN.test(normalizedEmail)) {
            return jsonResponse (
                { status: false, error: "Please provide a valid email address." },
                400
            )
        }
        
        // Validate Password
        if (password.length < 8) {
            return jsonResponse(
                { error: "Password must be at least 8 characters long." },
                400
            )
        }
        
        // Get User Details by User Email
        const user_result = await getUserByEmail(normalizedEmail);

        // Get User Role by User ID
        const user_roles_junction = await getUserRoleByUserID(user_result.id);

        // Get User Role by User ID
        const user_roles = await getUserRoleByUserRoleID(user_roles_junction.role_id);

        // Get User Role by User ID
        const user_organization = await getOrganizationByOrganizationID(user_roles_junction.organization_id);

        // compair password
        const compairPassword = await bcrypt.compare(password, user_result.password_hash);

        if (!compairPassword) {
            return jsonResponse (
                { status: false, error: "Please Provide Correct Password" },
                400
            )
        }
        
        const payload = {
            userId: user_result.id,
            roleId: user_roles.id,
            organizationId: user_organization.id,
            userRole: user_roles.name,
            status: user_result.status,
            organizationName: user_organization.name,
            firstName: user_result.first_name,
            lastName: user_result.last_name
        }

        const jwt_token = await createAccessToken(payload);

        if (jwt_token) {
            // return user details
            return jsonResponse(
                {
                    status: true,
                    message: "User Login Success..!",
                    token: jwt_token
                },
                200
            )
        } else {
            return jsonResponse(
                {
                    status: false,
                    message: "Unable to generate access token."
                },
                500
            );
        }

    } catch (error) {
        return jsonResponse(
            {  
                status: false, 
                message: "Internal Server Error",
                error: error
            },
            500
        );
    }
}
