import DisclaimerPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/legal/disclaimer/page"
import { englishLocaleParams } from "../../route-helpers"

export function generateMetadata() {
  return generateLocaleMetadata({ params: englishLocaleParams })
}

export default function Page() {
  return <DisclaimerPage params={englishLocaleParams} />
}
