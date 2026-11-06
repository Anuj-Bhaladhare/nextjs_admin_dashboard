
import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";

// Require the user to be authenticated and have one
// of the specified roles before accessing protected resources.
//
// allowedRoles: An array of roles permitted to access the resource.
export const requireRole = async (allowedRoles: string[]) => {

    // Get the currently authenticated user's information.
    // Returns user details if authenticated, otherwise null.
    const user = await getCurrentUser();

    // Check whether the user is authenticated.
    // If no valid user is found, redirect to the login page.
    if (!user) {
        redirect("/login");
    }

    // Check whether the authenticated user's role
    // exists in the list of allowed roles.
    // 
    // If the user's role is not allowed,
    // redirect them to the dashboard.
    if (!allowedRoles.includes(user.role)) {
        redirect("/dashboard");
    }

    // Return the authenticated user if authentication
    // and role authorization are successful.
    return user;
};
