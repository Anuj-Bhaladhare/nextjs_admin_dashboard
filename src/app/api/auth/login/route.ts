import bcrypt from "bcryptjs" 
import { NextResponse } from "next/server";

import { randomUUID } from "node:crypto";
import { getPostgresPool } from "@/lib/db/client";
import { createAccessToken } from "@/lib/auth/jwt"
import { hashAccessToken } from "@/lib/auth/session";
import { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_MAX_AGE } from "@/lib/auth/cookie";

import LoginRepository from "./login.repository";
import { LoginBody } from "./login.types";
import { jsonResponse } from "@/app/api/jsonResponse";
 
const [{ getUserByEmail, getUserRoleByUserID, getUserRoleByUserRoleID, getOrganizationByOrganizationID }] = LoginRepository();


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: >
 *       Authenticates a user using their email and password.
 *       Email is trimmed and converted to lowercase.
 *       On successful authentication, a session is created,
 *       an access token is generated, and the token is stored
 *       in an HttpOnly cookie.
 *     operationId: loginUser
 *
 *     requestBody:
 *       required: true
 *       description: User credentials required for login.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 255
 *                 description: User email address.
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: User password (minimum 8 characters).
 *                 example: SecurePass123!
 *
 *     responses:
 *       '200':
 *         description: User login successful. Access token is set in the cookie.
 *         headers:
 *           Set-Cookie:
 *             description: HttpOnly access token cookie.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 access_token:
 *                   type: text
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30
 *                 message:
 *                   type: string
 *                   example: User Login Success..!
 *
 *       '400':
 *         description: Invalid request body, email, password, or credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   examples:
 *                     - Request body must be valid JSON.
 *                     - Please provide a valid email address.
 *                     - Password must be at least 8 characters long.
 *                     - Please Provide Correct Password
 *
 *       '403':
 *         description: Account is not active.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: This account is not active.
 *
 *       '500':
 *         description: Internal server error or access token generation failure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     - Internal Server Error
 *                     - Unable to generate access token.
 */
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
            firstName: user_result.first_name,
            lastName: user_result.last_name,
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
                { 
                    status: true, 
                    access_token: jwt_token,
                    message: "User Login Success..!" 
                },
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
