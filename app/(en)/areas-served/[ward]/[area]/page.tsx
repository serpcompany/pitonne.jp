import AreaPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/areas-served/[ward]/[area]/page"
import { getAllAreas } from "@/lib/data/areas"
import { type PageProps, withEnglishLocale } from "../../../route-helpers"

type Params = { ward: string; area: string }

export function generateStaticParams(): Params[] {
  return getAllAreas().map(({ ward, area }) => ({
    ward: ward.slug,
    area: area.slug,
  }))
}

export const dynamicParams = false

export function generateMetadata({ params }: PageProps<Params>) {
  return generateLocaleMetadata({ params: withEnglishLocale(params) })
}

export default function Page({ params }: PageProps<Params>) {
  return <AreaPage params={withEnglishLocale(params)} />
}
