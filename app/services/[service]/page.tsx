import { Metadata } from "next"
import { notFound } from "next/navigation"
import { ServiceDetailTemplate } from "@/components/services/service-detail-template"
import { ServiceParentTemplate } from "@/components/services/service-parent-template"
import { getBlogPostsForService } from "@/lib/data/blog-posts"
import { getChildServices, getService, getServicesFromSlugs, services } from "@/lib/data/services"
import { absoluteUrl, canonicalUrl } from "@/lib/seo"

interface Props {
  params: Promise<{ service: string }>
}

export async function generateStaticParams() {
  return services.map((s) => ({
    service: s.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: serviceSlug } = await params
  const service = getService(serviceSlug)
  
  if (!service) {
    return { title: "Service Not Found" }
  }

  return {
    title: service.name,
    description: service.shortDescription,
    alternates: {
      canonical: canonicalUrl(service.canonicalPath),
    },
    openGraph: {
      title: service.name,
      description: service.shortDescription,
      url: canonicalUrl(service.canonicalPath),
      images: service.image ? [absoluteUrl(service.image)] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: service.name,
      description: service.shortDescription,
      images: service.image ? [absoluteUrl(service.image)] : undefined,
    },
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { service: serviceSlug } = await params
  const service = getService(serviceSlug)

  if (!service) {
    notFound()
  }

  const parentService = service.parentSlug
    ? getService(service.parentSlug)
    : undefined

  if (service.kind === "parent") {
    return <ServiceParentTemplate service={service} childServices={getChildServices(service.slug)} />
  }

  return (
    <ServiceDetailTemplate
      service={service}
      parentService={parentService}
      relatedServices={getServicesFromSlugs(service.relatedServices)}
      relatedPosts={getBlogPostsForService(service.slug)}
    />
  )
}
