import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "a_very_secret_string_for_doubtconnect_development",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-google-client-secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          academicYear: user.academicYear,
          points: user.points,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            existingUser = await prisma.user.create({
              data: {
                fullName: user.name || "Google User",
                email: user.email,
                password: "", // Google OAuth user
                college: "DoubtConnect Member",
                branch: "Computer Science",
                academicYear: "Senior",
                subjects: "General",
                skills: "Problem Solving",
                points: 10,
              },
            });
          }

          (user as any).id = existingUser.id;
          (user as any).academicYear = existingUser.academicYear;
          (user as any).points = existingUser.points;
        } catch (err) {
          console.error("GOOGLE_SIGNIN_SYNC_ERROR", err);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.academicYear = (user as any).academicYear;
        token.points = (user as any).points;
      }
      if (!token.id && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
          if (dbUser) {
            token.id = dbUser.id;
            token.academicYear = dbUser.academicYear;
            token.points = dbUser.points;
          }
        } catch (e) {
          console.error("JWT_USER_LOOKUP_ERROR", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).academicYear = token.academicYear as string;
        (session.user as any).points = token.points as number;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
};
