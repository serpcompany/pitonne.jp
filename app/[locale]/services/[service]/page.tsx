import { Metadata } from "next"
import { notFound } from "next/navigation"
import { ServiceDetailTemplate } from "@/components/services/service-detail-template"
import { ServiceParentTemplate } from "@/components/services/service-parent-template"
import { getBlogPostsForService } from "@/lib/data/blog-posts"
import { getAllServiceSlugs, getChildServices, getService, getServicesFromSlugs } from "@/lib/data/services"
import { absoluteUrl, localizedCanonicalUrl, localizedHreflangAlternates } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"
import { locales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"

interface Props {
  params: Promise<{ locale: string; service: string }>
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    getAllServiceSlugs(locale).map((slug) => ({ locale, service: slug }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, service: serviceSlug } = await params
  const service = getService(serviceSlug, locale as Locale)

  if (!service) {
    return { title: getDictionary(locale as Locale).common.notFoundService }
  }

  return {
    title: service.name,
    description: service.shortDescription,
    alternates: localizedHreflangAlternates(service.canonicalPath, locale as Locale),
    openGraph: {
      title: service.name,
      description: service.shortDescription,
      url: localizedCanonicalUrl(service.canonicalPath, locale as Locale),
      images: service.image ? [absoluteUrl(service.image)] : undefined,
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: service.name,
      description: service.shortDescription,
      images: service.image ? [absoluteUrl(service.image)] : undefined,
    },
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
