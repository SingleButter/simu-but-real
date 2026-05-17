import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GitHubProvider from "next-auth/providers/github";
import { ensureStarterAssignment } from "@/lib/onboarding";
import { prisma } from "@/lib/prisma";

type GitHubProfile = {
  id: number;
  login: string;
  name?: string | null;
};

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? ""
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ profile }) {
      if (!profile || !("id" in profile) || !("login" in profile)) {
        return false;
      }

      const githubProfile = profile as GitHubProfile;

      const user = await prisma.user.upsert({
        where: { githubId: String(githubProfile.id) },
        update: {
          githubLogin: githubProfile.login,
          displayName: githubProfile.name ?? githubProfile.login
        },
        create: {
          githubId: String(githubProfile.id),
          githubLogin: githubProfile.login,
          displayName: githubProfile.name ?? githubProfile.login,
          level: "Java 入门 I"
        }
      });

      await ensureStarterAssignment({
        userId: user.id,
        githubId: user.githubId,
        githubLogin: user.githubLogin
      });

      return true;
    },
    async jwt({ token, profile }) {
      if (profile && "id" in profile && "login" in profile) {
        const githubProfile = profile as GitHubProfile;
        token.githubId = String(githubProfile.id);
        token.githubLogin = githubProfile.login;
      }

      return token;
    },
    async session({ session, token }) {
      return withUserSession(session, token);
    }
  },
  pages: {
    signIn: "/"
  }
};

function withUserSession(session: Session, token: JWT): Session {
  if (session.user) {
    session.user.githubId =
      typeof token.githubId === "string" ? token.githubId : undefined;
    session.user.githubLogin =
      typeof token.githubLogin === "string" ? token.githubLogin : undefined;
  }

  return session;
}
