import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import fs from "fs";
import path from "path";

const usersFilePath = path.join(process.cwd(), "lib", "users.json");

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
        if (credentials?.email === "admin@example.com" && credentials?.password === "admin123") {
          return { id: "1", name: "Admin User", email: "admin@example.com", role: "admin" };
        }
        if (credentials?.email === "user@example.com" && credentials?.password === "user123") {
          return { id: "2", name: "Demo User", email: "user@example.com", role: "user" };
        }
        
        // Mock authentication for social logins
        if (credentials?.email === "google-mock@example.com" && credentials?.password === "oauth123") {
          return { id: "google-oauth", name: "Google Customer", email: "google-mock@example.com", role: "user" };
        }
        if (credentials?.email === "github-mock@example.com" && credentials?.password === "oauth123") {
          return { id: "github-oauth", name: "GitHub Coder", email: "github-mock@example.com", role: "user" };
        }
        
        // Dynamically registered custom users check
        try {
          if (fs.existsSync(usersFilePath)) {
            const data = fs.readFileSync(usersFilePath, "utf-8");
            const customUsers = JSON.parse(data || "[]");
            const matched = customUsers.find(
              (u: any) => 
                u.email.toLowerCase() === credentials?.email?.toLowerCase() && 
                u.password === credentials?.password
            );
            if (matched) {
              return { id: matched.id, name: matched.name, email: matched.email, role: matched.role };
            }
          }
        } catch (e) {
          console.error("Error reading users.json in NextAuth", e);
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "user"; // Default role to 'user' for OAuth logins
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
