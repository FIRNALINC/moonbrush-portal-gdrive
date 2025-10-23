import Card from "@/components/Card"
import { prisma } from "@/lib/prisma"
import { getSessionEmail } from "@/lib/session"
import { StatusBadge } from "@/components/StatusBadge"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function RequestDetail({ params }: { params: { id: string } }) {
  const email = await getSessionEmail()
  if (!email) throw new Error("Unauthorized")
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error("Unauthorized")

  const memberships = await prisma.membership.findMany({ where: { userId: user.id } })
  const orgIds = memberships.map(m=>m.organizationId)
  const r = await prisma.request.findUnique({
    where: { id: params.id },
    include: { statusHistory: { orderBy: { createdAt: "desc" } }, adminNotes: { orderBy: { createdAt: "desc" } }, files: true }
  })
  if (!r || !orgIds.includes(r.organizationId)) return notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{r.title}</h1>
          <p className="text-sm opacity-75">Submitted {new Date(r.submittedAt).toLocaleString()}</p>
        </div>
        <StatusBadge status={r.status} />
      </div>

      <Card>
        <h2 className="font-semibold mb-2">Criteria</h2>
        <pre className="text-sm opacity-90 overflow-auto">{JSON.stringify(r.criteria, null, 2)}</pre>
      </Card>

      <Card>
        <h2 className="font-semibold mb-2">Timeline</h2>
        <ul className="text-sm space-y-2">
          {r.statusHistory.map(s => (
            <li key={s.id}>{new Date(s.createdAt).toLocaleString()} — {s.from || "SUBMITTED"} → {s.to} {s.note ? `• ${s.note}` : ""}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-semibold mb-2">Admin Notes</h2>
        <ul className="text-sm space-y-2">
          {r.adminNotes.map(n => (
            <li key={n.id}>{new Date(n.createdAt).toLocaleString()} — {n.body}</li>
          ))}
        </ul>
      </Card>

      {r.status === "COMPLETE" && (
        <Card>
          <h2 className="font-semibold mb-2">Downloads</h2>
          <div className="flex gap-2">
            {r.files.map(f => (
              <Link key={f.id} className="btn" href={`/api/files/download?id=${f.id}`}>Download {f.kind}</Link>
            ))}
          </div>
          <p className="text-xs opacity-70 mt-2">Files retained until {new Date(r.files[0]?.availableUntil || Date.now()).toLocaleDateString()}.</p>
        </Card>
      )}
    </div>
  )
}
