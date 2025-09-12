import withAuth from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      if (!token) return false;
      if (path.startsWith("/root")) return token.role === "SUPERADMIN";
      if (path.startsWith("/admin"))
        return token.role === "PROVIDER" || token.role === "ADMIN";
      return true;
    },
  },
});

export const config = { matcher: ["/admin/:path*", "/root/:path*"] };
