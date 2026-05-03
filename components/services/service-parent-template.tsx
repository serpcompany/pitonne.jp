import Link from "next/link"
import { PageHero } from "@/components/shared/page-hero"
import { JsonLd } from "@/components/shared/json-ld"
import { ServiceCardGrid } from "@/components/services/service-card-grid"
import type { Service } from "@/lib/data/services"
import { serviceJsonLd } from "@/lib/structured-data"

export function ServiceParentTemplate({ service, childServices }: { service: Service; childServices: Service[] }) {
  return (
    <div className="bg-background">
      <JsonLd data={serviceJsonLd(service)} />

      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services/" },
          { label: service.name },
        ]}
        title={service.name}
        description={service.fullDescription}
      >
        {service.image && (
          <div className="overflow-hidden rounded-lg border border-border">
            <img src={service.image} alt={service.name} className="max-h-[420px] w-full object-cover" />
          </div>
        )}
      </PageHero>

      <section className="bg-card py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between gap-6">
            <h2 className="font-serif text-3xl text-foreground md:text-4xl">Available Treatments</h2>
            <Link href="/services/" className="text-sm text-[#2D766F] hover:underline">
              View all services
            </Link>
          </div>
          <ServiceCardGrid services={childServices} cardClassName="bg-background" />
        </div>
      </section>
    </div>
  )
}
