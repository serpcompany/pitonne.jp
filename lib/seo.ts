import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { defaultLocale } from "@/lib/i18n/config"
import seoLimits from "@/lib/seo-limits.json"

export const SITE_URL = "https://pitonne.jp"
export const SITE_NAME = "Pitonne"
export const DEFAULT_TITLE = "Pitonne | Stem Cell & IV Therapy in Tokyo"
export const DEFAULT_DESCRIPTION =
  "Pitonne is a concierge wellness service in Nishi Azabu, Tokyo, offering premium IV therapy, stem cell related wellness support, and in-home or hotel visit care."
export const DEFAULT_OG_IMAGE = "/images/content/sheet/home.jpg"
export const GTM_CONTAINER_ID = "GTM-TJ94H7LQ"

export function isProductionDeployment(): boolean {
  return process.env.DEPLOY_ENV === "production" || process.env.NEXT_PUBLIC_DEPLOY_ENV === "production"
}

export function normalizePath(path: string): string {
  if (!path || path === "/") {
    return "/"
  }

  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`
}

export function canonicalUrl(path: string): string {
  return `${SITE_URL}${normalizePath(path)}`
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) {
    return path
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

export function localizedCanonicalUrl(path: string, locale: Locale): string {
  const normalizedPath = normalizePath(path)
  if (locale === "ja") {
    return `${SITE_URL}/ja${normalizedPath}`
  }
  return `${SITE_URL}${normalizedPath}`
}

export function localizedPath(path: string, locale: Locale): string {
  if (locale === defaultLocale) return normalizePath(path)
  return `/ja${normalizePath(path)}`
}

export function hreflangAlternates(path: string) {
  const normalizedPath = normalizePath(path)
  return {
    canonical: canonicalUrl(normalizedPath),
    languages: {
      en: canonicalUrl(normalizedPath),
      ja: `${SITE_URL}/ja${normalizedPath}`,
      "x-default": canonicalUrl(normalizedPath),
    },
  }
}

export function localizedHreflangAlternates(path: string, locale: Locale) {
  const normalizedPath = normalizePath(path)
  return {
    canonical: localizedCanonicalUrl(normalizedPath, locale),
    languages: {
      en: canonicalUrl(normalizedPath),
      ja: `${SITE_URL}/ja${normalizedPath}`,
      "x-default": canonicalUrl(normalizedPath),
    },
  }
}

type OpenGraphImages = NonNullable<NonNullable<Metadata["openGraph"]>["images"]>

// Shared with scripts/audit-meta-lengths.mjs and scripts/audit-seo-build.mjs (Ahrefs Site Audit ranges)
export const TITLE_SUFFIX = seoLimits.titleSuffix
export const TITLE_MAX = seoLimits.title.max

export function fitsTitleLimit(title: string): boolean {
  return title.length + TITLE_SUFFIX.length <= TITLE_MAX
}

// Next.js replaces (does not merge) the layout's openGraph/twitter when a page sets its own,
// so every page sets both with the full set of tags.
export function pageSocialMetadata({
  title,
  description,
  path,
  locale,
  images,
}: {
  title: string
  description: string
  path: string
  locale: Locale
  images?: OpenGraphImages
}) {
  const resolvedImages = images ?? [absoluteUrl(DEFAULT_OG_IMAGE)]

  return {
    openGraph: {
      title,
      description,
      url: localizedCanonicalUrl(path, locale),
      siteName: SITE_NAME,
      locale: locale === "ja" ? "ja_JP" : "en_US",
      type: "website" as const,
      images: resolvedImages,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: resolvedImages,
    },
  }
}

export function deploymentRobots(): Metadata["robots"] {
  return isProductionDeployment()
    ? {
        index: true,
        follow: true,
      }
    : {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      }
}
