import ServiceDetailPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/services/[service]/page"
import { getAllServiceSlugs } from "@/lib/data/services"
import { type PageProps, withEnglishLocale } from "../../route-helpers"

type Params = { service: string }

export function generateStaticParams(): Params[] {
  return getAllServiceSlugs("en").map((service) => ({ service }))
}

export const dynamicParams = false

export function generateMetadata({ params }: PageProps<Params>) {
  return generateLocaleMetadata({ params: withEnglishLocale(params) })
}

export default function Page({ params }: PageProps<Params>) {
  return <ServiceDetailPage params={withEnglishLocale(params)} />
}
