import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = bcrypt.hashSync("password123", 10)

  // 1. Create Moonbrush Org
  const moonbrushOrg = await prisma.organization.upsert({
    where: { name: "Moonbrush" },
    update: {},
    create: { name: "Moonbrush" },
  })

  // 2. Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@moonbrush.ai" },
    update: {},
    create: {
      email: "admin@moonbrush.ai",
      name: "Moonbrush Admin",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  })

  // 3. LINK Admin to Moonbrush (The missing step!)
  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: adminUser.id,
        organizationId: moonbrushOrg.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      organizationId: moonbrushOrg.id,
    },
  })

  // 4. Create Acme Org
  const acmeOrg = await prisma.organization.upsert({
    where: { name: "Acme Corp" },
    update: {},
    create: { name: "Acme Corp" },
  })

  // 5. Create Client User
  const clientUser = await prisma.user.upsert({
    where: { email: "client@acme.com" },
    update: {},
    create: {
      email: "client@acme.com",
      name: "Acme Client",
      password: hashedPassword,
      role: Role.CLIENT,
    },
  })

  // 6. LINK Client to Acme (The other missing step!)
  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: clientUser.id,
        organizationId: acmeOrg.id,
      },
    },
    update: {},
    create: {
      userId: clientUser.id,
      organizationId: acmeOrg.id,
    },
  })

  console.log(`Seeded: { admin: '${adminUser.email}', client: '${clientUser.email}' }`)
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
