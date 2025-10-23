import Link from "next/link"
import Card from "@/components/Card"

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Moonbrush Data Request Portal</h1>
      <Card>
        <p>This is a fresh Google Drive–backed build aligned to your SRS. Please sign in to continue.</p>
        <div className="mt-4 flex gap-2">
          <Link className="btn" href="/login">Sign in</Link>
        </div>
      </Card>
    </div>
  )
}
