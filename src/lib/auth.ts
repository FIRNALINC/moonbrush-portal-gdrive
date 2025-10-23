import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client" // <-- IMPORT ROLE

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // This is where we fetch the user from the DB
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null
        }

        // Find the user AND their first membership
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { memberships: true }, // <-- GET MEMBERSHIP
        })

        // Check password and if they belong to an organization
        if (
          user &&
          user.memberships.length > 0 && // <-- CHECK THEY HAVE A MEMBERSHIP
          bcrypt.compareSync(credentials.password, user.password)
        ) {
          // Return the data we need for the session token
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.memberships[0].organizationId, // <-- ADD ORG ID
          }
        }
        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,

  // --- THIS CALLBACKS BLOCK IS NEW ---
  callbacks: {
    // This runs when the JWT is created (at login)
    async jwt({ token, user }) {
      // 'user' is the object from the 'authorize' function
      if (user) {
        token.id = user.id
        token.role = user.role
        token.organizationId = user.organizationId
      }
      return token
    },
    // This runs when a session is accessed (e.g., with getServerSession)
    async session({ session, token }) {
      // 'token' has the data we stored in 'jwt'
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.organizationId = token.organizationId
      }
      return session
    },
  },
  // --- END NEW BLOCK ---

  pages: {
    signIn: "/login",
  },
}
