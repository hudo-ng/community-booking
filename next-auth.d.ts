import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "PROVIDER" | "ADMIN" | "SUPERADMIN";
      emailVerified: Date?
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "CUSTOMER" | "PROVIDER" | "ADMIN" | "SUPERADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "CUSTOMER" | "PROVIDER" | "ADMIN" | "SUPERADMIN";
    emailVerified: Date?
  }
}
