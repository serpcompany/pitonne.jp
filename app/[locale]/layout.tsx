import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { GoogleTagManager } from "@next/third-parties/google"
import { Analytics } from "@vercel/analytics/next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { JsonLd } from "@/components/shared/json-ld"
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  GTM_CONTAINER_ID,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  canonicalUrl,
  deploymentRobots,
  isProductionDeployment,
  localizedHreflangAlternates,
} from "@/lib/seo"
import { businessJsonLd, websiteJsonLd } from "@/lib/structured-data"
import { getServiceCategorySections } from "@/lib/data/services"
import { locales, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { localizedRoute } from "@/lib/data/routes"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const dict = getDictionary(locale as Locale)

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: locale === "ja"
        ? "Pitonne | 東京の幹細胞・点滴療法"
        : DEFAULT_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description: locale === "ja"
      ? dict.home.heroDescription
      : DEFAULT_DESCRIPTION,
    alternates: localizedHreflangAlternates("/", locale as Locale),
    openGraph: {
      title: locale === "ja"
        ? "Pitonne | 東京の幹細胞・点滴療法"
        : DEFAULT_TITLE,
      description: locale === "ja"
        ? dict.home.heroDescription
        : DEFAULT_DESCRIPTION,
      url: canonicalUrl(locale === "ja" ? "/ja/" : "/"),
      siteName: SITE_NAME,
      images: [
        {
          url: absoluteUrl(DEFAULT_OG_IMAGE),
          width: 1200,
          height: 630,
          alt: locale === "ja"
            ? "Pitonne 東京の幹細胞・点滴療法"
            : "Pitonne Stem Cell & IV Therapy in Tokyo",
        },
      ],
      locale: locale === "ja" ? "ja_JP" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: locale === "ja"
        ? "Pitonne | 東京の幹細胞・点滴療法"
        : DEFAULT_TITLE,
      description: locale === "ja"
        ? dict.home.heroDescription
        : DEFAULT_DESCRIPTION,
      images: [absoluteUrl(DEFAULT_OG_IMAGE)],
    },
    robots: deploymentRobots(),
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
        { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: "/apple-icon.png",
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const typedLocale = locale as Locale
  const showProductionTags = isProductionDeployment()
  const dict = getDictionary(typedLocale)

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-background">
        {showProductionTags && <GoogleTagManager gtmId={GTM_CONTAINER_ID} />}
        {showProductionTags && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        )}
        <JsonLd data={businessJsonLd(typedLocale)} />
        <JsonLd data={websiteJsonLd(typedLocale)} />
        <Header
          locale={typedLocale}
          dict={dict}
          serviceNavigation={getServiceCategorySections(typedLocale).map((section) => ({
            name: section.title,
            href: section.href,
            items: section.services.map((service) => ({
              name: service.name,
              href: localizedRoute(service.canonicalPath, typedLocale),
            })),
          }))}
        />
        <main className="min-h-screen">{children}</main>
        <Footer locale={typedLocale} dict={dict} />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
