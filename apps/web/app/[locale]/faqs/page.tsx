import type { Metadata } from "next"
import { JsonLd } from "@/components/shared/json-ld"
import { PageHero } from "@/components/shared/page-hero"
import { localizedHreflangAlternates } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"
import { nonDefaultLocales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { localizedRoute } from "@/lib/data/routes"
import { getCorePageContent } from "@/lib/data/cms-pages"

export const dynamicParams = false

export async function generateStaticParams() {
  return nonDefaultLocales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = locale as Locale
  const dict = getDictionary(typedLocale)
  const cmsPage = await getCorePageContent("faqs", typedLocale)
  const title = cmsPage?.metaTitle ?? cmsPage?.title ?? dict.faqs.frequentlyAskedQuestions
  const description = cmsPage?.metaDescription ?? cmsPage?.heroDescription ?? dict.faqs.metaDescription

  return {
    title,
    description,
    alternates: localizedHreflangAlternates("/faqs/", typedLocale),
    openGraph: {
      title,
      description,
      url: localizedHreflangAlternates("/faqs/", typedLocale).canonical,
    },
  }
}

interface Props {
  params: Promise<{ locale: string }>
}

export default async function FaqsPage({ params }: Props) {
  const { locale } = await params
  const typedLocale = locale as Locale
  const dict = getDictionary(typedLocale)
  const cmsPage = await getCorePageContent("faqs", typedLocale)

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.faqs.items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <PageHero
        breadcrumbs={[
          { label: dict.nav.home, href: localizedRoute("/", locale as Locale) },
          { label: dict.nav.faqs },
        ]}
        title={cmsPage?.title ?? dict.faqs.frequentlyAskedQuestions}
        description={cmsPage?.heroDescription ?? dict.faqs.heroDescription}
      />

      <section className="bg-white py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl divide-y divide-border">
            {dict.faqs.items.map((faq) => (
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
