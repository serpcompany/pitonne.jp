import * as localePage from '@/app/[locale]/blog/category/[category]/page'
import { getAllCategories } from '@/lib/data/blog-posts'
import { englishRoute } from '../../../route-helpers'

type Params = { category: string }

export function generateStaticParams(): Params[] {
  return getAllCategories('en').map(category => ({ category: category.slug }))
}

export const dynamicParams = false

const route = englishRoute<Params>(localePage)

export const generateMetadata = route.generateMetadata

export default route.Page
