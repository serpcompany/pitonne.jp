import type { MetadataRoute } from "next"
import { getAllAreas, wards } from "@/lib/data/areas"
import { blogPosts, getAllCategories } from "@/lib/data/blog-posts"
import { services } from "@/lib/data/services"
import { canonicalRoutes } from "@/lib/data/routes"
import { canonicalUrl } from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    canonicalRoutes.home,
    canonicalRoutes.about,
    canonicalRoutes.services,
    canonicalRoutes.contact,
    canonicalRoutes.blog,
    canonicalRoutes.areasServed,
    canonicalRoutes.legal,
    canonicalRoutes.privacyPolicy,
    canonicalRoutes.termsConditions,
    canonicalRoutes.medicalDisclaimer,
  ]

  const paths = [
    ...staticPaths,
    ...services.map((service) => service.canonicalPath),
    ...blogPosts.map((post) => `/blog/${post.slug}/`),
    ...getAllCategories().map((category) => `/blog/category/${category.slug}/`),
    ...wards.map((ward) => `/areas-served/${ward.slug}/`),
    ...getAllAreas().map(({ ward, area }) => `/areas-served/${ward.slug}/${area.slug}/`),
  ]

  return Array.from(new Set(paths)).map((path) => ({
    url: canonicalUrl(path),
    changeFrequency: path.startsWith("/blog/") ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.split("/").filter(Boolean).length === 1 ? 0.8 : 0.6,
  }))
}
