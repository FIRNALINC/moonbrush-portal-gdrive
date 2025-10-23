import { prisma } from "../src/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  const org = await prisma.organization.upsert({
    where: { id: "org_acme" },
    update: {},
    create: { id: "org_acme", name: "Acme Co." }
  })

  const adminPass = await bcrypt.hash("Admin!12345", 10)
  const clientPass = await bcrypt.hash("Client!12345", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@moonbrush.ai" },
    update: {},
    create: { email: "admin@moonbrush.ai", password: adminPass, name: "Moonbrush Admin", role: "ADMIN" }
  })

  const client = await prisma.user.upsert({
    where: { email: "client@acme.com" },
    update: {},
    create: { email: "client@acme.com", password: clientPass, name: "Acme Client", role: "CLIENT" }
  })

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: client.id, organizationId: org.id } },
    update: {},
    create: { userId: client.id, organizationId: org.id }
  })

  console.log("Seeded:", { admin: admin.email, client: client.email })
}

main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1) })
