import * as localePage from '@/app/[locale]/watch/[video]/page'
import { pitonneVideos } from '@/lib/data/videos'
import { englishRoute } from '../../route-helpers'

type Params = { video: string }

export function generateStaticParams(): Params[] {
  return pitonneVideos.map(video => ({ video: video.slug }))
}

export const dynamicParams = false

const route = englishRoute<Params>(localePage)

export const generateMetadata = route.generateMetadata

export default route.Page
