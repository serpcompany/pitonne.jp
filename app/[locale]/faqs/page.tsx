import type { Metadata } from "next"
import { JsonLd } from "@/components/shared/json-ld"
import { PageHero } from "@/components/shared/page-hero"
import { localizedHreflangAlternates } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"
import { locales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { localizedRoute } from "@/lib/data/routes"

const faqs = [
  {
    question: "Are both mobile visits and in clinic appointments available?",
    answer:
      "Yes. Pitonne primarily offers mobile visits to your home, hotel, or office, and in clinic appointments are also available. For in clinic appointments, a \u00A55,000 discount applies to IV therapy services.",
  },
  {
    question: "What areas do you serve for mobile visits?",
    answer:
      "We are based in Nishi Azabu and primarily offer mobile visits across central Tokyo. Please review the service area details listed with each menu option. Depending on the request, appointments in farther areas may also be available upon consultation.",
  },
  {
    question: "Is there an additional travel fee for mobile visits?",
    answer:
      "Mobile visit fees are included within 5 km of our Nishi Azabu location. For appointments outside the 5 km service area, an additional travel fee applies based on distance. Please select the appropriate travel fee option when booking.",
  },
  {
    question: "Is there a discount for in clinic appointments?",
    answer:
      "Yes. For in clinic appointments, a \u00A55,000 discount applies to IV therapy services. Please note that some services, such as blood testing, may be excluded.",
  },
  {
    question: "Is an online medical consultation required before Exosome IV therapy?",
    answer:
      "Yes. Exosome IV therapy is provided after an online medical consultation with a physician. Treatment is recommended based on your condition, goals, and medical suitability.",
  },
  {
    question: "Who is Exosome IV therapy recommended for?",
    answer:
      "Exosome IV therapy may be suitable for those seeking enhanced recovery, improved overall condition, or additional support during demanding periods. It is also selected by some clients for advanced conditioning and men's wellness support.",
  },
  {
    question: "Can treatments be provided at hotels or offices?",
    answer:
      "Yes. In addition to home visits, treatments can also be provided at hotels or offices. Please ensure that a quiet and comfortable space is available. Depending on the property, prior confirmation may be required.",
  },
  {
    question: "What should I prepare before my appointment?",
    answer:
      "No special preparation is required. Please prepare a comfortable space, such as a chair or sofa, where you can relax during treatment. Depending on your condition, some treatment details may be adjusted on the day of service.",
  },
  {
    question: "Are your services available for international clients?",
    answer:
      "Yes. English support is available. Our services are available for international travelers and guests staying in Tokyo, including mobile visits to hotels.",
  },
  {
    question: "What if I'm not sure which service to choose?",
    answer:
      "We can help guide you based on your concerns and goals. If you are unsure which service to choose, please contact us in advance or book an online consultation first.",
  },
  {
    question: "Can I change or cancel my appointment?",
    answer:
      "If you need to change or cancel your appointment, please contact us as early as possible. Depending on the timing and service booked, our cancellation policy may apply.",
  },
  {
    question: "Are same day appointments available?",
    answer:
      "Same day appointments may be available depending on schedule and location. Please contact us first to confirm availability.",
  },
]

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const dict = getDictionary(locale as Locale)

  return {
    title: dict.faqs.frequentlyAskedQuestions,
    description:
      "Answers to common questions about Pitonne mobile visits, in clinic appointments, IV therapy, Exosome IV therapy, service areas, and booking in Tokyo.",
    alternates: localizedHreflangAlternates("/faqs/", locale as Locale),
    openGraph: {
      title: dict.faqs.frequentlyAskedQuestions,
      description:
        "Answers to common questions about Pitonne mobile visits, in clinic appointments, IV therapy, Exosome IV therapy, service areas, and booking in Tokyo.",
      url: localizedHreflangAlternates("/faqs/", locale as Locale).canonical,
    },
  }
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

interface Props {
  params: Promise<{ locale: string }>
}

export default async function FaqsPage({ params }: Props) {
  const { locale } = await params
  const dict = getDictionary(locale as Locale)

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <PageHero
        breadcrumbs={[
          { label: dict.nav.home, href: localizedRoute("/", locale as Locale) },
          { label: dict.nav.faqs },
        ]}
        title={dict.faqs.frequentlyAskedQuestions}
        description="Find answers to common questions about mobile visits, in clinic appointments, service areas, appointment preparation, and Exosome IV therapy."
      />

      <section className="bg-white py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl divide-y divide-border">
            {faqs.map((faq) => (
              <article key={faq.question} className="py-8 first:pt-0 last:pb-0">
                <h2 className="mb-4 font-serif text-2xl text-foreground">{faq.question}</h2>
                <p className="text-muted-foreground">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
