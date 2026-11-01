import * as localePage from '@/app/[locale]/areas-served/[ward]/[area]/page'
import { getAllAreas } from '@/lib/data/areas'
import { englishRoute } from '../../../route-helpers'

type Params = { ward: string; area: string }

export function generateStaticParams(): Params[] {
  return getAllAreas().map(({ ward, area }) => ({
    ward: ward.slug,
    area: area.slug
  }))
}

export const dynamicParams = false

const route = englishRoute<Params>(localePage)

export const generateMetadata = route.generateMetadata

export default route.Page
