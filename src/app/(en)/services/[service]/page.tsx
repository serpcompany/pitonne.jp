import * as localePage from '@/app/[locale]/services/[service]/page'
import { getAllServiceSlugs } from '@/lib/data/services'
import { englishRoute } from '../../route-helpers'

type Params = { service: string }

export function generateStaticParams(): Params[] {
  return getAllServiceSlugs('en').map(service => ({ service }))
}

export const dynamicParams = false

const route = englishRoute<Params>(localePage)

export const generateMetadata = route.generateMetadata

export default route.Page
