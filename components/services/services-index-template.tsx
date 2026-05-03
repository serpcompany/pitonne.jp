import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PageHero } from "@/components/shared/page-hero"
import { ServiceCardGrid } from "@/components/services/service-card-grid"
import type { Service, ServiceCategorySection } from "@/lib/data/services"

type Section = ServiceCategorySection & { services: Service[] }

export function ServicesIndexTemplate({ sections }: { sections: Section[] }) {
  return (
    <div className="bg-background">
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services" },
        ]}
        title="Our Services"
        description="Explore physician-guided medications, premium IV Therapy, blood testing and regenerative wellness services. Designed for busy professionals, travelers, and health-conscious clients seeking discreet, personalized care in Tokyo."
      />

      <section className="bg-card pb-10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-lg border border-border">
            <img
              src="/images/content/sheet/services/services.jpg"
              alt="Pitonne online consultation and wellness service planning"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      {sections.map((section, index) => (
        <section
          key={section.slug}
          data-testid={`service-section-${section.slug}`}
          className={`py-16 lg:py-20 ${index % 2 === 0 ? "bg-card" : "bg-background"}`}
        >
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between gap-6">
              <h2 className="font-serif text-3xl text-foreground md:text-4xl">{section.title}</h2>
              <Link href={section.href} className="flex items-center gap-1 text-[#2D766F] hover:underline">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ServiceCardGrid services={section.services} cardClassName={index % 2 === 0 ? "bg-background" : "bg-card"} />
          </div>
        </section>
      ))}
    </div>
  )
}
