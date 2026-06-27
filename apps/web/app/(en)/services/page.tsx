import ServicesPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/services/page"
import { englishLocaleParams } from "../route-helpers"

export function generateMetadata() {
  return generateLocaleMetadata({ params: englishLocaleParams })
}

export default function Page() {
  return <ServicesPage params={englishLocaleParams} />
}
