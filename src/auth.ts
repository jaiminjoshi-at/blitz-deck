
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./lib/db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
// Note: In a real app we would use bcrypt or similar. 
// For this MVP we will compare plain text tokens or mocked hashes for simplicity 
// until we add a proper registration flow with hashing.

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: DrizzleAdapter(db) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
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
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await db.query.users.findFirst({
                    where: eq(users.email, credentials.email as string)
                });

                if (!user) {
                    return null;
                }

                // TODO: REPLACE WITH BCRYPT COMPARE
                if (user.password !== credentials.password) {
                    return null;
                }

                // Ensure strict type match for Drizzle enum role -> string
                return {
                    ...user,
                    role: user.role as string // Explicit cast to satisfy 'string' type
                };
            },
        }),
    ],
});
