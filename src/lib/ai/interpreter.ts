import Fuse from "fuse.js"
import { loadCatalog } from "../taxonomy"

export type Interpretation = {
  summary: string
  taxonomyCodes: string[]
  personaCodes: string[]
  inferredStates: string[]
  jobTitleFuzzy: string[]
}

const REGION_TO_STATES: Record<string, string[]> = {
  northeast: ["CT","ME","MA","NH","NJ","NY","PA","RI","VT"],
  midwest: ["IL","IN","IA","KS","MI","MN","MO","NE","ND","OH","SD","WI"],
  south: ["AL","AR","DE","FL","GA","KY","LA","MD","MS","NC","OK","SC","TN","TX","VA","WV","DC"],
  west: ["AK","AZ","CA","CO","HI","ID","MT","NV","NM","OR","UT","WA","WY"]
}

export async function interpretPrompt(prompt: string): Promise<Interpretation> {
  const { taxonomy, personas } = await loadCatalog()
  const fuse = new Fuse(taxonomy, { keys: ["label","group"], threshold: 0.3 })
  const personaFuse = new Fuse(personas, { keys: ["name","description"], threshold: 0.3 })

  const tokens = prompt.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)

  const inferredStates = new Set<string>()
  for (const [region, states] of Object.entries(REGION_TO_STATES)) {
    if (prompt.toLowerCase().includes(region)) states.forEach(s => inferredStates.add(s))
  }
  tokens.forEach(t => { if (/^[a-z]{2}$/.test(t)) inferredStates.add(t.toUpperCase()) })

  const taxMatches = new Set<string>()
  const personaMatches = new Set<string>()
  for (const t of tokens) {
    fuse.search(t).slice(0,3).forEach(r => taxMatches.add(r.item.code))
    personaFuse.search(t).slice(0,2).forEach(r => personaMatches.add(r.item.code))
  }

  const jobTerms = ["engineer","developer","manager","director","vp","cmo","cto","student","analyst","designer","marketer"]
  const jobTitleFuzzy = tokens.filter(t => jobTerms.includes(t))

  const summary = `Interpreted ${taxMatches.size} taxonomy flag(s), ${personaMatches.size} persona(s), ${inferredStates.size} state(s).`
  return { summary, taxonomyCodes: [...taxMatches], personaCodes: [...personaMatches], inferredStates: [...inferredStates], jobTitleFuzzy }
}
