
import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookie";
import { verifyAccessToken } from "@/lib/auth/jwt";

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

    const isPrivateRoute = matchesRoute(pathname, privateRoutes);

    const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

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
            response.cookies.delete(ACCESS_TOKEN_COOKIE);
        }

        return response;
    }

    // Remove invalid token.
    if (token && !isAuthenticated) {
        const response = NextResponse.next();

        response.cookies.delete(ACCESS_TOKEN_COOKIE);

        return response;
    }

    return NextResponse.next();
};

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
