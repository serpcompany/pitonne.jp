import BlogPostPage from '@/app/[locale]/blog/[post]/page'
import { getBlogPostBySlug } from '@/lib/data/blog-posts'
import { defined } from '@/test/defined'

export async function englishBlogPost(slug: string) {
  const post = defined(getBlogPostBySlug(slug))
  const template = await BlogPostPage({ params: Promise.resolve({ locale: 'en', post: slug }) })
  return { post, template }
}
