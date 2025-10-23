import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionEmail } from "@/lib/session"

export async function GET(_req: Request, { params }: { params: { id: string }}) {
  const email = await getSessionEmail()
  if (!email) return new NextResponse("Unauthorized", { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return new NextResponse("Unauthorized", { status: 401 })

  const memberships = await prisma.membership.findMany({ where: { userId: user.id } })
  const orgIds = memberships.map(m=>m.organizationId)
  const r = await prisma.request.findUnique({ where: { id: params.id }, include: { statusHistory: true, adminNotes: true, files: true } })
  if (!r || !orgIds.includes(r.organizationId)) return new NextResponse("Not found", { status: 404 })
  return NextResponse.json(r)
}
