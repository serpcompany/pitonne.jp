import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function getHeaderText(locale: Locale) {
  const { nav, common, contact, languageSwitcher } = getDictionary(locale)
  return {
    nav: {
      home: nav.home,
      about: nav.about,
      faqs: nav.faqs,
      services: nav.services,
      areasServed: nav.areasServed,
      blog: nav.blog,
      videos: nav.videos,
      viewAllServices: nav.viewAllServices,
      viewAllAreas: nav.viewAllAreas,
      phone: nav.phone
    },
    common: {
      logoAlt: common.logoAlt,
      contactUs: common.contactUs,
      toggleMenu: common.toggleMenu
    },
    contact: { lineContact: contact.lineContact },
    languageSwitcher: { en: languageSwitcher.en, ja: languageSwitcher.ja }
  }
}

export type HeaderText = ReturnType<typeof getHeaderText>
