
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./lib/db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
// Note: In a real app we would use bcrypt or similar. 
// For this MVP we will compare plain text tokens or mocked hashes for simplicity 
// until we add a proper registration flow with hashing.

import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    adapter: DrizzleAdapter(db) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                console.log("🔑 NextAuth authorize called with email:", credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    console.log("❌ Missing email or password in credentials");
                    return null;
                }

                const user = await db.query.users.findFirst({
                    where: eq(users.email, credentials.email as string)
                });

                console.log("👤 Found user in DB:", user ? { id: user.id, email: user.email, role: user.role } : "none");

                if (!user) {
                    console.log("❌ User not found in database");
                    return null;
                }

                // TODO: REPLACE WITH BCRYPT COMPARE
                if (user.password !== credentials.password) {
                    console.log("❌ Password mismatch for user:", user.email);
                    return null;
                }

                // Ensure strict type match for Drizzle enum role -> string
                console.log("✅ Authentication successful, returning user:", user.email);
                return {
                    ...user,
                    role: user.role as string // Explicit cast to satisfy 'string' type
                };
            },
        }),
    ],
});
