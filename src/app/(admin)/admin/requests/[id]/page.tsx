'use client'
import { useEffect, useState } from "react"
import Button from "@/components/Button"
import CodeBlock from "@/components/CodeBlock"

type RequestDetail = {
  id: string; title: string; status: "SUBMITTED"|"IN_PROGRESS"|"DELAYED"|"COMPLETE";
  criteria: any; aiSql?: string|null;
  files: { id: string; kind: "CSV"|"PDF"; filename: string }[]
}

export default function AdminManage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<RequestDetail|null>(null)
  const [status, setStatus] = useState<RequestDetail["status"]>("SUBMITTED")
  const [note, setNote] = useState("")
  const [csv, setCsv] = useState<File|null>(null)
  const [pdf, setPdf] = useState<File|null>(null)

  useEffect(()=>{
    fetch(`/api/admin/requests/${params.id}`).then(r=>r.json()).then(d => { setData(d); setStatus(d.status) })
  }, [params.id])

  async function save() {
    await fetch(`/api/admin/requests/${params.id}`, { method: "POST", body: JSON.stringify({ status, note }) })
    alert("Saved")
  }

  async function upload() {
    const form = new FormData()
    if (csv) form.append("csv", csv)
    if (pdf) form.append("pdf", pdf)
    const r = await fetch(`/api/admin/requests/${params.id}/files`, { method: "POST", body: form })
    if (!r.ok) alert("Upload failed")
    else alert("Uploaded")
  }

  if (!data) return <p>Loading…</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{data.title}</h1>

      <div className="card p-4">
        <h2 className="font-semibold mb-2">Status</h2>
        <select className="p-2 rounded-md bg-black/20 border border-white/10" value={status} onChange={e=>setStatus(e.target.value as any)}>
          <option>SUBMITTED</option>
          <option>IN_PROGRESS</option>
          <option>DELAYED</option>
          <option>COMPLETE</option>
        </select>
        <div className="mt-3">
          <label className="block text-sm mb-1">Add note</label>
          <textarea className="w-full p-2 rounded-md bg-black/20 border border-white/10" rows={2} value={note} onChange={e=>setNote(e.target.value)} />
        </div>
        <div className="mt-3">
          <Button onClick={save}>Save</Button>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-2">Upload fulfillment files</h2>
        <div className="flex items-center gap-3">
          <input type="file" accept=".csv" onChange={e=>setCsv(e.target.files?.[0] || null)} />
          <input type="file" accept="application/pdf" onChange={e=>setPdf(e.target.files?.[0] || null)} />
          <Button onClick={upload}>Upload</Button>
        </div>
        <div className="mt-3 text-sm opacity-80">
          Existing: {data.files.map(f => f.filename).join(", ") || "—"}
        </div>
      </div>

      {data.aiSql && (
        <div className="card p-4">
          <h2 className="font-semibold mb-2">AI-generated SnowSQL</h2>
          <CodeBlock code={data.aiSql} />
          <a className="btn mt-2 inline-block" href={`/api/admin/requests/${data.id}/download-sql`}>Download .sql</a>
        </div>
      )}
    </div>
  )
}
