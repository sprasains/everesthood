import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('CredentialsProvider: Missing email or password');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        console.log('CredentialsProvider: user from DB:', user);
        if (!user || !user.passwordHash) {
          console.log('CredentialsProvider: No user or no password field');
          return null;
        }

        console.log('CredentialsProvider: comparing passwords', {
          provided: credentials.password,
          storedHash: user.passwordHash,
        });
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        console.log('CredentialsProvider: isPasswordValid:', isPasswordValid);

        if (!isPasswordValid) {
          console.log('CredentialsProvider: Password mismatch');
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Add role to token if available
        // If user object does not have role, fetch from DB
        if ('role' in user && user.role) {
          token.role = user.role;
        } else if (user.email) {
          // Fetch user from DB to get role
          const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
          token.role = dbUser?.role || 'USER';
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // Add role to session.user
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google" || account?.provider === "github") {
          if (user.email) {
            await prisma.user.upsert({
              where: { email: user.email },
              update: {},
              create: {
                email: user.email,
                name: user.name,
                image: user.image,
              },
            });
          }
        }
        return true;
      } catch (error) {
        console.error("Error during signIn callback: ", error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/dashboard";
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
