import { Header } from "@/components/Header"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session || !session.user) {
    redirect("/login")
  }

  // This layout is for admins, so if a client lands here, send them home
  if (session.user.role === "CLIENT") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAdmin={true} />
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
