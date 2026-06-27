import PrivacyPolicyPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/legal/privacy-policy/page"
import { englishLocaleParams } from "../../route-helpers"

export function generateMetadata() {
  return generateLocaleMetadata({ params: englishLocaleParams })
}

export default function Page() {
  return <PrivacyPolicyPage params={englishLocaleParams} />
}
