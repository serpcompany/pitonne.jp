import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { defaultLocale } from "@/lib/i18n/config"

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

// Next.js replaces (does not merge) the layout's openGraph when a page sets its own,
// so every page-level openGraph must carry the full set of tags.
export function pageOpenGraph({
  title,
  description,
  url,
  locale,
  images,
}: {
  title: string
  description: string
  url: string
  locale: string
  images?: OpenGraphImages
}) {
  return {
    title,
    description,
    url,
    siteName: SITE_NAME,
    locale: locale === "ja" ? "ja_JP" : "en_US",
    type: "website" as const,
    images: images ?? [absoluteUrl(DEFAULT_OG_IMAGE)],
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
