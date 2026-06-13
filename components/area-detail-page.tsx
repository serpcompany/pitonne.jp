import Link from "next/link"
import { PageHero } from "@/components/shared/page-hero"
import { CareAvailableSection } from "@/components/areas/care-available-section"
import { HowToGetStartedSection } from "@/components/areas/how-to-get-started-section"
import { LatestPostsSection } from "@/components/shared/latest-posts-section"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { localizedRoute } from "@/lib/data/routes"

interface AreaPageProps {
  areaName: string
  areaNameJa: string
  wardName: string
  wardNameJa: string
  wardSlug: string
  description: string
  highlights: string[]
  landmarks: string[]
  otherAreas: { name: string; slug: string }[]
  locale?: Locale
}

const faqs = (areaName: string, wardName: string, locale: Locale = "en") => {
  if (locale === "ja") {
    return [
      {
        question: `${areaName}、${wardName}、東京に滞在中にご相談の予約はできますか？`,
        answer: `はい。${areaName}、${wardName}、東京にご滞在中の方は、ご相談オプション、訪問型ケア、最適な次のステップについてPitonneにお問い合わせいただけます。`,
      },
      {
        question: `${areaName}の患者様にはどのようなサービスがありますか？`,
        answer: `Pitonneでは、点滴療法、幹細胞関連のケアプランニング、オンライン薬の相談、コンシェルジュ・ウェルネスサポートについてご相談いただけます。ご利用の可否は、お客様の目標、タイミング、臨床的適性によります。`,
      },
      {
        question: `${areaName}、${wardName}、東京近辺でホテルや自宅への訪問はできますか？`,
        answer: `東京都心部での自宅やホテルへの訪問調整が可能な場合があります。場所、ご希望の時間、ケアのご要望をお知らせいただき、対応可能かチームが確認いたします。`,
      },
      {
        question: `Pitonneに連絡する際に何を伝えればよいですか？`,
        answer: `現在のエリア、クリニック訪問または訪問型サポートのどちらをご希望か、興味のあるサービス、時間的な制約をお知らせください。`,
      },
    ]
  }
  return [
    {
      question: `Can I book a consultation if I am staying in ${areaName}, ${wardName}, Tokyo?`,
      answer: `Yes. Patients staying in ${areaName}, ${wardName}, Tokyo can contact Pitonne to ask about consultation options, visit-based care, and the most appropriate next step.`,
    },
    {
      question: `What services are available for ${areaName} patients?`,
      answer: "Pitonne can discuss IV therapy, stem cell related care planning, online medication consultation, and concierge wellness support. Availability depends on your goals, timing, and clinical suitability.",
    },
    {
      question: `Do you offer hotel or home visits near ${areaName}, ${wardName}, Tokyo?`,
      answer: "In-home and hotel visit coordination may be available in central Tokyo. Share your location, preferred time, and care request so the team can confirm what is possible.",
    },
    {
      question: "What should I include when I contact Pitonne?",
      answer: "Please include your current area, whether you prefer a clinic visit or visit-based support, the service you are interested in, and any timing constraints.",
    },
  ]
}

export function AreaDetailPage({
  areaName,
  areaNameJa,
  wardName,
  wardNameJa,
  wardSlug,
  description,
  highlights,
  landmarks,
  otherAreas,
  locale = "en" as Locale,
}: AreaPageProps) {
  const dict = getDictionary(locale)
  const areaFaqs = faqs(areaName, wardName, locale)
  const mapQuery = encodeURIComponent(`${areaName}, ${wardName}, Tokyo, Japan`)
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`

  return (
    <div className="bg-background">
      <PageHero
        breadcrumbs={[
          { label: dict.nav.home, href: localizedRoute("/", locale) },
          { label: dict.nav.areasServed, href: localizedRoute("/areas-served/", locale) },
          { label: locale === "ja" ? wardNameJa : wardName, href: localizedRoute(`/areas-served/${wardSlug}/`, locale) },
          { label: locale === "ja" ? areaNameJa : areaName },
        ]}
        eyebrow={`${areaNameJa} · ${wardName}, Tokyo`}
        title={locale === "ja"
          ? `${areaNameJa}（${wardNameJa}、東京）の点滴療法・幹細胞・処方薬・血液検査`
          : `IV Therapy, Stem Cells, Medications & Blood Testing in ${areaName}, ${wardName}, Tokyo`}
        description={description}
      />

      <CareAvailableSection locale={locale} />
      <HowToGetStartedSection locale={locale} />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <h2 className="mb-4 font-serif text-3xl text-foreground">{dict.areas.localAccess}</h2>
              <p className="mb-6 text-muted-foreground">
                {locale === "ja"
                  ? `Pitonneは${areaNameJa}（${wardNameJa}、東京）周辺でウェルネスに関するご相談や訪問型ケアを調整しています。`
                  : `Pitonne coordinates wellness consultations and visit-based care around ${areaName}, ${wardName}, Tokyo.`}
              </p>
              {(highlights.length > 0 || landmarks.length > 0) && (
                <div className="grid gap-6 md:grid-cols-2">
                  {highlights.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-semibold text-foreground">{dict.areas.areaNotes}</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {landmarks.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-semibold text-foreground">{dict.areas.nearbyLandmarks}</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {landmarks.map((landmark) => (
                          <li key={landmark}>{landmark}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
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
                title={`${areaName}, ${wardName}, Tokyo map`}
                className="block w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#faf9f7] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center font-serif text-3xl text-foreground">{dict.services.frequentlyAskedQuestions}</h2>
            <div className="space-y-6">
              {areaFaqs.map((faq) => (
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
            <h3 className="mb-6 text-center font-semibold text-foreground">{dict.areas.otherAreasIn} {locale === "ja" ? wardNameJa : wardName}</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {otherAreas.map((area) => (
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
