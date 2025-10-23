import { NextResponse } from "next/server"
import { loadCatalog } from "@/lib/taxonomy"
export async function GET() {
  const { taxonomy, personas, enrichment } = await loadCatalog()
  return NextResponse.json({ taxonomy, personas, enrichment })
}
