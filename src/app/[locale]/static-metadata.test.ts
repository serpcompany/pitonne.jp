import type { Metadata } from 'next'
import { describe, expect, it } from 'vitest'
import { generateMetadata as areasServedMetadata } from '@/app/[locale]/areas-served/page'
import { generateMetadata as blogMetadata } from '@/app/[locale]/blog/page'
import { generateMetadata as disclaimerMetadata } from '@/app/[locale]/legal/disclaimer/page'
import { generateMetadata as legalMetadata } from '@/app/[locale]/legal/page'
import { generateMetadata as privacyPolicyMetadata } from '@/app/[locale]/legal/privacy-policy/page'
import { generateMetadata as termsMetadata } from '@/app/[locale]/legal/terms-conditions/page'
import { canonicalRoutes } from '@/lib/data/routes'
import { locales } from '@/lib/i18n/config'
import { type Dictionary, getDictionary } from '@/lib/i18n/dictionaries'
import { localizedCanonicalUrl } from '@/lib/seo'

type MetadataCase = [
  page: string,
  metadata: (props: { params: Promise<{ locale: string }> }) => Promise<Metadata>,
  path: string,
  text: (dict: Dictionary) => { title: string; description: string }
]

const pages: MetadataCase[] = [
  [
    'areas served',
    areasServedMetadata,
    canonicalRoutes.areasServed,
    ({ areas }) => ({ title: areas.metaTitle, description: areas.metaDescription })
  ],
  [
    'blog index',
    blogMetadata,
    canonicalRoutes.blog,
    ({ blog }) => ({ title: blog.metaTitle, description: blog.metaDescription })
  ],
  [
    'legal',
    legalMetadata,
    canonicalRoutes.legal,
    ({ legal }) => ({ title: legal.metaTitle, description: legal.metaDescription })
  ],
  [
    'privacy policy',
    privacyPolicyMetadata,
    canonicalRoutes.privacyPolicy,
    ({ legal }) => ({ title: legal.privacyPolicy, description: legal.privacyPolicyMeta })
  ],
  [
    'terms and conditions',
    termsMetadata,
    canonicalRoutes.termsConditions,
    ({ legal }) => ({ title: legal.termsMetaTitle, description: legal.termsMeta })
  ],
  [
    'medical disclaimer',
    disclaimerMetadata,
    canonicalRoutes.medicalDisclaimer,
    ({ legal }) => ({ title: legal.medicalDisclaimer, description: legal.disclaimerMeta })
  ]
]

describe.each(locales)('index and legal page metadata (%s)', locale => {
  it.each(
    pages
  )('titles and describes the %s page in its language, at its canonical URL', async (_page, metadata, path, text) => {
    const { title, description, alternates } = await metadata({
      params: Promise.resolve({ locale })
    })

    expect({ title, description }).toEqual(text(getDictionary(locale)))
    expect(alternates?.canonical).toBe(localizedCanonicalUrl(path, locale))
  })
})
