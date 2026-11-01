import type { ReactNode } from 'react'
import { serviceBreadcrumbs } from '@/components/services/service-breadcrumbs'
import { JsonLd } from '@/components/shared/json-ld'
import { PageHero } from '@/components/shared/page-hero'
import type { Service } from '@/lib/data/services'
import type { Locale } from '@/lib/i18n/config'
import { serviceJsonLd } from '@/lib/structured-data'

export function ServicePage({
  service,
  parentService,
  description,
  hero,
  locale,
  children
}: {
  service: Service
  parentService?: Service
  description: string
  hero?: ReactNode
  locale: Locale
  children: ReactNode
}) {
  return (
    <div className="bg-background">
      <JsonLd data={serviceJsonLd(service, locale)} />

      <PageHero
        locale={locale}
        breadcrumbs={serviceBreadcrumbs(service, locale, parentService)}
        title={service.name}
        description={description}
      >
        {hero}
      </PageHero>

      {children}
    </div>
  )
}
