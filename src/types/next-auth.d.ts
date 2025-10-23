import { Role } from "@prisma/client"
import { DefaultSession } from "next-auth"

// Define our custom user properties
type CustomUser = {
  id: string
  organizationId: string
  role: Role
}

// Augment the next-auth Session module
declare module "next-auth" {
  /**
   * This is the object available in getServerSession
   */
  interface Session {
    user: CustomUser & DefaultSession["user"] // Combines our custom user with default { name, email, image }
  }

  /**
   * This is the object returned from the authorize callback
   */
  interface User extends CustomUser {}
}

// Augment the next-auth JWT module
declare module "next-auth/jwt" {
  /**
   * This is the object that is encrypted in the token
   */
  interface JWT extends CustomUser {}
}
