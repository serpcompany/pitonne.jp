import type { Metadata } from 'next'
import { type Locale, nonDefaultLocales } from '@/lib/i18n/config'
import { type Dictionary, getDictionary } from '@/lib/i18n/dictionaries'
import { localizedPageMetadata } from '@/lib/seo'

export type LocalePageProps = { params: Promise<{ locale: string }> }

export function localeStaticParams() {
  return nonDefaultLocales.map(locale => ({ locale }))
}

export function localeDictionary(params: { locale: string }) {
  const locale = params.locale as Locale
  return { locale, dict: getDictionary(locale) }
}

export function localizedMetadata(
  path: string,
  text: (dict: Dictionary) => { title: string; description: string }
) {
  return async ({ params }: LocalePageProps): Promise<Metadata> => {
    const { locale, dict } = localeDictionary(await params)
    return localizedPageMetadata({ ...text(dict), path, locale })
  }
}
