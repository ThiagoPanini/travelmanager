import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    apiAccessToken?: string;
    provider?: string;
    user?: DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    apiAccessToken?: string;
    provider?: string;
  }
}
