import { LegalMarkdownPage } from '@/components/legal/legal-markdown-page'
import { getLegalPage, type LegalPageKey } from '@/lib/data/pages'
import { canonicalRoutes } from '@/lib/data/routes'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import {
  type LocalePageProps,
  localeDictionary,
  localeStaticParams,
  localizedMetadata
} from '../locale-page'

type LegalDocument = {
  path: string
  metadata: (legal: Dictionary['legal']) => { title: string; description: string }
  heading: (legal: Dictionary['legal']) => string
  intro?: (legal: Dictionary['legal']) => string
}

const legalDocuments: Record<LegalPageKey, LegalDocument> = {
  privacyPolicy: {
    path: canonicalRoutes.privacyPolicy,
    metadata: legal => ({ title: legal.privacyPolicy, description: legal.privacyPolicyMeta }),
    heading: legal => legal.privacyPolicy
  },
  termsConditions: {
    path: canonicalRoutes.termsConditions,
    metadata: legal => ({ title: legal.termsMetaTitle, description: legal.termsMeta }),
    heading: legal => legal.termsOfUse
  },
  medicalDisclaimer: {
    path: canonicalRoutes.medicalDisclaimer,
    metadata: legal => ({ title: legal.medicalDisclaimer, description: legal.disclaimerMeta }),
    heading: legal => legal.medicalDisclaimer,
    intro: legal => legal.disclaimerDescription
  }
}

export function legalDocumentRoute(key: LegalPageKey) {
  const document = legalDocuments[key]
  return {
    generateStaticParams: localeStaticParams,
    generateMetadata: localizedMetadata(document.path, dict => document.metadata(dict.legal)),
    async Page({ params }: LocalePageProps) {
      const { locale, dict } = localeDictionary(await params)
      return (
        <LegalMarkdownPage
          page={getLegalPage(key, locale)}
          canonicalTitle={document.heading(dict.legal)}
          description={document.intro?.(dict.legal)}
          locale={locale}
        />
      )
    }
  }
}
