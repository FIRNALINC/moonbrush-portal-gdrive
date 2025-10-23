import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import Link from "next/link"
import { getSessionEmail } from "@/lib/session"

export default async function AdminQueue() {
  const email = await getSessionEmail()
  if (!email) throw new Error("Unauthorized")
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.role !== Role.ADMIN) throw new Error("Forbidden")

  const requests = await prisma.request.findMany({ orderBy: { submittedAt: "desc" }, include: { organization: true } })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Master Request Queue</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map(r => (
          <div className="card p-4" key={r.id}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{r.title}</h3>
                <p className="text-sm opacity-80">{r.organization.name}</p>
                <p className="text-xs opacity-70">{new Date(r.submittedAt).toLocaleString()}</p>
              </div>
              <span className="text-xs">{r.status}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Link className="btn btn-ghost" href={`/admin/requests/${r.id}`}>Manage</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
