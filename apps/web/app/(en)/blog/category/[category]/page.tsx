import BlogCategoryPage, { generateMetadata as generateLocaleMetadata } from "@/app/[locale]/blog/category/[category]/page"
import { getAllCategoriesWithCms } from "@/lib/data/blog-posts"
import { type PageProps, withEnglishLocale } from "../../../route-helpers"

type Params = { category: string }

export async function generateStaticParams(): Promise<Params[]> {
  return (await getAllCategoriesWithCms("en")).map((category) => ({ category: category.slug }))
}

export const dynamicParams = false

export function generateMetadata({ params }: PageProps<Params>) {
  return generateLocaleMetadata({ params: withEnglishLocale(params) })
}

export default function Page({ params }: PageProps<Params>) {
  return <BlogCategoryPage params={withEnglishLocale(params)} />
}
