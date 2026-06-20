import BlogCategoryPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/blog/category/[category]/page"
import { getAllCategories } from "@/lib/data/blog-posts"
import { type PageProps, withEnglishLocale } from "../../../route-helpers"

type Params = { category: string }

export function generateStaticParams(): Params[] {
  return getAllCategories("en").map((category) => ({ category: category.slug }))
}

export const dynamicParams = false

export function generateMetadata({ params }: PageProps<Params>) {
  return generateLocaleMetadata({ params: withEnglishLocale(params) })
}

export default function Page({ params }: PageProps<Params>) {
  return <BlogCategoryPage params={withEnglishLocale(params)} />
}
