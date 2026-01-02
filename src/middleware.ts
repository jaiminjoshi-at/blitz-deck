
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

export default NextAuth(authConfig).auth((req) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;
    const userRole = req.auth?.user?.role;

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isAuthRoute = nextUrl.pathname.includes("/login");
    const isAdminRoute = nextUrl.pathname.startsWith("/admin");
    const isPublicRoute = false; // Root is now private

    if (isApiAuthRoute) return NextResponse.next();

    if (isAuthRoute) {
        if (isLoggedIn) {
            if (userRole === "admin") {
                return NextResponse.redirect(new URL("/admin", nextUrl));
            }
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
        return NextResponse.next();
    }

    if (!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // RBAC: Block Learners from Admin Routes
    if (isAdminRoute && userRole !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    const response = NextResponse.next();

    // Fix: Prevent caching of protected pages (Ghost Page "Back" button issue)
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
});

// Matcher from standard NextAuth docs to invoke middleware on most paths
export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
