import type { Metadata } from "next"

export const SITE_URL = "https://pitonne.jp"
export const SITE_NAME = "Pitonne"
export const DEFAULT_TITLE = "Pitonne | Stem Cell & IV Therapy in Tokyo"
export const DEFAULT_DESCRIPTION =
  "Pitonne is a concierge wellness service based in Nishi Azabu, Tokyo, specializing in premium IV therapy, stem cell related wellness support, and personalized in-home or hotel visit care."
export const DEFAULT_OG_IMAGE = "/images/content/sheet/home.jpg"
export const GTM_CONTAINER_ID = "GTM-TJ94H7LQ"

export function isProductionDeployment(): boolean {
  return process.env.VERCEL_ENV === "production"
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
