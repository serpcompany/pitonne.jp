import LegalPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/legal/page"
import { englishLocaleParams } from "../route-helpers"

export function generateMetadata() {
  return generateLocaleMetadata({ params: englishLocaleParams })
}

export default function Page() {
  return <LegalPage params={englishLocaleParams} />
}
