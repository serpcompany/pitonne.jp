import Link from "next/link"
import { PageHero } from "@/components/shared/page-hero"
import { JsonLd } from "@/components/shared/json-ld"
import { ServiceCardGrid } from "@/components/services/service-card-grid"
import type { Service } from "@/lib/data/services"
import { serviceJsonLd } from "@/lib/structured-data"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { localizedRoute } from "@/lib/data/routes"

export function ServiceParentTemplate({ service, childServices, locale = "en" as Locale }: { service: Service; childServices: Service[]; locale?: Locale }) {
  const dict = getDictionary(locale)
  return (
    <div className="bg-background">
      <JsonLd data={serviceJsonLd(service, locale)} />

      <PageHero
        breadcrumbs={[
          { label: dict.nav.home, href: localizedRoute("/", locale) },
          { label: dict.nav.services, href: localizedRoute("/services/", locale) },
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
            <h2 className="font-serif text-3xl text-foreground md:text-4xl">{dict.services.availableTreatments}</h2>
            <Link href={localizedRoute("/services/", locale)} className="text-sm text-[#7A8F87] hover:underline">
              {dict.services.viewAllServices}
            </Link>
          </div>
          <ServiceCardGrid services={childServices} cardClassName="bg-background" />
        </div>
      </section>
    </div>
  )
}
