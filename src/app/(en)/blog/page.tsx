import BlogPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/blog/page"
import { englishLocaleParams } from "../route-helpers"

export function generateMetadata() {
  return generateLocaleMetadata({ params: englishLocaleParams })
}

export default function Page() {
  return <BlogPage params={englishLocaleParams} />
}
