import type { MetadataRoute } from "next"
import { getAllAreas, wards } from "@/lib/data/areas"
import { blogPosts, getAllCategories } from "@/lib/data/blog-posts"
import { pitonneVideos } from "@/lib/data/videos"
import { services } from "@/lib/data/services"
import { canonicalRoutes } from "@/lib/data/routes"
import { canonicalUrl, SITE_URL } from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    canonicalRoutes.home,
    canonicalRoutes.about,
    canonicalRoutes.services,
    canonicalRoutes.contact,
    canonicalRoutes.blog,
    canonicalRoutes.faqs,
    canonicalRoutes.areasServed,
    canonicalRoutes.videos,
    canonicalRoutes.legal,
    canonicalRoutes.privacyPolicy,
    canonicalRoutes.termsConditions,
    canonicalRoutes.medicalDisclaimer,
  ]

  const paths = [
    ...staticPaths,
    ...services.map((service) => service.canonicalPath),
    ...blogPosts.map((post) => `/blog/${post.slug}/`),
    ...pitonneVideos.map((video) => video.watchPath),
    ...getAllCategories().map((category) => `/blog/category/${category.slug}/`),
    ...wards.map((ward) => `/areas-served/${ward.slug}/`),
    ...getAllAreas().map(({ ward, area }) => `/areas-served/${ward.slug}/${area.slug}/`),
  ]

  const uniquePaths = Array.from(new Set(paths))

  // Generate both English and Japanese entries with hreflang alternates
  return uniquePaths.flatMap((path) => {
    const changeFrequency = (path.startsWith("/blog/") ? "weekly" : "monthly") as "weekly" | "monthly"
    const priority = path === "/" ? 1 : path.split("/").filter(Boolean).length === 1 ? 0.8 : 0.6
    const alternates = {
      languages: {
        en: canonicalUrl(path),
        ja: `${SITE_URL}/ja${path.endsWith("/") ? path : `${path}/`}`,
      },
    }

    return [
      {
        url: canonicalUrl(path),
        changeFrequency,
        priority,
        alternates,
      },
      {
        url: `${SITE_URL}/ja${path.endsWith("/") ? path : `${path}/`}`,
        changeFrequency,
        priority,
        alternates,
      },
    ]
  })
}
