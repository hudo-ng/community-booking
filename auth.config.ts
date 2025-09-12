import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import z from "zod";
import { compare } from "bcryptjs";
import { prisma } from "./lib/db";

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const { email, password } = LoginSchema.parse(raw);
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user || !user.passwordHash) return null;
        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.UserId,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as
          | "CUSTOMER"
          | "PROVIDER"
          | "ADMIN"
          | "SUPERADMIN";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
