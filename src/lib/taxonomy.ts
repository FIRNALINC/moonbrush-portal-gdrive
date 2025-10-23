import fs from "node:fs"
import path from "node:path"

export type TaxonomyRecord = { group: string; label: string; code: string }
export type PersonaRecord = { name: string; code: string; description?: string }
export type EnrichmentRecord = { label: string; column: string; min?: number; max?: number }

export async function loadCatalog() {
  const base = process.env.CATALOG_JSON_PATH || path.resolve(process.cwd(), "data/derived")
  const taxonomy: TaxonomyRecord[] = JSON.parse(fs.readFileSync(path.join(base, "taxonomy.json"), "utf8"))
  const personas: PersonaRecord[] = JSON.parse(fs.readFileSync(path.join(base, "personas.json"), "utf8"))
  const playbooks: PersonaRecord[] = JSON.parse(fs.readFileSync(path.join(base, "playbooks.json"), "utf8"))
  const enrichment: EnrichmentRecord[] = JSON.parse(fs.readFileSync(path.join(base, "enrichment_models.json"), "utf8"))
  return { taxonomy, personas, playbooks, enrichment }
}
