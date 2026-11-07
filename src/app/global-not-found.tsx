import './globals.css'
import type { Metadata } from 'next'
import { englishLocale, englishLocaleParams } from '@/app/(en)/route-helpers'
import LocaleLayout, { generateMetadata as localeLayoutMetadata } from '@/app/[locale]/layout'
import { NotFoundPage } from '@/components/not-found-page'
import { canonicalRoutes } from '@/lib/data/routes'
import { getDictionary } from '@/lib/i18n/dictionaries'

export async function generateMetadata(): Promise<Metadata> {
  const { icons } = await localeLayoutMetadata({ params: englishLocaleParams })
  return { title: getDictionary(englishLocale).notFound.metaTitle, icons }
}

export default function GlobalNotFound() {
  return (
    <LocaleLayout params={englishLocaleParams} languageSwitcherPath={canonicalRoutes.home}>
      <NotFoundPage locale={englishLocale} />
    </LocaleLayout>
  )
}
