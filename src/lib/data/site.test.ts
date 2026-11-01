import { describe, expect, it } from 'vitest'
import { businessHours, getBusinessInfo, isOpenBusinessHours } from '@/lib/data/site'
import { type Locale, locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { defined } from '@/test/defined'

const weekdays = businessHours.map(entry => entry.day)

function weekday(label: string, locale: Locale) {
  const days = getDictionary(locale).days
  return defined(weekdays.find(day => label.trim().startsWith(days[day])))
}

function daysIn(label: string, locale: Locale) {
  const [first, last = first] = label.split(' - ')
  return weekdays.slice(
    weekdays.indexOf(weekday(first, locale)),
    weekdays.indexOf(weekday(last, locale)) + 1
  )
}

function twentyFourHour(time: string) {
  const [, hours, minutes, period] = defined(
    time.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/)
  )
  const hour = period ? (Number(hours) % 12) + (period === 'PM' ? 12 : 0) : Number(hours)
  return `${String(hour).padStart(2, '0')}:${minutes}`
}

function shownHours(locale: Locale) {
  return Object.fromEntries(
    getBusinessInfo(locale).hours.flatMap(row => {
      const times = row.hours.split(' - ')
      const hours =
        times.length === 2
          ? { opens: twentyFourHour(times[0]), closes: twentyFourHour(times[1]) }
          : { closed: true }
      return daysIn(row.day, locale).map(day => [day, hours])
    })
  )
}

describe('business info', () => {
  it('uses the clinic phone, address and booking pages from the business sheet', () => {
    expect(getBusinessInfo('en')).toMatchObject({
      phone: '03-6821-8285',
      addressLine1: '106-0031 Tokyo, Minato City, Nishiazabu',
      addressLine2: '3 Chome−17−22 モダンフォルム西麻布 1階',
      bookingUrl: 'https://api.leadconnectorhq.com/booking/pitonne/bp/english'
    })
    expect(getBusinessInfo('ja')).toMatchObject({
      phone: '03-6821-8285',
      bookingUrl: 'https://api.leadconnectorhq.com/booking/pitonne/bp/japanese'
    })
  })

  it.each(locales)('shows the same opening hours as the structured data (%s)', locale => {
    expect(shownHours(locale)).toEqual(
      Object.fromEntries(
        businessHours.map(entry => [
          entry.day,
          isOpenBusinessHours(entry)
            ? { opens: entry.opens, closes: entry.closes }
            : { closed: true }
        ])
      )
    )
  })
})
