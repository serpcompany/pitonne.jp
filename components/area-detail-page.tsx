import Link from "next/link"
import { PageHero } from "@/components/shared/page-hero"
import { CareAvailableSection } from "@/components/areas/care-available-section"
import { HowToGetStartedSection } from "@/components/areas/how-to-get-started-section"
import { LatestPostsSection } from "@/components/shared/latest-posts-section"

interface AreaPageProps {
  areaName: string
  areaNameJa: string
  wardName: string
  wardSlug: string
  description: string
  highlights: string[]
  landmarks: string[]
  otherAreas: { name: string; slug: string }[]
}

const faqs = (areaName: string, wardName: string) => [
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

export function AreaDetailPage({
  areaName,
  areaNameJa,
  wardName,
  wardSlug,
  description,
  highlights,
  landmarks,
  otherAreas,
}: AreaPageProps) {
  const areaFaqs = faqs(areaName, wardName)
  const mapQuery = encodeURIComponent(`${areaName}, ${wardName}, Tokyo, Japan`)
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`

  return (
    <div className="bg-background">
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Areas Served", href: "/areas-served/" },
          { label: wardName, href: `/areas-served/${wardSlug}/` },
          { label: areaName },
        ]}
        eyebrow={`${areaNameJa} · ${wardName}, Tokyo`}
        title={`IV Therapy, Stem Cells, Medications & Blood Testing in ${areaName}, ${wardName}, Tokyo`}
        description={description}
      />

      <CareAvailableSection />
      <HowToGetStartedSection />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <h2 className="mb-4 font-serif text-3xl text-foreground">Local Access</h2>
              <p className="mb-6 text-muted-foreground">
                Pitonne coordinates wellness consultations and visit-based care around {areaName}, {wardName}, Tokyo.
              </p>
              {(highlights.length > 0 || landmarks.length > 0) && (
                <div className="grid gap-6 md:grid-cols-2">
                  {highlights.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-semibold text-foreground">Area Notes</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {landmarks.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-semibold text-foreground">Nearby Landmarks</h3>
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
            <h2 className="mb-10 text-center font-serif text-3xl text-foreground">Frequently Asked Questions</h2>
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

      <LatestPostsSection />

      {otherAreas.length > 0 && (
        <section className="border-t border-border py-12">
          <div className="container mx-auto max-w-4xl px-4">
            <h3 className="mb-6 text-center font-semibold text-foreground">Other Areas in {wardName}</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {otherAreas.map((area) => (
                <Link
                  key={area.slug}
                  href={`/areas-served/${wardSlug}/${area.slug}/`}
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
