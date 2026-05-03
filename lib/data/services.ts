import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { z } from "zod"

const serviceContentDirectory = path.join(process.cwd(), "content", "services")

const serviceCategorySchema = z.enum(["iv-therapy", "stem-cell", "medication"])
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
    serviceSlugs: ["ed-medication"],
  },
]

const serviceOrder = [
  "iv-therapy",
  "stem-cell-therapy",
  "medication",
  ...serviceCategorySections.flatMap((section) => section.serviceSlugs),
]

function loadServices(): Service[] {
  if (!fs.existsSync(serviceContentDirectory)) {
    return []
  }

  return fs
    .readdirSync(serviceContentDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const absolutePath = path.join(serviceContentDirectory, fileName)
      const parsed = matter(fs.readFileSync(absolutePath, "utf8"))
      const frontmatter = serviceFrontmatterSchema.parse(parsed.data)

      return {
        slug: frontmatter.slug,
        name: frontmatter.title,
        category: frontmatter.category,
        kind: frontmatter.kind,
        parentSlug: frontmatter.parentSlug,
        canonicalPath: frontmatter.canonicalPath,
        sourcePath: `content/services/${fileName}`,
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

export const services: Service[] = loadServices()

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug)
}

export function getServicesFromSlugs(slugs: string[]): Service[] {
  return slugs.map((slug) => getService(slug)).filter((service): service is Service => Boolean(service))
}

export function getServicesByCategory(category: Service["category"]): Service[] {
  return services.filter((service) => service.category === category && service.kind === "leaf")
}

export function getParentServices(): Service[] {
  return services.filter((service) => service.kind === "parent")
}

export function getChildServices(parentSlug: string): Service[] {
  return services.filter((service) => service.parentSlug === parentSlug)
}

export function getServiceCategorySections(): Array<ServiceCategorySection & { services: Service[] }> {
  return serviceCategorySections.map((section) => ({
    ...section,
    services: getServicesFromSlugs(section.serviceSlugs),
  }))
}

export function getAllServiceSlugs(): string[] {
  return services.map((service) => service.slug)
}
