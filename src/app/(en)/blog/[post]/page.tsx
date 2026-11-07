import * as localePage from '@/app/[locale]/blog/[post]/page'
import { getAllBlogPosts } from '@/lib/data/blog-posts'
import { englishRoute } from '../../route-helpers'

type Params = { post: string }

export function generateStaticParams(): Params[] {
  return getAllBlogPosts('en').map(post => ({ post: post.slug }))
}

export const dynamicParams = false

const route = englishRoute<Params>(localePage)

export const generateMetadata = route.generateMetadata

export default route.Page
