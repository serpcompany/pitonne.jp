import { BlogPostTemplate } from '@/components/blog/blog-post-template'
import { getAllBlogPosts, getBlogPostBySlug, getBlogPostsByCategory } from '@/lib/data/blog-posts'
import { getServicesFromSlugs } from '@/lib/data/services'
import { formatPostDate } from '@/lib/post-date'
import { defined } from '@/test/defined'

export function englishBlogPost(slug: string) {
  const post = defined(getBlogPostBySlug(slug))
  const template = (
    <BlogPostTemplate
      post={{
        title: post.title,
        slug: post.slug,
        date: formatPostDate(post.publishedAt, 'en'),
        content: post.content,
        excerpt: post.excerpt,
        readingTime: post.readingTime,
        category: post.category,
        categorySlug: post.categorySlug,
        author: post.author,
        featureImage: post.featureImage,
        relatedServiceSlugs: post.relatedServiceSlugs,
        tags: post.tags
      }}
      relatedPosts={getBlogPostsByCategory(post.categorySlug).filter(
        candidate => candidate.slug !== post.slug
      )}
      relatedServices={getServicesFromSlugs(post.relatedServiceSlugs || [])}
      latestPosts={getAllBlogPosts().filter(candidate => candidate.slug !== post.slug)}
      locale="en"
    />
  )
  return { post, template }
}
