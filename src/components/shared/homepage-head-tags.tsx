import type { Locale } from '@/lib/i18n/config'
import { localizedHreflangAlternates } from '@/lib/seo'

export function HomepageHeadTags({ locale }: { locale: Locale }) {
  const { canonical, languages } = localizedHreflangAlternates('/', locale)

  return (
    <>
      <link rel="canonical" href={canonical} />
      <meta property="og:url" content={canonical} />
      {Object.entries(languages).map(([hrefLang, href]) => (
        <link key={hrefLang} rel="alternate" hrefLang={hrefLang} href={href} />
      ))}
    </>
  )
}
