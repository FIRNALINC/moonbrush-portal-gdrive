import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { getSessionEmail } from "@/lib/session"

export async function GET(_req: Request, { params }: { params: { id: string }}) {
  const email = await getSessionEmail()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.role !== Role.ADMIN) return new NextResponse("Forbidden", { status: 403 })
  const reqRec = await prisma.request.findUnique({ where: { id: params.id } })
  if (!reqRec?.aiSql) return new NextResponse("Not Found", { status: 404 })
  return new Response(reqRec.aiSql, { headers: { "Content-Type": "text/plain", "Content-Disposition": `attachment; filename="request-${params.id}.sql"` } })
}
