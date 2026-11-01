import Link from 'next/link'
import { ServiceCardGrid } from '@/components/services/service-card-grid'
import { ServicePage } from '@/components/services/service-page'
import { SiteMarkdown } from '@/components/shared/site-markdown'
import { localizedRoute } from '@/lib/data/routes'
import type { Service } from '@/lib/data/services'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function ServiceParentTemplate({
  service,
  childServices,
  locale = 'en' as Locale
}: {
  service: Service
  childServices: Service[]
  locale?: Locale
}) {
  const dict = getDictionary(locale)
  return (
    <ServicePage
      service={service}
      description={service.fullDescription}
      hero={
        service.image && (
          <div className="overflow-hidden rounded-lg border border-border">
            <img
              src={service.image}
              alt={service.name}
              className="max-h-[420px] w-full object-cover"
            />
          </div>
        )
      }
      locale={locale}
    >
      <section className="bg-card py-16 md:py-20">
        <div className="container mx-auto px-4">
          {service.content && (
            <section className="blog-prose mx-auto mb-16 max-w-4xl">
              <SiteMarkdown content={service.content} />
            </section>
          )}

          <div className="mb-8 flex items-center justify-between gap-6">
            <h2 className="font-serif text-3xl text-foreground md:text-4xl">
              {dict.services.availableTreatments}
            </h2>
            <Link
              href={localizedRoute('/services/', locale)}
              className="text-sm text-[#7A8F87] hover:underline"
            >
              {dict.services.viewAllServices}
            </Link>
          </div>
          <ServiceCardGrid services={childServices} cardClassName="bg-background" />
        </div>
      </section>
    </ServicePage>
  )
}
