import { businessHours, businessInfo, isOpenBusinessHours } from "@/lib/data/site"
import type { BlogPost } from "@/lib/data/blog-posts"
import type { Service } from "@/lib/data/services"
import { absoluteUrl, canonicalUrl, SITE_NAME, SITE_URL } from "@/lib/seo"

const businessId = `${SITE_URL}/#business`
const websiteId = `${SITE_URL}/#website`

export function businessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": businessId,
    name: businessInfo.name,
    url: canonicalUrl("/"),
    telephone: businessInfo.phone,
    email: businessInfo.email,
    description: businessInfo.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${businessInfo.addressLine1}, ${businessInfo.addressLine2}`,
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

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: SITE_NAME,
    url: canonicalUrl("/"),
    publisher: { "@id": businessId },
  }
}

export function serviceJsonLd(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${canonicalUrl(service.canonicalPath)}#service`,
    name: service.name,
    description: service.shortDescription,
    url: canonicalUrl(service.canonicalPath),
    image: service.image ? absoluteUrl(service.image) : undefined,
    provider: { "@id": businessId },
    areaServed: {
      "@type": "City",
      name: "Tokyo",
    },
    serviceType: service.category,
  }
}

export function blogPostingJsonLd(post: Pick<BlogPost, "slug" | "title" | "excerpt" | "publishedAt" | "author" | "featureImage">) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonicalUrl(`/blog/${post.slug}/`)}#blog-posting`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    image: post.featureImage ? absoluteUrl(post.featureImage) : undefined,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: { "@id": businessId },
    mainEntityOfPage: canonicalUrl(`/blog/${post.slug}/`),
  }
}
