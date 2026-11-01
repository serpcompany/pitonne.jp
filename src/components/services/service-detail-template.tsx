import { serviceBreadcrumbs } from '@/components/services/service-breadcrumbs'
import { JsonLd } from '@/components/shared/json-ld'
import { PageHero } from '@/components/shared/page-hero'
import { RelatedSidebar } from '@/components/shared/related-sidebar'
import { SiteMarkdown } from '@/components/shared/site-markdown'
import type { BlogPost } from '@/lib/data/blog-posts'
import type { Service } from '@/lib/data/services'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { serviceJsonLd } from '@/lib/structured-data'

export function ServiceDetailTemplate({
  service,
  parentService,
  relatedServices,
  relatedPosts,
  locale = 'en' as Locale
}: {
  service: Service
  parentService?: Service
  relatedServices: Service[]
  relatedPosts: BlogPost[]
  locale?: Locale
}) {
  const dict = getDictionary(locale)
  return (
    <div className="bg-background">
      <JsonLd data={serviceJsonLd(service, locale)} />

      <PageHero
        locale={locale}
        breadcrumbs={serviceBreadcrumbs(service, locale, parentService)}
        title={service.name}
        description={service.shortDescription}
      />

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
            <main className="min-w-0">
              {service.image && (
                <div className="mb-12 overflow-hidden rounded-lg border border-border">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="max-h-[420px] w-full object-cover"
                  />
                </div>
              )}

              <section className="blog-prose mb-16">
                <SiteMarkdown content={service.content} />
              </section>

              <section>
                <h2 className="mb-8 font-serif text-2xl font-bold text-foreground md:text-3xl">
                  {dict.services.frequentlyAskedQuestions}
                </h2>
                <div className="space-y-6">
                  {service.faqs.map(faq => (
                    <div key={faq.question} className="border-b border-border pb-6 last:border-0">
                      <h3 className="mb-3 text-lg font-semibold text-foreground">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </main>

            <RelatedSidebar
              bookingTitle={dict.services.bookThisService}
              bookingDescription={dict.services.bookServiceDescription}
              relatedPostsTitle={dict.services.relatedPosts}
              relatedServices={relatedServices}
              relatedPosts={relatedPosts}
              locale={locale}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
