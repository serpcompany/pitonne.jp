import type { BreadcrumbItem } from '@/components/shared/breadcrumbs'
import { localizedRoute } from '@/lib/data/routes'
import type { Service } from '@/lib/data/services'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function serviceBreadcrumbs(
  service: Service,
  locale: Locale,
  parentService?: Service
): BreadcrumbItem[] {
  const { nav } = getDictionary(locale)
  return [
    { label: nav.home, href: localizedRoute('/', locale) },
    { label: nav.services, href: localizedRoute('/services/', locale) },
    ...(parentService
      ? [{ label: parentService.name, href: localizedRoute(parentService.canonicalPath, locale) }]
      : []),
    { label: service.name }
  ]
}
