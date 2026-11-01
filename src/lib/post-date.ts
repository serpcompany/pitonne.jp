import type { Locale } from '@/lib/i18n/config'

export function formatPostDate(
  publishedAt: string,
  locale: Locale,
  month: 'long' | 'short' = 'long'
): string {
  return new Date(publishedAt).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
    year: 'numeric',
    month,
    day: 'numeric',
    timeZone: 'UTC'
  })
}
