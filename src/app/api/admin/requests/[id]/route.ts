import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { getSessionEmail } from "@/lib/session"

export async function GET(_req: Request, { params }: { params: { id: string }}) {
  const email = await getSessionEmail()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.role !== Role.ADMIN) return new NextResponse("Forbidden", { status: 403 })
  const r = await prisma.request.findUnique({ where: { id: params.id }, include: { files: true } })
  if (!r) return new NextResponse("Not found", { status: 404 })
  return NextResponse.json(r)
}

export async function POST(req: Request, { params }: { params: { id: string }}) {
  const email = await getSessionEmail()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.role !== Role.ADMIN) return new NextResponse("Forbidden", { status: 403 })
  const { status, note } = await req.json()

  const current = await prisma.request.findUnique({ where: { id: params.id } })
  if (!current) return new NextResponse("Not found", { status: 404 })

  if (status && status !== current.status) {
    await prisma.request.update({ where: { id: params.id }, data: { status } })
    await prisma.statusChange.create({ data: { requestId: params.id, from: current.status, to: status, changedById: user.id, note: note || null } })
  }
  if (note && (!status || status === current.status)) {
    await prisma.adminNote.create({ data: { requestId: params.id, body: note, createdById: user.id } })
  }
  return NextResponse.json({ ok: true })
}
