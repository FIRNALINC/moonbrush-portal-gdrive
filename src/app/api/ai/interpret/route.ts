import { NextResponse } from "next/server"
import { aiInterpret } from "@/lib/ai/provider"
export async function POST(req: Request) {
  const { prompt } = await req.json()
  const res = await aiInterpret(prompt || "")
  return NextResponse.json(res)
}
