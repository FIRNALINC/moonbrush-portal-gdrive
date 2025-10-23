import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  // Check user role from the session and redirect
  // Note: We cast session.user.role to Role because NextAuth types are generic
  switch (session.user.role as Role) {
    case "ADMIN":
      redirect("/admin/queue")
      break
    case "CLIENT":
      redirect("/dashboard")
      break
    default:
      // Fallback in case user has session but no recognized role
      redirect("/login")
  }

  return null
}
