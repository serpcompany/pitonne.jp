import WardPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/areas-served/[ward]/page"
import { wards } from "@/lib/data/areas"
import { type PageProps, withEnglishLocale } from "../../route-helpers"

type Params = { ward: string }

export function generateStaticParams(): Params[] {
  return wards.map((ward) => ({ ward: ward.slug }))
}

export const dynamicParams = false

export function generateMetadata({ params }: PageProps<Params>) {
  return generateLocaleMetadata({ params: withEnglishLocale(params) })
}

export default function Page({ params }: PageProps<Params>) {
  return <WardPage params={withEnglishLocale(params)} />
}
