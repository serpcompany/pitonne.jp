import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function PostDateline({
  date,
  readingTime,
  locale
}: {
  date: string
  readingTime?: number
  locale: Locale
}) {
  return (
    <>
      <time>{date}</time>
      {readingTime && (
        <>
          <span>&middot;</span>
          <span>
            {readingTime} {getDictionary(locale).common.minRead}
          </span>
        </>
      )}
    </>
  )
}
