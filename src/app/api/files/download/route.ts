import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionEmail } from "@/lib/session"
import { getFileBuffer } from "@/lib/storage"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get("id")
  if (!id) return new NextResponse("Bad Request", { status: 400 })

  const email = await getSessionEmail()
  if (!email) return new NextResponse("Unauthorized", { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return new NextResponse("Unauthorized", { status: 401 })

  const file = await prisma.fulfillmentFile.findUnique({ where: { id }, include: { request: true } })
  if (!file) return new NextResponse("Not Found", { status: 404 })

  const memberships = await prisma.membership.findMany({ where: { userId: user.id } })
  const orgIds = new Set(memberships.map(m=>m.organizationId))
  if (!orgIds.has(file.request.organizationId)) return new NextResponse("Forbidden", { status: 403 })

  if (new Date() > file.availableUntil) return new NextResponse("Expired", { status: 410 })

  const { buffer, filename, mimeType } = await getFileBuffer(file.storageKey)
  return new NextResponse(new Uint8Array(buffer).buffer, { headers: { "Content-Type": mimeType, "Content-Disposition": `attachment; filename="${filename}"` } })
}
