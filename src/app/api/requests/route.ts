import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { buildSnowSQL } from "@/lib/sqlBuilder"
import { getSessionEmail } from "@/lib/session"

export async function POST(req: Request) {
  const email = await getSessionEmail()
  if (!email) return new NextResponse("Unauthorized", { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return new NextResponse("Unauthorized", { status: 401 })
  const membership = await prisma.membership.findFirst({ where: { userId: user.id } })
  if (!membership) return new NextResponse("Forbidden", { status: 403 })

  const { title, clientQuery, criteria } = await req.json()

  const aiSql = buildSnowSQL({
    taxonomyCodes: criteria?.taxonomyCodes || [],
    location: { states: criteria?.location?.states || [] },
    professional: { jobTitleFuzzy: criteria?.professional?.jobTitleFuzzy || [] },
    enrichmentRanges: criteria?.enrichmentRanges || []
  })

  const created = await prisma.request.create({
    data: {
      title: title || "Untitled Request",
      clientQuery: clientQuery || null,
      criteria,
      organizationId: membership.organizationId,
      createdById: user.id,
      aiSql
    }
  })
  await prisma.statusChange.create({ data: { requestId: created.id, from: null, to: "SUBMITTED", changedById: user.id } })
  return NextResponse.json({ id: created.id })
}
