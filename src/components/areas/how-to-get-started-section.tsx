import { ContactButton } from "@/components/shared/contact-button"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"

export function HowToGetStartedSection({ locationLabel, locale = "en" as Locale }: { locationLabel?: string; locale?: Locale }) {
  const dict = getDictionary(locale)
  const steps = [dict.areas.sendRequest, dict.areas.clinicalReview, dict.areas.carePlanning]
  const descriptions = [
    locationLabel ? `${locationLabel} ${dict.areas.sendRequestDesc}` : dict.areas.sendRequestDesc,
    dict.areas.clinicalReviewDesc,
    dict.areas.carePlanningDesc,
  ]

  return (
    <section className="bg-card py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center font-serif text-3xl text-foreground">{dict.areas.howToGetStarted}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#7A8F87] text-lg font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="mb-2 font-medium text-foreground">{step}</h3>
                <p className="text-sm text-muted-foreground">
                  {descriptions[index]}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <ContactButton locale={locale}>{dict.areas.contactPitonne}</ContactButton>
          </div>
        </div>
      </div>
    </section>
  )
}
