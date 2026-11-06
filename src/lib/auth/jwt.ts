
import "server-only";

// Import JWT utilities from jose.
// SignJWT is used to create JWT tokens.
// jwtVerify is used to verify and validate JWT tokens.
import { SignJWT, jwtVerify } from "jose";

// Get the JWT secret from environment variables.
// This secret is used to sign and verify JWT tokens.
const secret = process.env.JWT_SECRET;

// Make sure JWT_SECRET is configured.
// Throw an error if the secret is missing.
if (!secret) {
    throw new Error("JWT_SECRET is Not Configured");
}

// Convert the secret string into a Uint8Array.
// jose requires the secret key in this format for HS256.
const secretKey = new TextEncoder().encode(secret);

// Define the structure of the access token payload.
// userId identifies the authenticated user.
// role defines the user's authorization role.
export interface AccessTokenPayload {
    userId: string,
    roleId: string,
    organizationId: string | null,
    userRole: string,
    sessionId: string,
}

// Create a new access token for an authenticated user.
export async function createAccessToken(
    payload: AccessTokenPayload
) {
    return new SignJWT({
        // Store the user's role inside the JWT payload.
        userId: payload.userId,
        roleId: payload.roleId,
        organizationId: payload.organizationId,
        userRole: payload.userRole,
    })
        // Set the signing algorithm to HS256.
        .setProtectedHeader({ alg: "HS256" })

        // Set the user ID as the subject (sub) claim.
        .setSubject(payload.userId)
        .setJti(payload.sessionId)

        // Set the trusted issuer of the token.
        .setIssuer(process.env.JWT_ISSUER!)

        // Define the intended audience of the token.
        .setAudience(process.env.JWT_AUDIENCE!)

        // Automatically add the token creation timestamp (iat).
        .setIssuedAt()

        // Keep the access token lifetime aligned with the session cookie.
        .setExpirationTime("7d")

        // Sign the JWT using the secret key and return the token.
        .sign(secretKey);
}

// Verify an existing access token and extract its payload.
export async function verifyAccessToken(token: string) {

    try {

        // Verify the JWT signature and validate its claims.
        const { payload } = await jwtVerify(token, secretKey, {
            // Ensure the token was issued by the expected issuer.
            issuer: process.env.JWT_ISSUER,

            // Ensure the token is intended for the expected audience.
            audience: process.env.JWT_AUDIENCE,

            // Allow only the HS256 signing algorithm.
            algorithms: ["HS256"],
        });

        // Validate that the subject and role claims are strings.
        // Return null if either claim is missing or has an invalid type.
        const organizationId = payload.organizationId;

        if (
            typeof payload.sub !== "string" ||
            typeof payload.jti !== "string" ||
            typeof payload.roleId !== "string" ||
            (typeof organizationId !== "string" && organizationId !== null) ||
            typeof payload.userRole !== "string"
        ) {
            return null;
        }

        // Return the verified user information.
        // The subject claim is mapped to userId.
        return {
            userId: payload.sub,
            userRole: payload.userRole,
            sessionId: payload.jti,
            roleId: payload.roleId,
            organizationId,
        };

    } catch {

        // Return null when token verification fails.
        return null;
    }
}
