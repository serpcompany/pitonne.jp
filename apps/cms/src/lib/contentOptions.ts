import type { CollectionBeforeValidateHook, Option, TypeWithID } from "payload"
import {
  generatedBlogCategoryOptions,
  generatedBlogTagOptions,
  generatedRelatedServiceSlugOptions,
} from "@/generated/contentOptions"

type LocaleCode = "en" | "ja"
type LocalizedCategoryOption = {
  label: string
  labels: Record<LocaleCode, string>
  value: string
}

type BlogPostWithCategory = TypeWithID & {
  category?: string | null
  categorySlug?: string | null
}

export const blogCategoryOptions: LocalizedCategoryOption[] = generatedBlogCategoryOptions.map((option) => ({
  label: option.label,
  labels: {
    en: option.labels.en,
    ja: option.labels.ja,
  },
  value: option.value,
}))

export const blogCategorySelectOptions: Option[] = blogCategoryOptions.map(({ label, value }) => ({ label, value }))
export const blogTagOptions: Option[] = generatedBlogTagOptions.map(({ label, value }) => ({ label, value }))
export const relatedServiceSlugOptions: Option[] = generatedRelatedServiceSlugOptions.map(({ label, value }) => ({
  label,
  value,
}))

function getLocaleCode(locale: unknown): LocaleCode {
  return locale === "ja" ? "ja" : "en"
}

export function getBlogCategoryLabel(slug: string, locale: LocaleCode = "en") {
  const category = blogCategoryOptions.find((option) => option.value === slug)
  return category?.labels[locale] ?? category?.label ?? slug
}

export const syncBlogPostCategory: CollectionBeforeValidateHook<BlogPostWithCategory> = ({ data, req }) => {
  if (!data?.categorySlug) {
    return data
  }

  data.category = getBlogCategoryLabel(data.categorySlug, getLocaleCode(req.locale))
  return data
}
