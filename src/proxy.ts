
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

// Routes that can be accessed by everyone,
// regardless of whether they are authenticated.
const publicRoutes = [
    "/",
    "/about",
    "/contact",
];

// Routes intended for unauthenticated users.
// Authenticated users will be redirected to the dashboard.
const authRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
];

// Routes that require the user to be authenticated.
const privateRoutes = [
    "/dashboard",
    "/dashboard/admin",
    "/dashboard/members",
    "/dashboard/reports",
    "/dashboard/settings",
    "/dashboard/users",
];

// Check whether the requested pathname matches any route
// in the provided routes array.
//
// Supports exact matches and nested routes.
// Example: /dashboard also matches /dashboard/settings.
const matchesRoute = (pathname: string, routes: string[]) => {
    return routes.some((route) => {
        return (
            pathname === route ||
            (route !== "/" && pathname.startsWith(`${route}/`))
        );
    });
};

// Proxy function runs before matching page requests.
// It handles authentication and route-based redirects.
export const proxy = async (request: NextRequest) => {

    // Get the requested pathname from the current URL.
    const { pathname } = request.nextUrl;

    // Determine which type of route the user is accessing.
    const isPublicRoute = matchesRoute(pathname, publicRoutes);
    const isAuthRoute = matchesRoute(pathname, authRoutes);
    const isPrivateRoute = matchesRoute(pathname, privateRoutes);

    // Get the access token from the request cookies.
    const token = request.cookies.get("access_token")?.value;

    // Verify the access token if it exists.
    // If no token exists or verification fails, payload will be null.
    const payload = token
        ? await verifyAccessToken(token)
        : null;

    // Convert the payload into a boolean authentication status.
    const isAuthenticated = Boolean(payload);

    // --------------------------------------------------
    // 1. PRIVATE ROUTE + UNAUTHENTICATED USER
    // --------------------------------------------------

    // Redirect unauthenticated users to the login page
    // whenever they try to access a protected route.
    if (isPrivateRoute && !isAuthenticated) {

        // Create the login URL.
        const loginUrl = new URL("/login", request.url);

        // Store the originally requested pathname.
        // After successful login, the user can be redirected back.
        loginUrl.searchParams.set("callbackUrl", pathname);

        // Create a redirect response.
        const response = NextResponse.redirect(loginUrl);

        // Delete an invalid or expired access token.
        if (token) {
            response.cookies.delete("access_token");
        }

        return response;
    }

    // --------------------------------------------------
    // 2. AUTH ROUTE + AUTHENTICATED USER
    // --------------------------------------------------

    // Prevent authenticated users from accessing login,
    // register, forgot-password, and other auth pages.
    if (isAuthRoute && isAuthenticated) {

        // Redirect authenticated users to the dashboard.
        return NextResponse.redirect(
            new URL("/dashboard", request.url)
        );
    }

    // --------------------------------------------------
    // 3. INVALID TOKEN CLEANUP
    // --------------------------------------------------

    // If the token exists but is invalid, remove it.
    // This also handles invalid tokens on public and auth routes.
    if (token && !isAuthenticated) {

        const response = NextResponse.next();

        response.cookies.delete("access_token");

        return response;
    }

    // --------------------------------------------------
    // 4. PUBLIC AND AUTHORIZED ROUTES
    // --------------------------------------------------

    // Allow public routes and authenticated users
    // to continue to their requested pages.
    if (isPublicRoute || isPrivateRoute || isAuthRoute) {
        return NextResponse.next();
    }

    // Allow other routes to continue.
    return NextResponse.next();
};

// Configure which requests should pass through the proxy.
export const config = {
    matcher: [
        // Exclude API routes, Next.js static files,
        // image optimization, favicon, and common image files.
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
