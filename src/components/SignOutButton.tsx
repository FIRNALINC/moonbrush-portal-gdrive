"use client"

import { signOut } from "next-auth/react"
import { Button } from "./Button"

export function SignOutButton() {
  return (
    <Button
      variant="secondary"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Sign Out
    </Button>
  )
}
