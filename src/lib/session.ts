import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export async function getSessionEmail(): Promise<string> {
  const session = await getServerSession(authOptions as any)
  return (session as any)?.user?.email || ""
}
