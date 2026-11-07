import type { Locale } from '@/lib/i18n/config'
import { normalizePath } from '@/lib/seo'
import { wardNames } from './area-names'

export const canonicalRoutes = {
  home: '/',
  about: '/about/',
  services: '/services/',
  ivTherapy: '/services/iv-therapy/',
  stemCellTherapy: '/services/stem-cell-therapy/',
  medication: '/services/medication/',
  bloodTests: '/services/blood-tests/',
  areasServed: '/areas-served/',
  blog: '/blog/',
  videos: '/videos/',
  faqs: '/faqs/',
  contact: '/contact/',
  legal: '/legal/',
  privacyPolicy: '/legal/privacy-policy/',
  termsConditions: '/legal/terms-conditions/',
  medicalDisclaimer: '/legal/disclaimer/'
}

export type ServiceNavCategory = {
  name: string
  href: string
  items: { name: string; href: string }[]
}

export function localizedRoute(path: string, locale: Locale = 'en'): string {
  const normalized = normalizePath(path)
  if (locale === 'ja') {
    return `/ja${normalized}`
  }
  return normalized
}

function nameIn(place: { name: string; nameJa: string }, locale: Locale): string {
  return locale === 'ja' ? place.nameJa : place.name
}

export function getAreaNavigation(locale: Locale = 'en') {
  const otherLocale: Locale = locale === 'ja' ? 'en' : 'ja'
  return wardNames.map(ward => ({
    name: nameIn(ward, locale),
    otherName: nameIn(ward, otherLocale),
    href: localizedRoute(`/areas-served/${ward.slug}/`, locale),
    areas: ward.areas.map(area => ({
      name: nameIn(area, locale),
      href: localizedRoute(`/areas-served/${ward.slug}/${area.slug}/`, locale)
    }))
  }))
}
