import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AreaDetailPage } from '@/components/area-detail-page'
import { getAllAreas, getArea } from '@/lib/data/areas'
import type { Locale } from '@/lib/i18n/config'
import { nonDefaultLocales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { interpolate } from '@/lib/i18n/interpolate'
import { fitsTitleLimit, localizedPageMetadata } from '@/lib/seo'

export const dynamicParams = false

interface Props {
  params: Promise<{ locale: string; ward: string; area: string }>
}

export async function generateStaticParams() {
  return nonDefaultLocales.flatMap(locale =>
    getAllAreas().map(({ ward, area }) => ({
      locale,
      ward: ward.slug,
      area: area.slug
    }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, ward: wardSlug, area: areaSlug } = await params
  const typedLocale = locale as Locale
  const dict = getDictionary(typedLocale)
  const result = getArea(wardSlug, areaSlug)

  if (!result) {
    return { title: dict.common.notFoundArea }
  }

  const { ward, area } = result
  const names = { area: area.name, areaJa: area.nameJa, ward: ward.name, wardJa: ward.nameJa }
  const titleWithWard = interpolate(dict.areas.areaMetaTitle, names)
  const seoTitle = fitsTitleLimit(titleWithWard)
    ? titleWithWard
    : interpolate(dict.areas.areaMetaTitleShort, names)
  const seoDescription = interpolate(dict.areas.areaMetaDescription, names)

  return localizedPageMetadata({
    title: seoTitle,
    description: seoDescription,
    path: `/areas-served/${ward.slug}/${area.slug}/`,
    locale: typedLocale
  })
}

export default async function AreaPage({ params }: Props) {
  const { locale, ward: wardSlug, area: areaSlug } = await params
  const result = getArea(wardSlug, areaSlug)

  if (!result) {
    notFound()
  }

  const { ward, area } = result
  const otherAreas = ward.areas
    .filter(candidate => candidate.slug !== area.slug)
    .map(candidate => ({ name: candidate.name, slug: candidate.slug }))

  return (
    <AreaDetailPage
      areaName={area.name}
      areaNameJa={area.nameJa}
      wardName={ward.name}
      wardNameJa={ward.nameJa}
      wardSlug={ward.slug}
      description={area.description}
      descriptionJa={area.descriptionJa}
      highlights={area.highlights}
      highlightsJa={area.highlightsJa}
      landmarks={area.landmarks}
      landmarksJa={area.landmarksJa}
      otherAreas={otherAreas}
      locale={locale as Locale}
    />
  )
}
