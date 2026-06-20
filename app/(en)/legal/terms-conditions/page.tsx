import TermsConditionsPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/legal/terms-conditions/page"
import { englishLocaleParams } from "../../route-helpers"

export function generateMetadata() {
  return generateLocaleMetadata({ params: englishLocaleParams })
}

export default function Page() {
  return <TermsConditionsPage params={englishLocaleParams} />
}
