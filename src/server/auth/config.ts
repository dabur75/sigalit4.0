import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import { db } from "~/server/db";
import { comparePassword } from "~/lib/auth-utils";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      role: string;
      houseId?: string;
      isActive: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    role: string;
    houseId?: string;
    isActive: boolean;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "שם משתמש", type: "text" },
        password: { label: "סיסמה", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ username: z.string().min(1), password: z.string().min(1) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { username, password } = parsedCredentials.data;

        // Find user by username
        const user = await db.user.findUnique({
          where: { username: username.toLowerCase() }
        });

        if (!user?.password) {
          return null;
        }

        // Check if user is active
        if (!user.isActive) {
          return null;
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          houseId: user.houseId ?? undefined,
          isActive: user.isActive,
        };
      }
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.username = user.username;
        token.role = user.role;
        token.houseId = user.houseId;
        token.isActive = user.isActive;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub!,
        username: token.username as string,
        role: token.role as string,
        houseId: token.houseId as string | undefined,
        isActive: token.isActive as boolean,
      },
    }),
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
} satisfies NextAuthConfig;
