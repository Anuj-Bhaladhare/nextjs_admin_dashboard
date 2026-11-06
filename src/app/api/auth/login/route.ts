import bcrypt from "bcryptjs" 
import { NextResponse } from "next/server";

import { randomUUID } from "node:crypto";
import { getPostgresPool } from "@/lib/db/client";
import { createAccessToken } from "@/lib/auth/jwt"
import { hashAccessToken } from "@/lib/auth/session";
import { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_MAX_AGE } from "@/lib/auth/cookie";

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
        } catch {
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

        if (user_result.status !== "ACTIVE") {
            return jsonResponse(
                { status: false, error: "This account is not active." },
                403,
            );
        }

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
        
        const sessionId = randomUUID();
        const payload = {
            userId: user_result.id,
            roleId: user_roles.id,
            organizationId: user_organization.id,
            userRole: user_roles.name,
            sessionId,
        }

        const jwt_token = await createAccessToken(payload);

        if (jwt_token) {
            const expiresAt = new Date(Date.now() + ACCESS_TOKEN_MAX_AGE * 1000);

            await getPostgresPool().query(
                `INSERT INTO auth.sessions
                    (id, user_id, token_hash, user_agent, expires_at)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    sessionId,
                    user_result.id,
                    hashAccessToken(jwt_token),
                    request.headers.get("user-agent")?.slice(0, 1000) ?? null,
                    expiresAt,
                ],
            );

            const response = jsonResponse(
                { status: true, message: "User Login Success..!" },
                200,
            );
            response.cookies.set(ACCESS_TOKEN_COOKIE, jwt_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: ACCESS_TOKEN_MAX_AGE,
            });
            return response;
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
