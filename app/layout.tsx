import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { GoogleTagManager } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { JsonLd } from '@/components/shared/json-ld'
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
} from '@/lib/seo'
import { businessJsonLd, websiteJsonLd } from '@/lib/structured-data'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair'
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  generator: 'v0.app',
  alternates: {
    canonical: canonicalUrl("/"),
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: canonicalUrl("/"),
    siteName: SITE_NAME,
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE),
        width: 1200,
        height: 630,
        alt: "Pitonne Stem Cell & IV Therapy in Tokyo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
  robots: deploymentRobots(),
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const showProductionTags = isProductionDeployment()

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
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
        <JsonLd data={businessJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
