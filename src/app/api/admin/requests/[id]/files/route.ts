import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { getSessionEmail } from "@/lib/session"
import { putFile } from "@/lib/storage"
import { randomUUID } from "node:crypto"

export async function POST(req: Request, { params }: { params: { id: string }}) {
  const email = await getSessionEmail()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.role !== Role.ADMIN) return new NextResponse("Forbidden", { status: 403 })

  const form = await req.formData()
  const filesSaved = [] as any[]

  for (const kind of ["csv","pdf"] as const) {
    const file = form.get(kind) as File | null
    if (file) {
      const arrayBuf = await file.arrayBuffer()
      const buf = Buffer.from(arrayBuf)
      const key = `${params.id}/${randomUUID()}-${file.name}`
      const saved = await putFile(key, buf, file.type || (kind === "csv" ? "text/csv" : "application/pdf"))
      const rec = await prisma.fulfillmentFile.create({
        data: {
          requestId: params.id,
          kind: kind.toUpperCase() as any,
          storageKey: saved.storageKey,
          filename: saved.filename,
          size: saved.size,
          mimeType: saved.mimeType,
          uploadedById: user.id,
          availableUntil: new Date(Date.now() + (Number(process.env.FILE_RETENTION_DAYS||180))*24*60*60*1000)
        }
      })
      filesSaved.push(rec)
    }
  }

  if (filesSaved.length) {
    const existing = await prisma.request.findUnique({ where: { id: params.id } })
    if (existing?.status !== "COMPLETE") {
      await prisma.request.update({ where: { id: params.id }, data: { status: "COMPLETE" } })
      await prisma.statusChange.create({ data: { requestId: params.id, from: existing?.status || "IN_PROGRESS", to: "COMPLETE", changedById: user.id, note: "Auto-complete on file upload" } })
    }
  }

  return NextResponse.json({ ok: true })
}
