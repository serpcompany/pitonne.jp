import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { z } from "zod"
import type { Locale } from "@/lib/i18n/config"

function serviceContentDirectory(locale: Locale): string {
  if (locale === "ja") {
    return path.join(process.cwd(), "content", "services", "ja")
  }
  return path.join(process.cwd(), "content", "services")
}

const serviceCategorySchema = z.enum(["iv-therapy", "stem-cell", "medication", "blood-tests"])
const serviceKindSchema = z.enum(["parent", "leaf"])

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
})

const serviceFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  category: serviceCategorySchema,
  kind: serviceKindSchema,
  parentSlug: z.string().min(1).optional(),
  canonicalPath: z.string().startsWith("/").endsWith("/"),
  shortDescription: z.string().min(1),
  fullDescription: z.string().min(1),
  benefits: z.array(z.string().min(1)),
  keyPoints: z.array(z.string().min(1)),
  faqs: z.array(faqSchema),
  relatedServices: z.array(z.string().min(1)),
  image: z.string().optional(),
  imageSourcePath: z.string().optional(),
})

export interface FAQ {
  question: string
  answer: string
}

export interface Service {
  slug: string
  name: string
  category: z.infer<typeof serviceCategorySchema>
  kind: z.infer<typeof serviceKindSchema>
  parentSlug?: string
  canonicalPath: string
  sourcePath: string
  imageSourcePath?: string
  shortDescription: string
  fullDescription: string
  content: string
  benefits: string[]
  keyPoints: string[]
  faqs: FAQ[]
  relatedServices: string[]
  image?: string
}

export interface ServiceCategorySection {
  slug: string
  title: string
  href: string
  serviceSlugs: string[]
}

export const serviceCategorySections: ServiceCategorySection[] = [
  {
    slug: "iv-therapy",
    title: "IV Therapy",
    href: "/services/iv-therapy/",
    serviceSlugs: [
      "exosome-iv-drip",
      "hangover-iv-drip",
      "energy-fatigue-recovery-iv",
      "skin-brightening-iv-drip",
      "immune-boost-iv-therapy",
      "iv-vitamin-therapy",
    ],
  },
  {
    slug: "stem-cell-therapy",
    title: "Stem Cell Therapy",
    href: "/services/stem-cell-therapy/",
    serviceSlugs: ["stem-cell-nasal-spray"],
  },
  {
    slug: "medication",
    title: "Medications",
    href: "/services/medication/",
    serviceSlugs: ["ed-medication", "androgenetic-alopecia-medicine"],
  },
  {
    slug: "blood-tests",
    title: "Blood Tests",
    href: "/services/blood-tests/",
    serviceSlugs: ["hormone-blood-testing", "nutrition-blood-testing", "tumor-marker-blood-testing"],
  },
]

const serviceCategoryTitlesJa: Record<string, string> = {
  "IV Therapy": "点滴療法",
  "Stem Cell Therapy": "幹細胞療法",
  "Medications": "処方薬",
  "Blood Tests": "血液検査",
}

const serviceOrder = [
  "iv-therapy",
  "stem-cell-therapy",
  "medication",
  ...serviceCategorySections.flatMap((section) => section.serviceSlugs),
]

function loadServices(locale: Locale): Service[] {
  const directory = serviceContentDirectory(locale)

  if (!fs.existsSync(directory)) {
    return []
  }

  return fs
    .readdirSync(directory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const absolutePath = path.join(directory, fileName)
      const parsed = matter(fs.readFileSync(absolutePath, "utf8"))
      const frontmatter = serviceFrontmatterSchema.parse(parsed.data)

      const contentSubdir = locale === "ja" ? "services/ja" : "services"

      return {
        slug: frontmatter.slug,
        name: frontmatter.title,
        category: frontmatter.category,
        kind: frontmatter.kind,
        parentSlug: frontmatter.parentSlug,
        canonicalPath: frontmatter.canonicalPath,
        sourcePath: `content/${contentSubdir}/${fileName}`,
        imageSourcePath: frontmatter.imageSourcePath,
        shortDescription: frontmatter.shortDescription,
        fullDescription: frontmatter.fullDescription,
        content: parsed.content.trim(),
        benefits: frontmatter.benefits,
        keyPoints: frontmatter.keyPoints,
        faqs: frontmatter.faqs,
        relatedServices: frontmatter.relatedServices,
        image: frontmatter.image,
      }
    })
    .sort((a, b) => serviceOrder.indexOf(a.slug) - serviceOrder.indexOf(b.slug))
}

const servicesByLocale = { en: loadServices("en"), ja: loadServices("ja") }

export const services: Service[] = servicesByLocale.en

function getServicesForLocale(locale: Locale): Service[] {
  return servicesByLocale[locale] ?? servicesByLocale.en
}

export function getService(slug: string, locale: Locale = "en"): Service | undefined {
  return getServicesForLocale(locale).find((service) => service.slug === slug)
}

export function getServicesFromSlugs(slugs: string[], locale: Locale = "en"): Service[] {
  return slugs.map((slug) => getService(slug, locale)).filter((service): service is Service => Boolean(service))
}

export function getServicesByCategory(category: Service["category"], locale: Locale = "en"): Service[] {
  return getServicesForLocale(locale).filter((service) => service.category === category && service.kind === "leaf")
}

export function getParentServices(locale: Locale = "en"): Service[] {
  return getServicesForLocale(locale).filter((service) => service.kind === "parent")
}

export function getChildServices(parentSlug: string, locale: Locale = "en"): Service[] {
  return getServicesForLocale(locale).filter((service) => service.parentSlug === parentSlug)
}

export function getServiceCategorySections(locale: Locale = "en"): Array<ServiceCategorySection & { services: Service[] }> {
  return serviceCategorySections.map((section) => {
    const localizedTitle = locale === "ja" ? (serviceCategoryTitlesJa[section.title] ?? section.title) : section.title
    const localizedHref = locale === "ja" ? `/ja${section.href}` : section.href

    return {
      ...section,
      title: localizedTitle,
      href: localizedHref,
      services: getServicesFromSlugs(section.serviceSlugs, locale),
    }
  })
}

export function getAllServiceSlugs(locale: Locale = "en"): string[] {
  return getServicesForLocale(locale).map((service) => service.slug)
}
