import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await dbConnect();
                const user = await User.findOne({ email: credentials?.email });

                if (user && user.isActive && await bcrypt.compare(credentials?.password || "", user.passwordHash)) {
                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        department: user.department,
                        position: user.position,
                    };
                }
                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: { token: any, user: any }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.department = user.department;
                token.position = user.position;
            }
            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.department = token.department;
                session.user.position = token.position;
            }
            return session;
        }
    },
    events: {
        async signIn({ user }) {
            await dbConnect();
            const { AuditLog } = await import("@/lib/models");
            await AuditLog.create({
                userId: user.id,
                action: "LOGIN",
                ipAddress: "N/A"
            });
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt" as const,
    },
    secret: process.env.NEXTAUTH_SECRET,
};
