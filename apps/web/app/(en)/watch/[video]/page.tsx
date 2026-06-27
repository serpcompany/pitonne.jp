import WatchPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/watch/[video]/page"
import { pitonneVideos } from "@/lib/data/videos"
import { type PageProps, withEnglishLocale } from "../../route-helpers"

type Params = { video: string }

export function generateStaticParams(): Params[] {
  return pitonneVideos.map((video) => ({ video: video.slug }))
}

export const dynamicParams = false

export function generateMetadata({ params }: PageProps<Params>) {
  return generateLocaleMetadata({ params: withEnglishLocale(params) })
}

export default function Page({ params }: PageProps<Params>) {
  return <WatchPage params={withEnglishLocale(params)} />
}
