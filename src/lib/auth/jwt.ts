
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
    organizationId: string,
    userRole: string,
    status: string,
    organizationName: string,
    firstName: string,
    lastName: string
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
        status: payload.status,
        organizationName: payload.organizationName,
        firstName: payload.firstName,
        lastName: payload.lastName
    })
        // Set the signing algorithm to HS256.
        .setProtectedHeader({ alg: "HS256" })

        // Set the user ID as the subject (sub) claim.
        .setSubject(payload.userId)

        // Set the trusted issuer of the token.
        .setIssuer(process.env.JWT_ISSUER!)

        // Define the intended audience of the token.
        .setAudience(process.env.JWT_AUDIENCE!)

        // Automatically add the token creation timestamp (iat).
        .setIssuedAt()

        // Set the token expiration time to 15 minutes.
        .setExpirationTime(process.env.JWT_EXPIRES_IN!)

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
        if (
            typeof payload.sub !== "string" ||
            typeof payload.userRole !== "string"
        ) {
            return null;
        }

        // Return the verified user information.
        // The subject claim is mapped to userId.
        return {
            userId: payload.sub,
            userRole: payload.userRole
        };

    } catch (error) {

        // Log the verification error.
        // This can happen if the token is expired, invalid,
        // incorrectly signed, or has invalid claims.
        console.log("Error Occure in verify Access Token", error);

        // Return null when token verification fails.
        return null;
    }
}
