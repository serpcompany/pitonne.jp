import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AreaDetailPage } from "@/components/area-detail-page"
import { getAllAreas, getArea } from "@/lib/data/areas"
import { canonicalUrl } from "@/lib/seo"

export async function generateStaticParams() {
  return getAllAreas().map(({ ward, area }) => ({
    ward: ward.slug,
    area: area.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ward: string; area: string }>
}): Promise<Metadata> {
  const { ward: wardSlug, area: areaSlug } = await params
  const result = getArea(wardSlug, areaSlug)

  if (!result) {
    return { title: "Area Not Found | Pitonne" }
  }

  const { ward, area } = result

  return {
    title: `Stem Cell & IV Therapy in ${area.name}, ${ward.name}`,
    description: `Premium IV therapy, stem cell treatments, and wellness services in ${area.name} (${area.nameJa}), ${ward.name} Ward, Tokyo.`,
    alternates: {
      canonical: canonicalUrl(`/areas-served/${ward.slug}/${area.slug}/`),
    },
    openGraph: {
      title: `Stem Cell & IV Therapy in ${area.name}, ${ward.name}`,
      description: `Premium IV therapy, stem cell treatments, and wellness services in ${area.name} (${area.nameJa}), ${ward.name} Ward, Tokyo.`,
      url: canonicalUrl(`/areas-served/${ward.slug}/${area.slug}/`),
    },
  }
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ ward: string; area: string }>
}) {
  const { ward: wardSlug, area: areaSlug } = await params
  const result = getArea(wardSlug, areaSlug)

  if (!result) {
    notFound()
  }

  const { ward, area } = result
  const otherAreas = ward.areas
    .filter((candidate) => candidate.slug !== area.slug)
    .map((candidate) => ({ name: candidate.name, slug: candidate.slug }))

  return (
    <AreaDetailPage
      areaName={area.name}
      areaNameJa={area.nameJa}
      wardName={ward.name}
      wardSlug={ward.slug}
      description={area.description}
      highlights={area.highlights}
      landmarks={area.landmarks}
      otherAreas={otherAreas}
    />
  )
}
