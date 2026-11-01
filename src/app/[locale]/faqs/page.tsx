import type { FAQPage, WithContext } from 'schema-dts'
import { JsonLd } from '@/components/shared/json-ld'
import { PageHero } from '@/components/shared/page-hero'
import { localizedRoute } from '@/lib/data/routes'
import {
  type LocalePageProps,
  localeDictionary,
  localeStaticParams,
  localizedMetadata
} from '../locale-page'

export const dynamicParams = false

export const generateStaticParams = localeStaticParams

export const generateMetadata = localizedMetadata('/faqs/', ({ faqs }) => ({
  title: faqs.frequentlyAskedQuestions,
  description: faqs.metaDescription
}))

export default async function FaqsPage({ params }: LocalePageProps) {
  const { locale, dict } = localeDictionary(await params)

  const faqJsonLd: WithContext<FAQPage> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: dict.faqs.items.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <PageHero
        locale={locale}
        breadcrumbs={[
          { label: dict.nav.home, href: localizedRoute('/', locale) },
          { label: dict.nav.faqs }
        ]}
        title={dict.faqs.frequentlyAskedQuestions}
        description={dict.faqs.heroDescription}
      />

      <section className="bg-white py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl divide-y divide-border">
            {dict.faqs.items.map(faq => (
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
