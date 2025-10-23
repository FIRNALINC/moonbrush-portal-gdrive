import { Header } from "@/components/Header"
import { getServerSession } from "next-auth/next" // Import from next-auth/next
import { authOptions } from "@/lib/auth"          // Import your authOptions
import { redirect } from "next/navigation"

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions) // Call getServerSession with authOptions
  if (!session || !session.user) {
    redirect("/login")
  }

  // This layout is for clients, so if an admin lands here, send them home
  if (session.user.role === "ADMIN") {
    redirect("/admin/queue")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAdmin={false} />
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
