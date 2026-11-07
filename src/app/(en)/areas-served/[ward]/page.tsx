import * as localePage from '@/app/[locale]/areas-served/[ward]/page'
import { wards } from '@/lib/data/areas'
import { englishRoute } from '../../route-helpers'

type Params = { ward: string }

export function generateStaticParams(): Params[] {
  return wards.map(ward => ({ ward: ward.slug }))
}

export const dynamicParams = false

const route = englishRoute<Params>(localePage)

export const generateMetadata = route.generateMetadata

export default route.Page
