import type {
  BlogPosting,
  BreadcrumbList,
  ItemList,
  MedicalBusiness,
  Service as ServiceSchema,
  VideoObject,
  WebSite,
  WithContext
} from 'schema-dts'
import type { BlogPost } from '@/lib/data/blog-posts'
import type { Service } from '@/lib/data/services'
import { businessHours, getBusinessInfo, isOpenBusinessHours } from '@/lib/data/site'
import type { PitonneVideo } from '@/lib/data/videos'
import { siteOrigin } from '@/lib/deploy-environment.mts'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { absoluteUrl, localizedCanonicalUrl, SITE_NAME } from '@/lib/seo'

const businessId = () => `${siteOrigin()}/#business`
const websiteId = () => `${siteOrigin()}/#website`

const businessArea: Record<Locale, { locality: string; region: string }> = {
  en: { locality: 'Minato City', region: 'Tokyo' },
  ja: { locality: '港区', region: '東京都' }
}

export function businessJsonLd(locale: Locale = 'en'): WithContext<MedicalBusiness> {
  const info = getBusinessInfo(locale)
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': businessId(),
    name: info.name,
    url: localizedCanonicalUrl('/', locale),
    telephone: info.phone,
    description: info.description,
    knowsLanguage: [
      { '@type': 'Language', name: 'English', alternateName: 'en' },
      {
        '@type': 'Language',
        name: locale === 'ja' ? getDictionary('ja').languageSwitcher.ja : 'Japanese',
        alternateName: 'ja'
      }
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${info.addressLine1}, ${info.addressLine2}`,
      addressLocality: businessArea[locale].locality,
      addressRegion: businessArea[locale].region,
      postalCode: '106-0031',
      addressCountry: 'JP'
    },
    openingHoursSpecification: businessHours.filter(isOpenBusinessHours).map(item => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: item.day,
      opens: item.opens,
      closes: item.closes
    }))
  }
}

export function websiteJsonLd(locale: Locale = 'en'): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId(),
    name: SITE_NAME,
    url: localizedCanonicalUrl('/', locale),
    publisher: { '@id': businessId() },
    inLanguage: locale === 'ja' ? 'ja' : 'en'
  }
}

export function serviceJsonLd(service: Service, locale: Locale = 'en'): WithContext<ServiceSchema> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${localizedCanonicalUrl(service.canonicalPath, locale)}#service`,
    name: service.name,
    description: service.shortDescription,
    url: localizedCanonicalUrl(service.canonicalPath, locale),
    image: service.image ? absoluteUrl(service.image) : undefined,
    provider: { '@id': businessId() },
    areaServed: {
      '@type': 'City',
      name: 'Tokyo'
    },
    serviceType: service.category
  }
}

export function blogPostingJsonLd(
  post: Pick<BlogPost, 'slug' | 'title' | 'excerpt' | 'publishedAt' | 'author' | 'featureImage'>,
  locale: Locale,
  publishedLocales: readonly Locale[]
): WithContext<BlogPosting> {
  const otherLocale: Locale = locale === 'ja' ? 'en' : 'ja'
  const hasTranslation = publishedLocales.includes(otherLocale)
  const translation = {
    '@type': 'BlogPosting',
    '@id': `${localizedCanonicalUrl(`/blog/${post.slug}/`, otherLocale)}#blog-posting`
  } as const

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${localizedCanonicalUrl(`/blog/${post.slug}/`, locale)}#blog-posting`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    image: post.featureImage ? absoluteUrl(post.featureImage) : undefined,
    inLanguage: locale === 'ja' ? 'ja' : 'en',
    ...(hasTranslation && locale === 'ja' ? { translationOfWork: translation } : {}),
    ...(hasTranslation && locale === 'en' ? { workTranslation: translation } : {}),
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role
    },
    publisher: { '@id': businessId() },
    mainEntityOfPage: localizedCanonicalUrl(`/blog/${post.slug}/`, locale)
  }
}

export function videoObjectJsonLd(
  video: PitonneVideo,
  locale: Locale = 'en'
): WithContext<VideoObject> {
  const watchUrl = localizedCanonicalUrl(video.watchPath, locale)
  const ja = locale === 'ja'

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${watchUrl}#video`,
    name: ja ? (video.titleJa ?? video.title) : video.title,
    description: ja
      ? (video.descriptionJa ?? video.metaDescriptionJa ?? video.description)
      : video.description,
    thumbnailUrl: [absoluteUrl(video.thumbnailUrl)],
    uploadDate: video.uploadDate,
    duration: video.duration,
    embedUrl: absoluteUrl(video.embedUrl),
    url: watchUrl,
    mainEntityOfPage: watchUrl,
    publisher: { '@id': businessId() },
    potentialAction: {
      '@type': 'WatchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: watchUrl
      }
    }
  }
}

export function videoListJsonLd(
  videos: PitonneVideo[],
  locale: Locale = 'en'
): WithContext<ItemList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: getDictionary(locale).videos.pitonneVideos,
    itemListElement: videos.map((video, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: localizedCanonicalUrl(video.watchPath, locale),
      item: videoObjectJsonLd(video, locale)
    }))
  }
}

export function videoBreadcrumbJsonLd(
  video: PitonneVideo,
  locale: Locale = 'en'
): WithContext<BreadcrumbList> {
  const dict = getDictionary(locale)
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: dict.nav.home,
        item: localizedCanonicalUrl('/', locale)
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: dict.nav.videos,
        item: localizedCanonicalUrl('/videos/', locale)
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: locale === 'ja' && video.titleJa ? video.titleJa : video.title,
        item: localizedCanonicalUrl(video.watchPath, locale)
      }
    ]
  }
}
