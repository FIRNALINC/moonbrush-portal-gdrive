import { prisma } from "../src/lib/prisma"
async function main() {
  const now = new Date()
  const expired = await prisma.fulfillmentFile.findMany({ where: { availableUntil: { lt: now } } })
  for (const f of expired) {
    console.log(`Would archive ${f.id} (${f.filename})`)
  }
}
main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1) })
