import FaqsPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/faqs/page"
import { englishLocaleParams } from "../route-helpers"

export function generateMetadata() {
  return generateLocaleMetadata({ params: englishLocaleParams })
}

export default function Page() {
  return <FaqsPage params={englishLocaleParams} />
}
