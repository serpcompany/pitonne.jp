import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import type { Locale } from '@/lib/i18n/config'

export const englishLocale: Locale = 'en'
export const englishLocaleParams = Promise.resolve({ locale: englishLocale })

type Params = Record<string, string>
type LocalePageProps<T> = { params: Promise<T & { locale: string }> }
type LocalePage<T> = {
  default: (props: LocalePageProps<T>) => Promise<ReactNode>
  generateMetadata: (props: LocalePageProps<T>) => Promise<Metadata>
}

function withEnglishLocale<T extends Params>(params: Promise<T>) {
  return params.then(resolved => ({ locale: englishLocale, ...resolved }))
}

export function englishStaticRoute(localePage: LocalePage<object>) {
  const LocalePageComponent = localePage.default
  return {
    generateMetadata() {
      return localePage.generateMetadata({ params: englishLocaleParams })
    },
    Page() {
      return <LocalePageComponent params={englishLocaleParams} />
    }
  }
}

export function englishRoute<T extends Params>(localePage: LocalePage<T>) {
  const LocalePageComponent = localePage.default
  return {
    generateMetadata({ params }: { params: Promise<T> }) {
      return localePage.generateMetadata({ params: withEnglishLocale(params) })
    },
    Page({ params }: { params: Promise<T> }) {
      return <LocalePageComponent params={withEnglishLocale(params)} />
    }
  }
}
