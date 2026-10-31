import ContactPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/contact/page"
import { englishLocaleParams } from "../route-helpers"

export function generateMetadata() {
  return generateLocaleMetadata({ params: englishLocaleParams })
}

export default function Page() {
  return <ContactPage params={englishLocaleParams} />
}
