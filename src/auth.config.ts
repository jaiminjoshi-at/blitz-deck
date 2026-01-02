import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    session: { strategy: "jwt" },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.assignedAdminId = user.assignedAdminId;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.role = (token.role as string) || 'learner';
                session.user.id = token.id as string;
                session.user.assignedAdminId = token.assignedAdminId as string | null;
            }
            return session;
        }
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
