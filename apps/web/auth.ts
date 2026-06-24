import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyOtp } from "@/lib/auth/otp";

/**
 * Cabeamento do Auth.js v5 (ADR-0004): o web é cliente OAuth + BFF; a API é a
 * autoridade de identidade. O provedor `otp` (Credentials) entrega e-mail+código à
 * API interna via `verifyOtp`; o token opaco que ela cunha viaja no JWT (cookie
 * httpOnly) e é repassado como `Bearer` pelo BFF — nunca chega ao browser. O Google
 * chega na fatia #191.
 */

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    needsOnboarding?: boolean;
  }
  interface User {
    accessToken?: string;
    needsOnboarding?: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: "otp",
      name: "Código de embarque",
      credentials: { email: {}, code: {} },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const code = typeof credentials?.code === "string" ? credentials.code : "";
        if (!email || !code) {
          return null;
        }
        const user = await verifyOtp(email, code);
        if (!user) {
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          accessToken: user.accessToken,
          needsOnboarding: user.needsOnboarding,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.accessToken = user.accessToken;
        token.needsOnboarding = user.needsOnboarding;
      }
      return token;
    },
    session: ({ session, token }) => {
      // O JWT do Auth.js tem index signature (valores `unknown`); estreita na leitura.
      session.accessToken = token.accessToken as string | undefined;
      session.needsOnboarding = token.needsOnboarding as boolean | undefined;
      return session;
    },
  },
});
