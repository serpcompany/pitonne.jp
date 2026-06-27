import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./styles.css"

export const metadata: Metadata = {
  title: "Pitonne CMS",
  description: "Payload CMS for Pitonne content.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
