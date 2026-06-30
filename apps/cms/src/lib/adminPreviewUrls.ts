export type CmsLocale = "en" | "ja"

export const pageRoutes: Record<string, string> = {
  about: "/about/",
  contact: "/contact/",
  faqs: "/faqs/",
  home: "/",
}

export function getPublicWebUrl(): string {
  const env = typeof process === "undefined" ? undefined : process.env

  return (env?.PAYLOAD_PUBLIC_WEB_URL || env?.NEXT_PUBLIC_PAYLOAD_PUBLIC_WEB_URL || "http://localhost:3000").replace(
    /\/+$/,
    "",
  )
}

function getLocalePrefix(locale?: string) {
  return locale === "ja" ? "/ja" : ""
}

export function getBlogPostPreviewUrl(slug: unknown, locale?: string) {
  if (typeof slug !== "string" || !slug) {
    return null
  }

  return `${getPublicWebUrl()}${getLocalePrefix(locale)}/blog/${slug}/`
}

export function getPagePreviewUrl(key: unknown, locale?: string) {
  if (typeof key !== "string") {
    return null
  }

  const route = pageRoutes[key]
  if (!route) {
    return null
  }

  return `${getPublicWebUrl()}${getLocalePrefix(locale)}${route}`
}
