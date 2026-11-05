
import "server-only";

// Import cookies() from Next.js to access cookies stored in the user's browser.
import { cookies } from "next/headers";

// Import the function used to verify the JWT access token.
import { verifyAccessToken } from "./jwt";

// Get the currently authenticated user's information.
export const getCurrentUser = async () => {

    // Get the cookies stored in the incoming request.
    // In Next.js, cookies() is asynchronous.
    const cookieStore = await cookies();

    // Retrieve the access_token cookie.
    // Optional chaining (?.) prevents errors if the cookie does not exist.
    // The .value property extracts the actual JWT token.
    const token = cookieStore.get('token')?.value;

    // If no access token is found, the user is not authenticated.
    if (!token) {
        return null;
    }

    // Verify the access token.
    // This checks the token's signature, expiration, issuer, and audience.
    const payload = await verifyAccessToken(token);

    // If the token is invalid or expired, return null.
    if (!payload) {
        return null;
    }

    // Return the authenticated user's information.
    // Map userId to id and include the user's role.
    return {
        id: payload.userId,
        role: payload.userRole
    };
}
