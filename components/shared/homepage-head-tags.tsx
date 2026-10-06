import { localizedHreflangAlternates } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"

// The homepage's canonical, og:url and hreflang tags. With trailingSlash on, Next's metadata API rewrites
// https://pitonne.jp to https://pitonne.jp/, so the homepage renders these itself and React hoists them into <head>.
export function HomepageHeadTags({ locale }: { locale: Locale }) {
  const { canonical, languages } = localizedHreflangAlternates("/", locale)

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
