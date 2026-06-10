import { withAuth } from "next-auth/middleware";

import { hasApiAccessToken } from "./lib/identity/session";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ req, token }) {
      if (req.nextUrl.pathname === "/") return true;
      if (req.nextUrl.pathname.startsWith("/login")) return true;
      return hasApiAccessToken(token);
    },
  },
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
