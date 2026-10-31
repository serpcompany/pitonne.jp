import LocaleLayout, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/layout"
import { englishLocaleParams } from "./route-helpers"

export function generateMetadata() {
  return generateLocaleMetadata({ params: englishLocaleParams })
}

export default function EnglishLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <LocaleLayout params={englishLocaleParams}>{children}</LocaleLayout>
}
