import BlogPostPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/blog/[post]/page"
import { getAllBlogPostsWithCms } from "@/lib/data/blog-posts"
import { type PageProps, withEnglishLocale } from "../../route-helpers"

type Params = { post: string }

export async function generateStaticParams(): Promise<Params[]> {
  return (await getAllBlogPostsWithCms("en")).map((post) => ({ post: post.slug }))
}

export const dynamicParams = false

export function generateMetadata({ params }: PageProps<Params>) {
  return generateLocaleMetadata({ params: withEnglishLocale(params) })
}

export default function Page({ params }: PageProps<Params>) {
  return <BlogPostPage params={withEnglishLocale(params)} />
}
