import BlogPostPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/blog/[post]/page"
import { getAllBlogPosts } from "@/lib/data/blog-posts"
import { type PageProps, withEnglishLocale } from "../../route-helpers"

type Params = { post: string }

export function generateStaticParams(): Params[] {
  return getAllBlogPosts("en").map((post) => ({ post: post.slug }))
}

export const dynamicParams = false

export function generateMetadata({ params }: PageProps<Params>) {
  return generateLocaleMetadata({ params: withEnglishLocale(params) })
}

export default function Page({ params }: PageProps<Params>) {
  return <BlogPostPage params={withEnglishLocale(params)} />
}
