import Link from "next/link"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { ServiceCardGrid } from "@/components/services/service-card-grid"
import type { Service } from "@/lib/data/services"

export function ServiceParentTemplate({ service, childServices }: { service: Service; childServices: Service[] }) {
  return (
    <div className="bg-background">
      <section className="bg-[#faf9f7] py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Services", href: "/services/" },
                { label: service.name },
              ]}
            />
            <h1 className="mb-6 font-serif text-4xl font-bold text-foreground md:text-5xl">{service.name}</h1>
            <p className="max-w-3xl text-lg text-muted-foreground md:text-xl">{service.shortDescription}</p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 font-serif text-2xl font-bold text-foreground md:text-3xl">Overview</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">{service.fullDescription}</p>
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
