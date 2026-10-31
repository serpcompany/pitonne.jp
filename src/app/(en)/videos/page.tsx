import VideosPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/videos/page"
import { englishLocaleParams } from "../route-helpers"

export function generateMetadata() {
  return generateLocaleMetadata({ params: englishLocaleParams })
}

export default function Page() {
  return <VideosPage params={englishLocaleParams} />
}
