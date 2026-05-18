import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { supabase } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com or user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Mock authentication for social logins
        if (credentials?.email === "google-mock@example.com" && credentials?.password === "oauth123") {
          return { id: "google-oauth", name: "Google Customer", email: "google-mock@example.com", role: "user" };
        }
        if (credentials?.email === "github-mock@example.com" && credentials?.password === "oauth123") {
          return { id: "github-oauth", name: "GitHub Coder", email: "github-mock@example.com", role: "user" };
        }
        
        // Supabase Database Authentication Check
        try {
          if (!credentials?.email || !credentials?.password) return null;

          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", credentials.email.toLowerCase())
            .single();

          if (error) {
            console.error("Supabase error looking up user:", error.message);
            return null;
          }

          if (user && user.password === credentials.password) {
            // Check if the account was deleted
            if (user.status === "Deleted") {
               throw new Error("This account has been deleted.");
            }
            return { id: user.id.toString(), name: user.name, email: user.email, role: user.role };
          }
        } catch (e) {
          console.error("Error reading users from Supabase in NextAuth", e);
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
