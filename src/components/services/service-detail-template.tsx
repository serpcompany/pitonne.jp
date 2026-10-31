import { PageHero } from "@/components/shared/page-hero"
import { JsonLd } from "@/components/shared/json-ld"
import { ServiceSidebar } from "@/components/services/service-sidebar"
import type { BlogPost } from "@/lib/data/blog-posts"
import type { Service } from "@/lib/data/services"
import { serviceJsonLd } from "@/lib/structured-data"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { localizedRoute } from "@/lib/data/routes"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export function ServiceDetailTemplate({
  service,
  parentService,
  relatedServices,
  relatedPosts,
  locale = "en" as Locale,
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
        breadcrumbs={[
          { label: dict.nav.home, href: localizedRoute("/", locale) },
          { label: dict.nav.services, href: localizedRoute("/services/", locale) },
          ...(parentService ? [{ label: parentService.name, href: localizedRoute(parentService.canonicalPath, locale) }] : []),
          { label: service.name },
        ]}
        title={service.name}
        description={service.shortDescription}
      />

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
            <main className="min-w-0">
              {service.image && (
                <div className="mb-12 overflow-hidden rounded-lg border border-border">
                  <img src={service.image} alt={service.name} className="max-h-[420px] w-full object-cover" />
                </div>
              )}

              <section className="blog-prose mb-16">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{service.content}</ReactMarkdown>
              </section>

              <section>
                <h2 className="mb-8 font-serif text-2xl font-bold text-foreground md:text-3xl">{dict.services.frequentlyAskedQuestions}</h2>
                <div className="space-y-6">
                  {service.faqs.map((faq) => (
                    <div key={faq.question} className="border-b border-border pb-6 last:border-0">
                      <h3 className="mb-3 text-lg font-semibold text-foreground">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </main>

            <ServiceSidebar relatedServices={relatedServices} relatedPosts={relatedPosts} locale={locale} />
          </div>
        </div>
      </section>
    </div>
  )
}
