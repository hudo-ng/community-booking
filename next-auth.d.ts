import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "PROVIDER";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "CUSTOMER" | "PROVIDER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "CUSTOMER" | "PROVIDER";
  }
}
