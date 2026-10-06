import { Metadata } from "next"
import { notFound } from "next/navigation"
import { ServiceDetailTemplate } from "@/components/services/service-detail-template"
import { ServiceParentTemplate } from "@/components/services/service-parent-template"
import { getBlogPostsForService } from "@/lib/data/blog-posts"
import { getAllServiceSlugs, getChildServices, getService, getServicesFromSlugs } from "@/lib/data/services"
import { absoluteUrl, localizedHreflangAlternates, pageSocialMetadata } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"
import { nonDefaultLocales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"

export const dynamicParams = false

interface Props {
  params: Promise<{ locale: string; service: string }>
}

export async function generateStaticParams() {
  return nonDefaultLocales.flatMap((locale) =>
    getAllServiceSlugs(locale).map((slug) => ({ locale, service: slug }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, service: serviceSlug } = await params
  const service = getService(serviceSlug, locale as Locale)

  if (!service) {
    return { title: getDictionary(locale as Locale).common.notFoundService }
  }

  const metaTitle = service.metaTitle ?? service.name
  const metaDescription = service.metaDescription ?? service.shortDescription

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: localizedHreflangAlternates(service.canonicalPath, locale as Locale),
    ...pageSocialMetadata({
      title: metaTitle,
      description: metaDescription,
      path: service.canonicalPath,
      locale: locale as Locale,
      images: service.image ? [absoluteUrl(service.image)] : undefined,
    }),
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, service: serviceSlug } = await params
  const typedLocale = locale as Locale
  const service = getService(serviceSlug, typedLocale)

  if (!service) {
    notFound()
  }

  const parentService = service.parentSlug
    ? getService(service.parentSlug, typedLocale)
    : undefined

  if (service.kind === "parent") {
    return <ServiceParentTemplate service={service} childServices={getChildServices(service.slug, typedLocale)} locale={typedLocale} />
  }

  return (
    <ServiceDetailTemplate
      service={service}
      parentService={parentService}
      relatedServices={getServicesFromSlugs(service.relatedServices, typedLocale)}
      relatedPosts={getBlogPostsForService(service.slug, 3, typedLocale)}
      locale={typedLocale}
    />
  )
}
