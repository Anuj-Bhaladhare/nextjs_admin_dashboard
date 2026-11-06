
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

const publicRoutes = [
    "/",
    "/about",
    "/contact",
];

const authRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
];

const privateRoutes = [
    "/dashboard",
    "/admin",
    "/members",
    "/reports",
    "/settings",
    "/users",
];

const matchesRoute = (pathname: string, routes: string[]) => {
    return routes.some((route) => {
        return (
            pathname === route ||
            (route !== "/" && pathname.startsWith(`${route}/`))
        );
    });
};

export const proxy = async (request: NextRequest) => {
    const { pathname } = request.nextUrl;

    const isAuthRoute = matchesRoute(pathname, authRoutes);
    const isPrivateRoute = matchesRoute(pathname, privateRoutes);

    const token = request.cookies.get("access_token")?.value;

    let payload = null;

    if (token) {
        try {
            payload = await verifyAccessToken(token);
        } catch {
            payload = null;
        }
    }

    const isAuthenticated = Boolean(payload);

    // Private route protection.
    if (isPrivateRoute && !isAuthenticated) {
        const loginUrl = new URL("/login", request.url);

        loginUrl.searchParams.set("callbackUrl", pathname);

        const response = NextResponse.redirect(loginUrl);

        if (token) {
            response.cookies.delete("access_token");
        }

        return response;
    }

    // Prevent authenticated users from accessing auth pages.
    if (isAuthRoute && isAuthenticated) {
        return NextResponse.redirect(
            new URL("/dashboard", request.url)
        );
    }

    // Remove invalid token.
    if (token && !isAuthenticated) {
        const response = NextResponse.next();

        response.cookies.delete("access_token");

        return response;
    }

    return NextResponse.next();
};

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};

