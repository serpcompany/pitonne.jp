import AboutPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/about/page"
import { englishLocaleParams } from "../route-helpers"

export function generateMetadata() {
  return generateLocaleMetadata({ params: englishLocaleParams })
}

export default function Page() {
  return <AboutPage params={englishLocaleParams} />
}
