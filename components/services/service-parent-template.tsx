import Link from "next/link"
import { PageHero } from "@/components/shared/page-hero"
import { ServiceCardGrid } from "@/components/services/service-card-grid"
import type { Service } from "@/lib/data/services"

export function ServiceParentTemplate({ service, childServices }: { service: Service; childServices: Service[] }) {
  return (
    <div className="bg-background">
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services/" },
          { label: service.name },
        ]}
        title={service.name}
        description={service.shortDescription}
      />

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div>
              <h2 className="mb-6 font-serif text-2xl font-bold text-foreground md:text-3xl">Overview</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">{service.fullDescription}</p>
            </div>
            {service.image && (
              <div className="overflow-hidden rounded-lg border border-border">
                <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-card py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between gap-6">
            <h2 className="font-serif text-3xl text-foreground md:text-4xl">Available Treatments</h2>
            <Link href="/services/" className="text-sm text-[#4AA69D] hover:underline">
              View all services
            </Link>
          </div>
          <ServiceCardGrid services={childServices} cardClassName="bg-background" />
        </div>
      </section>
    </div>
  )
}
