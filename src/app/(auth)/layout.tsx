
import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

// This component handles authentication.
// All request-specific data access happens here.
async function AuthGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (user) {
        redirect("/dashboard");
    }

    return <>{children}</>;
}

// Keep the layout itself synchronous.
// Do not call getCurrentUser() directly here.
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="auth-layout">
            <Suspense
                fallback={
                    <div className="flex min-h-screen items-center justify-center">
                        Loading authentication...
                    </div>
                }
            >
                <AuthGuard>
                    {children}
                </AuthGuard>
            </Suspense>
        </div>
    );
}
