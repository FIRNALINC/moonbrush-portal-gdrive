import { ButtonHTMLAttributes, PropsWithChildren } from "react"
import clsx from "clsx"
export default function Button({ children, className, ...rest }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return <button className={clsx("btn hover:opacity-95 focus:outline-none focus:ring-2", className)} {...rest}>{children}</button>
}
