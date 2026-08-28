import { businessHours, getBusinessInfo, isOpenBusinessHours } from "@/lib/data/site"
import type { BlogPost } from "@/lib/data/blog-posts"
import type { Service } from "@/lib/data/services"
import type { PitonneVideo } from "@/lib/data/videos"
import { absoluteUrl, canonicalUrl, localizedCanonicalUrl, SITE_NAME, SITE_URL } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"

const businessId = `${SITE_URL}/#business`
const websiteId = `${SITE_URL}/#website`

export function businessJsonLd(locale: Locale = "en") {
  const info = getBusinessInfo(locale)
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": businessId,
    name: info.name,
    url: localizedCanonicalUrl("/", locale),
    telephone: info.phone,
    description: info.description,
    inLanguage: locale === "ja" ? "ja" : "en",
    availableLanguage: [
      { "@type": "Language", name: "English", alternateName: "en" },
      { "@type": "Language", name: "Japanese", alternateName: "ja" },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: `${info.addressLine1}, ${info.addressLine2}`,
      addressLocality: "Minato City",
      addressRegion: "Tokyo",
      postalCode: "106-0031",
      addressCountry: "JP",
    },
    openingHoursSpecification: businessHours.filter(isOpenBusinessHours).map((item) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: item.day,
      opens: item.opens,
      closes: item.closes,
    })),
  }
}

export function websiteJsonLd(locale: Locale = "en") {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: SITE_NAME,
    url: localizedCanonicalUrl("/", locale),
    publisher: { "@id": businessId },
    inLanguage: locale === "ja" ? "ja" : "en",
    availableLanguage: [
      { "@type": "Language", name: "English", alternateName: "en" },
      { "@type": "Language", name: "Japanese", alternateName: "ja" },
    ],
  }
}

export function serviceJsonLd(service: Service, locale: Locale = "en") {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${localizedCanonicalUrl(service.canonicalPath, locale)}#service`,
    name: service.name,
    description: service.shortDescription,
    url: localizedCanonicalUrl(service.canonicalPath, locale),
    image: service.image ? absoluteUrl(service.image) : undefined,
    provider: { "@id": businessId },
    inLanguage: locale === "ja" ? "ja" : "en",
    areaServed: {
      "@type": "City",
      name: "Tokyo",
    },
    serviceType: service.category,
  }
}

export function blogPostingJsonLd(
  post: Pick<BlogPost, "slug" | "title" | "excerpt" | "publishedAt" | "author" | "featureImage">,
  locale: Locale = "en",
) {
  const enUrl = canonicalUrl(`/blog/${post.slug}/`)
  const jaUrl = `${SITE_URL}/ja/blog/${post.slug}/`

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${localizedCanonicalUrl(`/blog/${post.slug}/`, locale)}#blog-posting`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    image: post.featureImage ? absoluteUrl(post.featureImage) : undefined,
    inLanguage: locale === "ja" ? "ja" : "en",
    // Link original and translation via Schema.org translationOfWork/workTranslation
    ...(locale === "ja"
      ? { translationOfWork: { "@type": "BlogPosting", "@id": `${enUrl}#blog-posting` } }
      : { workTranslation: { "@type": "BlogPosting", "@id": `${jaUrl}#blog-posting` } }),
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: { "@id": businessId },
    mainEntityOfPage: localizedCanonicalUrl(`/blog/${post.slug}/`, locale),
  }
}

export function videoObjectJsonLd(video: PitonneVideo) {
  const watchUrl = canonicalUrl(video.watchPath)

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${watchUrl}#video`,
    name: video.title,
    description: video.description,
    thumbnailUrl: [absoluteUrl(video.thumbnailUrl)],
    uploadDate: video.uploadDate,
    duration: video.duration,
    embedUrl: absoluteUrl(video.embedUrl),
    url: watchUrl,
    mainEntityOfPage: watchUrl,
    publisher: { "@id": businessId },
    potentialAction: {
      "@type": "WatchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: watchUrl,
      },
    },
  }
}

export function videoListJsonLd(videos: PitonneVideo[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} Videos`,
    itemListElement: videos.map((video, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: canonicalUrl(video.watchPath),
      item: videoObjectJsonLd(video),
    })),
  }
}

export function videoBreadcrumbJsonLd(video: PitonneVideo) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: canonicalUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Videos",
        item: canonicalUrl("/videos/"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: video.title,
        item: canonicalUrl(video.watchPath),
      },
    ],
  }
}
