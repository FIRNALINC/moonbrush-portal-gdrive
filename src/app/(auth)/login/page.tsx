'use client'
import { signIn } from "next-auth/react"
import { useState } from "react"
import Card from "@/components/Card"
import Button from "@/components/Button"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string|null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await signIn("credentials", { email, password, redirect: true, callbackUrl: "/dashboard" })
    if ((res as any)?.error) setError((res as any).error)
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="w-full p-2 rounded-md bg-black/20 border border-white/10" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" className="w-full p-2 rounded-md bg-black/20 border border-white/10" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit">Sign in</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
