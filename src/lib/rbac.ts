import { prisma } from "./prisma"
import { Role } from "@prisma/client"
import { getSessionEmail } from "./session"

export async function requireAuth() {
  const email = await getSessionEmail()
  if (!email) throw new Error("Unauthorized")
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error("Unauthorized")
  return user
}
export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== Role.ADMIN) throw new Error("Forbidden")
  return user
}
export async function assertClientRequestAccess(requestId: string, userId: string) {
  const req = await prisma.request.findUnique({ where: { id: requestId }, select: { organizationId: true } })
  if (!req) throw new Error("Not Found")
  const mems = await prisma.membership.findMany({ where: { userId } })
  const orgIds = new Set(mems.map(m => m.organizationId))
  if (!orgIds.has(req.organizationId)) throw new Error("Forbidden")
}
