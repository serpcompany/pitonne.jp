import { PageHero } from "@/components/shared/page-hero"
import { ServiceSidebar } from "@/components/services/service-sidebar"
import type { BlogPost } from "@/lib/data/blog-posts"
import type { Service } from "@/lib/data/services"

export function ServiceDetailTemplate({
  service,
  parentService,
  relatedServices,
  relatedPosts,
}: {
  service: Service
  parentService?: Service
  relatedServices: Service[]
  relatedPosts: BlogPost[]
}) {
  return (
    <div className="bg-background">
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services/" },
          ...(parentService ? [{ label: parentService.name, href: parentService.canonicalPath }] : []),
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
                  <img src={service.image} alt={service.name} className="h-auto w-full" />
                </div>
              )}

              <section className="mb-16">
                <h2 className="mb-6 font-serif text-2xl font-bold text-foreground md:text-3xl">Treatment Overview</h2>
                <p className="mb-8 text-lg leading-relaxed text-muted-foreground">{service.fullDescription}</p>
                <ul className="space-y-3">
                  {service.keyPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                      <span className="text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm italic text-muted-foreground">
                  Each treatment plan is adapted to the patient&apos;s goals, symptoms, and overall wellness priorities.
                </p>
              </section>

              <section className="mb-16">
                <h2 className="mb-6 font-serif text-2xl font-bold text-foreground md:text-3xl">Key Benefits</h2>
                <ul className="grid gap-4 md:grid-cols-2">
                  {service.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mb-16">
                <h2 className="mb-8 font-serif text-2xl font-bold text-foreground md:text-3xl">How It Works</h2>
                <div className="space-y-6">
                  {[
                    ["Consultation", "Discuss symptoms, goals, and health history."],
                    ["Personalized Plan", "Your provider recommends the right treatment approach based on your needs."],
                    ["Treatment and Follow-Up", "Treatment is delivered with comfort, safety, and practical recovery in mind."],
                  ].map(([title, text], index) => (
                    <div key={title} className="rounded-lg border border-border bg-card p-6">
                      <h3 className="mb-3 text-xl font-semibold text-foreground">
                        {index + 1}. {title}
                      </h3>
                      <p className="text-muted-foreground">{text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-16">
                <h2 className="mb-6 font-serif text-2xl font-bold text-foreground md:text-3xl">Helpful Notes</h2>
                <ul className="space-y-3">
                  {[
                    "Follow your provider's guidance before and after treatment.",
                    "Stay hydrated and give your body time to recover as advised.",
                    "Ask about timing, frequency, and expected results for your plan.",
                    "Contact the clinic if you have questions after treatment.",
                  ].map((note) => (
                    <li key={note} className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                      <span className="text-muted-foreground">{note}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="mb-8 font-serif text-2xl font-bold text-foreground md:text-3xl">Frequently Asked Questions</h2>
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

            <ServiceSidebar relatedServices={relatedServices} relatedPosts={relatedPosts} />
          </div>
        </div>
      </section>
    </div>
  )
}
