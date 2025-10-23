import { PropsWithChildren } from "react"
import clsx from "clsx"
export default function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx("card p-6", className)}>{children}</div>
}
