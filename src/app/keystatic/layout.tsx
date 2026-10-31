import type { Metadata } from "next"
import KeystaticApp from "./keystatic-app"

export const metadata: Metadata = {
  title: "Pitonne CMS",
  robots: { index: false, follow: false },
}

export default function KeystaticLayout() {
  return (
    <html lang="en">
      <body>
        <KeystaticApp />
      </body>
    </html>
  )
}
