import Link from 'next/link'
import { CareAvailableSection } from '@/components/areas/care-available-section'
import { HowToGetStartedSection } from '@/components/areas/how-to-get-started-section'
import { LatestPostsSection } from '@/components/shared/latest-posts-section'
import { PageHero } from '@/components/shared/page-hero'
import { localizedRoute } from '@/lib/data/routes'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { interpolate } from '@/lib/i18n/interpolate'

interface AreaPageProps {
  areaName: string
  areaNameJa: string
  wardName: string
  wardNameJa: string
  wardSlug: string
  description: string
  descriptionJa: string
  highlights: string[]
  highlightsJa: string[]
  landmarks: string[]
  landmarksJa: string[]
  otherAreas: { name: string; slug: string }[]
  locale?: Locale
}

export function AreaDetailPage({
  areaName,
  areaNameJa,
  wardName,
  wardNameJa,
  wardSlug,
  description,
  descriptionJa,
  highlights,
  highlightsJa,
  landmarks,
  landmarksJa,
  otherAreas,
  locale = 'en' as Locale
}: AreaPageProps) {
  const dict = getDictionary(locale)
  const names = { area: areaName, areaJa: areaNameJa, ward: wardName, wardJa: wardNameJa }
  const areaFaqs = dict.areas.faqs.map(faq => ({
    question: interpolate(faq.question, names),
    answer: interpolate(faq.answer, names)
  }))
  const mapQuery = encodeURIComponent(`${areaName}, ${wardName}, Tokyo, Japan`)
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`

  const localizedDescription = locale === 'ja' ? descriptionJa : description
  const localizedHighlights = locale === 'ja' ? highlightsJa : highlights
  const localizedLandmarks = locale === 'ja' ? landmarksJa : landmarks

  return (
    <div className="bg-background">
      <PageHero
        locale={locale}
        breadcrumbs={[
          { label: dict.nav.home, href: localizedRoute('/', locale) },
          { label: dict.nav.areasServed, href: localizedRoute('/areas-served/', locale) },
          {
            label: locale === 'ja' ? wardNameJa : wardName,
            href: localizedRoute(`/areas-served/${wardSlug}/`, locale)
          },
          { label: locale === 'ja' ? areaNameJa : areaName }
        ]}
        eyebrow={interpolate(dict.areas.areaEyebrow, names)}
        title={interpolate(dict.areas.areaHeroTitle, names)}
        description={localizedDescription}
      />

      <CareAvailableSection locale={locale} />
      <HowToGetStartedSection locale={locale} />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <h2 className="mb-4 font-serif text-3xl text-foreground">{dict.areas.localAccess}</h2>
              <p className="mb-6 text-muted-foreground">
                {interpolate(dict.areas.localAccessDescription, names)}
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                {localizedHighlights.length > 0 && (
                  <div>
                    <h3 className="mb-3 font-semibold text-foreground">{dict.areas.areaNotes}</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {localizedHighlights.map(highlight => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {localizedLandmarks.length > 0 && (
                  <div>
                    <h3 className="mb-3 font-semibold text-foreground">
                      {dict.areas.nearbyLandmarks}
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {localizedLandmarks.map(landmark => (
                        <li key={landmark}>{landmark}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="320"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={interpolate(dict.areas.areaMapTitle, names)}
                className="block w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#faf9f7] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center font-serif text-3xl text-foreground">
              {dict.services.frequentlyAskedQuestions}
            </h2>
            <div className="space-y-6">
              {areaFaqs.map(faq => (
                <div key={faq.question} className="border-b border-border pb-6 last:border-0">
                  <h3 className="mb-3 font-semibold text-foreground">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <LatestPostsSection locale={locale} />

      {otherAreas.length > 0 && (
        <section className="border-t border-border py-12">
          <div className="container mx-auto max-w-4xl px-4">
            <h3 className="mb-6 text-center font-semibold text-foreground">
              {dict.areas.otherAreasIn} {locale === 'ja' ? wardNameJa : wardName}
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {otherAreas.map(area => (
                <Link
                  key={area.slug}
                  href={localizedRoute(`/areas-served/${wardSlug}/${area.slug}/`, locale)}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-[#7A8F87] hover:text-[#7A8F87]"
                >
                  {area.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
