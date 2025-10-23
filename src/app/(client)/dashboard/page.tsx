import Card from "@/components/Card"
import { prisma } from "@/lib/prisma"
import { getSessionEmail } from "@/lib/session"
import Link from "next/link"
import { StatusBadge } from "@/components/StatusBadge"

export default async function Dashboard() {
  const email = await getSessionEmail()
  if (!email) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error("Unauthorized")

  const memberships = await prisma.membership.findMany({ where: { userId: user.id } })
  const orgIds = memberships.map(m=>m.organizationId)
  const requests = await prisma.request.findMany({
    where: { organizationId: { in: orgIds } },
    orderBy: { submittedAt: "desc" }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Requests</h1>
        <Link className="btn" href="/requests/new">Create Request</Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map(r => (
          <Card key={r.id}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{r.title}</h3>
                <p className="text-sm opacity-80">{new Date(r.submittedAt).toLocaleString()}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div className="mt-4 flex gap-2">
              <Link className="btn btn-ghost" href={`/requests/${r.id}`}>Open</Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
