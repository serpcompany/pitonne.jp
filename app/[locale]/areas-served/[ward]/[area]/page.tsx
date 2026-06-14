import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AreaDetailPage } from "@/components/area-detail-page"
import { getAllAreas, getArea } from "@/lib/data/areas"
import { localizedCanonicalUrl, localizedHreflangAlternates } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"
import { locales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"

interface Props {
  params: Promise<{ locale: string; ward: string; area: string }>
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    getAllAreas().map(({ ward, area }) => ({
      locale,
      ward: ward.slug,
      area: area.slug,
    }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, ward: wardSlug, area: areaSlug } = await params
  const typedLocale = locale as Locale
  const result = getArea(wardSlug, areaSlug)

  if (!result) {
    return { title: "Area Not Found | Pitonne" }
  }

  const { ward, area } = result

  const seoTitle = typedLocale === "ja"
    ? `${area.nameJa}（${ward.nameJa}）の点滴療法・幹細胞・血液検査`
    : `IV Therapy, Stem Cells & Blood Tests in ${area.name}, ${ward.name}`
  const seoDescription = typedLocale === "ja"
    ? `${area.nameJa}（${ward.nameJa}、東京）での点滴療法、幹細胞治療、処方薬、血液検査。Pitonneの出張・クリニックケア。`
    : `IV therapy, stem cell treatments, medications, and blood testing in ${area.name} (${area.nameJa}), ${ward.name} Ward, Tokyo. Mobile and in-clinic care from Pitonne.`

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: localizedHreflangAlternates(`/areas-served/${ward.slug}/${area.slug}/`, typedLocale),
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: localizedCanonicalUrl(`/areas-served/${ward.slug}/${area.slug}/`, typedLocale),
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
  }
}

export default async function AreaPage({ params }: Props) {
  const { locale, ward: wardSlug, area: areaSlug } = await params
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
      wardNameJa={ward.nameJa}
      wardSlug={ward.slug}
      description={area.description}
      highlights={area.highlights}
      landmarks={area.landmarks}
      otherAreas={otherAreas}
      locale={locale as Locale}
    />
  )
}
