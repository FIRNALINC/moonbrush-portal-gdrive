export type EnrichmentRange = { column: string; min?: number; max?: number }
export type Criteria = {
  title?: string
  taxonomyCodes?: string[]
  personaCodes?: string[]
  playbookCodes?: string[]
  demographics?: {
    gender?: string[]
    ageRange?: string[]
    incomeRange?: string[]
    married?: boolean | null
    children?: boolean | null
  }
  professional?: {
    industry?: string[]
    seniority?: string[]
    jobTitleFuzzy?: string[]
    department?: string[]
  }
  location?: {
    states?: string[]
    metros?: string[]
    zips?: string[]
  }
  enrichmentRanges?: EnrichmentRange[]
}

function escId(id: string) { return id.replace(/[^A-Za-z0-9_]/g, "_") }
function escStr(s: string) { return s.replace(/'/g, "''") }

export function buildSnowSQL(criteria: Criteria) {
  const selectCols = ["MOONBRUSH_ID","FIRST_NAME","LAST_NAME","BUSINESS_EMAIL","JOB_TITLE","PRIMARY_INDUSTRY","STATE_ID"]
  const from = "MOONBRUSH_INGEST.PUBLIC.UNIVERSAL_PERSON_ENRICHED"
  const where: string[] = []

  const codeList = Array.from(new Set([...(criteria.taxonomyCodes||[]), ...(criteria.personaCodes||[])]))
  for (const code of codeList) where.push(`${escId(code)} = 'Y'`)

  const demo = criteria.demographics || {}
  if (demo.gender?.length) where.push(`GENDER IN (${demo.gender.map(g=>`'${escStr(g)}'`).join(",")})`)
  if (demo.ageRange?.length) where.push(`AGE_RANGE IN (${demo.ageRange.map(a=>`'${escStr(a)}'`).join(",")})`)
  if (demo.incomeRange?.length) where.push(`INCOME_RANGE IN (${demo.incomeRange.map(a=>`'${escStr(a)}'`).join(",")})`)
  if (demo.married != null) where.push(`MARRIED = ${demo.married ? "TRUE" : "FALSE"}`)
  if (demo.children != null) where.push(`CHILDREN = ${demo.children ? "TRUE" : "FALSE"}`)

  const prof = criteria.professional || {}
  if (prof.industry?.length) where.push(`PRIMARY_INDUSTRY IN (${prof.industry.map(a=>`'${escStr(a)}'`).join(",")})`)
  if (prof.seniority?.length) where.push(`SENIORITY_LEVEL IN (${prof.seniority.map(a=>`'${escStr(a)}'`).join(",")})`)
  if (prof.department?.length) where.push(`DEPARTMENT IN (${prof.department.map(a=>`'${escStr(a)}'`).join(",")})`)
  if (prof.jobTitleFuzzy?.length) {
    const ors = prof.jobTitleFuzzy.map(t => `JOB_TITLE ILIKE '%${escStr(t)}%'`).join(" OR ")
    where.push(`(${ors})`)
  }

  const loc = criteria.location || {}
  if (loc.states?.length) where.push(`STATE_ID IN (${loc.states.map(s=>`'${escStr(s)}'`).join(",")})`)
  if (loc.metros?.length) where.push(`METRO_NAME IN (${loc.metros.map(s=>`'${escStr(s)}'`).join(",")})`)
  if (loc.zips?.length) where.push(`PERSONAL_ZIP IN (${loc.zips.map(s=>`'${escStr(s)}'`).join(",")})`)

  for (const r of (criteria.enrichmentRanges||[])) {
    if (!r.column) continue
    const col = escId(r.column)
    if (r.min != null && r.max != null) where.push(`${col} BETWEEN ${r.min} AND ${r.max}`)
    else if (r.min != null) where.push(`${col} >= ${r.min}`)
    else if (r.max != null) where.push(`${col} <= ${r.max}`)
  }

  const whereSql = where.length ? `
WHERE ${where.join('\n  AND ')}` : ''
  return `SELECT ${selectCols.join(", ")}
FROM ${from}${whereSql};`
}
