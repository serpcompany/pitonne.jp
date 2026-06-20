import AreasServedPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/areas-served/page"
import { englishLocaleParams } from "../route-helpers"

export function generateMetadata() {
  return generateLocaleMetadata({ params: englishLocaleParams })
}

export default function Page() {
  return <AreasServedPage params={englishLocaleParams} />
}
