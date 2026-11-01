
import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

// AuthLayout protects authentication pages such as:
// Login, Register, Forgot Password, Reset Password, etc.
//
// Authenticated users should not be able to access these pages.
const AuthLayout = async ({
    children
}: {
    children: React.ReactNode
}) => {

    // Get the currently authenticated user's information.
    // Returns user details if authenticated, otherwise null.
    const user = await getCurrentUser();

    // If the user is already authenticated,
    // redirect them to the dashboard.
    //
    // IMPORTANT:
    // Keep redirect() outside try-catch because
    // Next.js redirect() works by throwing a special error.
    if (user) {
        redirect("/dashboard");
    }

    // If the user is not authenticated,
    // allow them to access authentication pages.
    return (
        <div className="auth-layout">
            {children}
        </div>
    );
};

export default AuthLayout;
