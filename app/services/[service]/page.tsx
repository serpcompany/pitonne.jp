import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getService, services } from "@/lib/data/services"

interface Props {
  params: Promise<{ service: string }>
}

export async function generateStaticParams() {
  return services.map((s) => ({
    service: s.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: serviceSlug } = await params
  const service = getService(serviceSlug)
  
  if (!service) {
    return { title: "Service Not Found" }
  }

  return {
    title: `${service.name} | Pitonne | Stem Cell & IV Therapy`,
    description: service.shortDescription,
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { service: serviceSlug } = await params
  const service = getService(serviceSlug)

  if (!service) {
    notFound()
  }

  const relatedServices = service.relatedServices
    .map(slug => services.find(s => s.slug === slug))
    .filter(Boolean)

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28">
        {service.image ? (
          <div className="absolute inset-0">
            <img 
              src={service.image} 
              alt={service.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#1a1a1a]/60" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#f5ebe0]/50" />
        )}
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className={`mb-6 font-serif text-4xl font-bold md:text-5xl ${service.image ? 'text-white' : 'text-foreground'}`}>
              {service.name}
            </h1>
            <p className={`text-lg md:text-xl ${service.image ? 'text-white/90' : 'text-muted-foreground'}`}>
              {service.shortDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            {/* Treatment Overview */}
            <div className="mb-16">
              <h2 className="mb-6 font-serif text-2xl font-bold text-foreground md:text-3xl">
                Treatment Overview
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                {service.fullDescription}
              </p>
              <ul className="space-y-3">
                {service.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm italic text-muted-foreground">
                Each treatment plan is adapted to the patient&apos;s goals, symptoms, and overall wellness priorities.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="mb-16">
              <h2 className="mb-6 font-serif text-2xl font-bold text-foreground md:text-3xl">
                Key Benefits
              </h2>
              <ul className="grid gap-4 md:grid-cols-2">
                {service.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How It Works */}
            <div className="mb-16">
              <h2 className="mb-8 font-serif text-2xl font-bold text-foreground md:text-3xl">
                How It Works
              </h2>
              <div className="space-y-8">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="mb-4 text-xl font-semibold text-foreground">1. Consultation</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                      <span className="text-muted-foreground">Discuss symptoms, goals, and health history.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                      <span className="text-muted-foreground">Review whether the treatment is appropriate and safe for you.</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="mb-4 text-xl font-semibold text-foreground">2. Personalized Plan</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                      <span className="text-muted-foreground">Your provider recommends the right treatment approach based on your needs.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                      <span className="text-muted-foreground">Questions, timing, and expectations are reviewed before treatment begins.</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="mb-4 text-xl font-semibold text-foreground">3. Treatment and Follow-Up</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                      <span className="text-muted-foreground">Treatment is delivered with comfort, safety, and practical recovery in mind.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                      <span className="text-muted-foreground">Ongoing guidance helps support results and next-step planning.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Helpful Notes */}
            <div className="mb-16">
              <h2 className="mb-6 font-serif text-2xl font-bold text-foreground md:text-3xl">
                Helpful Notes
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                  <span className="text-muted-foreground">Follow your provider&apos;s guidance before and after treatment.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                  <span className="text-muted-foreground">Stay hydrated and give your body time to recover as advised.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                  <span className="text-muted-foreground">Ask about timing, frequency, and expected results for your plan.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                  <span className="text-muted-foreground">Contact the clinic if you have questions after treatment.</span>
                </li>
              </ul>
            </div>

            {/* FAQs */}
            <div className="mb-16">
              <h2 className="mb-8 font-serif text-2xl font-bold text-foreground md:text-3xl">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {service.faqs.map((faq, index) => (
                  <div key={index} className="border-b border-border pb-6 last:border-0">
                    <h3 className="mb-3 text-lg font-semibold text-foreground">
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Services */}
            {relatedServices.length > 0 && (
              <div className="mb-16">
                <h2 className="mb-6 font-serif text-2xl font-bold text-foreground md:text-3xl">
                  Related Services
                </h2>
                <div className="flex flex-wrap gap-3">
                  {relatedServices.map((related) => (
                    related && (
                      <Link
                        key={related.slug}
                        href={`/services/${related.slug}`}
                        className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-[#4AA69D] hover:text-[#4AA69D]"
                      >
                        {related.name}
                      </Link>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="rounded-lg bg-[#2d2d2d] p-8 text-center text-white md:p-12">
              <h2 className="mb-4 font-serif text-2xl font-bold md:text-3xl">
                Ready to Get Started?
              </h2>
              <p className="mb-6 text-white/80">
                Book a consultation to discuss if {service.name.toLowerCase()} is right for you.
              </p>
              <Link
                href="/contact"
                className="inline-block rounded-md bg-[#4AA69D] px-8 py-3 font-medium text-white transition-colors hover:bg-[#3d8f87]"
              >
                Book Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
