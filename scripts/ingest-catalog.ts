import fs from "node:fs"
import path from "node:path"

type Row = Record<string, string>

function csvToRows(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length === 0) return []
  const headers = lines[0].split(",").map(h => h.trim())
  return lines.slice(1).map(line => {
    const parts = line.split(",")
    const row: Row = {}
    headers.forEach((h, i) => (row[h] = (parts[i] ?? "").trim()))
    return row
  })
}

function writeJSON(p: string, data: unknown) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, JSON.stringify(data, null, 2))
}

function pick(r: Row, ...keys: string[]) {
  for (const k of keys) {
    if (r[k]) return r[k]
    const upper = k.toUpperCase()
    const lower = k.toLowerCase()
    if (r[upper]) return r[upper]
    if (r[lower]) return r[lower]
  }
  return ""
}

function deriveTaxonomy(rows: Row[]) {
  return rows.map(r => ({
    group: pick(r, "group","Group","GROUP"),
    label: pick(r, "label","Label","name","NAME"),
    code:  pick(r, "code","Code","REFERENCE_CODE","ref_code","Reference Code")
  })).filter(x => x.group && x.label && x.code)
}

function deriveList(rows: Row[], nameKeys: string[], codeKeys: string[], descKeys: string[]) {
  return rows.map(r => ({
    name: nameKeys.map(k => pick(r, k)).find(Boolean) || "",
    code: codeKeys.map(k => pick(r, k)).find(Boolean) || "",
    description: descKeys.map(k => pick(r, k)).find(Boolean) || undefined
  })).filter(x => x.name && x.code)
}

function deriveEnrichment(rows: Row[]) {
  return rows.map(r => {
    const label = pick(r, "label","Label","name","NAME")
    const column = pick(r, "column","Column","score_column","Score Column","SCORE_COLUMN")
    const minRaw = pick(r, "min","Min","MIN")
    const maxRaw = pick(r, "max","Max","MAX")
    const min = minRaw !== "" ? Number(minRaw) : undefined
    const max = maxRaw !== "" ? Number(maxRaw) : undefined
    return { label, column, min: Number.isFinite(min!) ? min : undefined, max: Number.isFinite(max!) ? max : undefined }
  }).filter(x => x.label && x.column)
}

function main() {
  const src = path.resolve(process.cwd(), "data", "source")
  const out = path.resolve(process.cwd(), "data", "derived")

  const files = {
    taxonomy: "Taxonomy - Sheet1.csv",
    personas: "Personas - Sheet1.csv",
    playbooks: "Playbooks - Sheet1.csv",
    enrich:   "Enrichment Models - Sheet1.csv"
  }

  const taxonomyRows   = csvToRows(fs.readFileSync(path.join(src, files.taxonomy), "utf8"))
  const personasRows   = csvToRows(fs.readFileSync(path.join(src, files.personas), "utf8"))
  const playbooksRows  = csvToRows(fs.readFileSync(path.join(src, files.playbooks), "utf8"))
  const enrichmentRows = csvToRows(fs.readFileSync(path.join(src, files.enrich), "utf8"))

  const taxonomy  = deriveTaxonomy(taxonomyRows)
  const personas  = deriveList(personasRows, ["name","persona","Persona","NAME"], ["code","reference","ref_code","Reference Code","REFERENCE_CODE"], ["description","Description","DESC","DETAILS"])
  const playbooks = deriveList(playbooksRows, ["name","playbook","Playbook","NAME"], ["code","reference","ref_code","Reference Code","REFERENCE_CODE"], ["description","Description","DESC","DETAILS"])
  const enrichment = deriveEnrichment(enrichmentRows)

  writeJSON(path.join(out, "taxonomy.json"), taxonomy)
  writeJSON(path.join(out, "personas.json"), personas)
  writeJSON(path.join(out, "playbooks.json"), playbooks)
  writeJSON(path.join(out, "enrichment_models.json"), enrichment)

  console.log("Wrote derived JSON to", out)
}

main()
