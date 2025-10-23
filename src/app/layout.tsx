import '../styles/globals.css'
import '../styles/theme.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Moonbrush Data Request Portal',
  description: 'Secure client data request portal',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="max-w-7xl mx-auto p-6">{children}</div>
      </body>
    </html>
  )
}
