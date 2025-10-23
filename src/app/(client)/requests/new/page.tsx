'use client'
import { useEffect, useMemo, useState } from "react"
import Card from "@/components/Card"
import Pill from "@/components/Pill"
import Button from "@/components/Button"

type TaxonomyRecord = { group: string; label: string; code: string }
type PersonaRecord = { name: string; code: string }
type EnrichmentRecord = { label: string; column: string; min?: number; max?: number }

async function fetchCatalog() {
  const res = await fetch("/api/catalog")
  return res.json() as Promise<{ taxonomy: TaxonomyRecord[]; personas: PersonaRecord[]; enrichment: EnrichmentRecord[] }>
}

export default function NewRequest() {
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [aiNote, setAiNote] = useState<string | null>(null)
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])
  const [states, setStates] = useState<string[]>([])
  const [jobTitles, setJobTitles] = useState<string[]>([])
  const [enrich, setEnrich] = useState<Record<string,{min?:number;max?:number}>>({})
  const [tax, setTax] = useState<TaxonomyRecord[]>([])
  const [personas, setPersonas] = useState<PersonaRecord[]>([])
  const [enrichment, setEnrichment] = useState<EnrichmentRecord[]>([])

  useEffect(()=>{ fetchCatalog().then(d => { setTax(d.taxonomy); setPersonas(d.personas); setEnrichment(d.enrichment) }) }, [])

  const groups = useMemo(()=>{
    const by: Record<string, TaxonomyRecord[]> = {}
    for (const t of tax) { (by[t.group] ||= []).push(t) }
    return by
  }, [tax])

  function toggleCode(code: string) {
    setSelectedCodes(prev => prev.includes(code) ? prev.filter(c=>c!==code) : [...prev, code])
  }
  function removePill(label: string) {
    setSelectedCodes(prev => prev.filter(c=>c!==label))
    setStates(prev => prev.filter(s=>s!==label))
    setJobTitles(prev => prev.filter(j=>j!==label))
  }

  async function runAI() {
    const res = await fetch("/api/ai/interpret", { method: "POST", body: JSON.stringify({ prompt }) })
    const data = await res.json()
    setAiNote(data.plainEnglish)
    setSelectedCodes(prev => Array.from(new Set([...prev, ...data.taxonomyCodes, ...data.personaCodes])))
    setStates(prev => Array.from(new Set([...prev, ...data.states])))
    setJobTitles(prev => Array.from(new Set([...prev, ...data.jobTitleFuzzy])))
  }

  async function submit() {
    const payload = {
      title: title || "Untitled Request",
      clientQuery: prompt || null,
      criteria: {
        taxonomyCodes: selectedCodes,
        location: { states },
        professional: { jobTitleFuzzy: jobTitles },
        enrichmentRanges: Object.entries(enrich).map(([column,{min,max}])=>({ column, min, max }))
      }
    }
    const r = await fetch("/api/requests", { method: "POST", body: JSON.stringify(payload) })
    const j = await r.json()
    window.location.href = `/requests/${j.id}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create Request</h1>
      </div>

      <Card>
        <label className="block text-sm">Title</label>
        <input className="w-full p-2 rounded-md bg-black/20 border border-white/10" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., Laptop buyers - Northeast" />
      </Card>

      <Card>
        <h2 className="font-semibold mb-2">Describe your ideal persona</h2>
        <textarea className="w-full p-3 rounded-md bg-black/20 border border-white/10" rows={3} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="e.g., college students in the Northeast who are looking to buy a new laptop" />
        <div className="mt-2 flex gap-2">
          <Button type="button" onClick={runAI}>Interpret with AI</Button>
          {aiNote && <p className="text-sm opacity-80">{aiNote}</p>}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold mb-3">Manual selection</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCodes.map(c => <Pill key={c} label={c} onRemove={()=>removePill(c)} />)}
          {states.map(s => <Pill key={s} label={s} onRemove={()=>removePill(s)} />)}
          {jobTitles.map(j => <Pill key={j} label={j} onRemove={()=>removePill(j)} />)}
        </div>

        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="mb-4">
            <h3 className="font-medium mb-2">{group}</h3>
            <div className="flex flex-wrap gap-2">
              {items.slice(0, 24).map(i => (
                <button key={i.code} onClick={()=>toggleCode(i.code)} className={`pill ${selectedCodes.includes(i.code) ? 'ring-2' : ''}`}>
                  {i.label} <span className="opacity-60 text-xs">{i.code}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-6">
          <h3 className="font-medium mb-2">Location</h3>
          <input className="w-full p-2 rounded-md bg-black/20 border border-white/10" placeholder="State IDs (comma-separated, e.g., NY,MA,PA)" onBlur={e=>setStates(e.target.value.split(/[,\s]+/).map(s=>s.trim().toUpperCase()).filter(Boolean))} />
          <p className="text-xs opacity-70 mt-1">Uses <code>STATE_ID</code> column in Snowflake.</p>
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-2">Job title (fuzzy contains)</h3>
          <input className="w-full p-2 rounded-md bg-black/20 border border-white/10" placeholder="e.g., student, manager, vp" onBlur={e=>setJobTitles(e.target.value.split(/[,\s]+/).map(s=>s.trim()).filter(Boolean))} />
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-2">Enrichment model ranges</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {enrichment.slice(0, 8).map(e => (
              <div key={e.column} className="flex items-center gap-2">
                <label className="w-1/2 text-sm">{e.label}</label>
                <input type="number" className="w-1/4 p-2 rounded-md bg-black/20 border border-white/10" placeholder="min" onBlur={(ev)=>setEnrich(prev=>({ ...prev, [e.column]: { ...prev[e.column], min: ev.target.value?Number(ev.target.value):undefined }}))} />
                <input type="number" className="w-1/4 p-2 rounded-md bg-black/20 border border-white/10" placeholder="max" onBlur={(ev)=>setEnrich(prev=>({ ...prev, [e.column]: { ...prev[e.column], max: ev.target.value?Number(ev.target.value):undefined }}))} />
              </div>
            ))}
          </div>
          <p className="text-xs opacity-70 mt-1">These map to FLOAT score columns; query uses BETWEEN.</p>
        </div>

        <div className="mt-6">
          <Button onClick={submit}>Submit Request</Button>
        </div>
      </Card>
    </div>
  )
}
