
import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
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

    return NextResponse.next();
});

// Matcher from standard NextAuth docs to invoke middleware on most paths
export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
