import { getAccessFallbackHTTPStatus } from 'next/dist/client/components/http-access-fallback/http-access-fallback'
import { describe, expect, it } from 'vitest'
import * as areaPage from '@/app/[locale]/areas-served/[ward]/[area]/page'
import * as wardPage from '@/app/[locale]/areas-served/[ward]/page'
import * as postPage from '@/app/[locale]/blog/[post]/page'
import * as categoryPage from '@/app/[locale]/blog/category/[category]/page'
import * as servicePage from '@/app/[locale]/services/[service]/page'
import * as watchPage from '@/app/[locale]/watch/[video]/page'
import { wards } from '@/lib/data/areas'
import { locales } from '@/lib/i18n/config'
import { type Dictionary, getDictionary } from '@/lib/i18n/dictionaries'

type Params = Record<string, string>
type DynamicPage = {
  default: (props: { params: Promise<never> }) => Promise<unknown>
  generateMetadata: (props: { params: Promise<never> }) => Promise<unknown>
}
type UnknownCase = [
  route: string,
  page: DynamicPage,
  params: Params,
  title: (common: Dictionary['common']) => string
]

const unknown = 'no-such-page'

const cases: UnknownCase[] = [
  ['ward', wardPage, { ward: unknown }, common => common.notFoundArea],
  ['area', areaPage, { ward: wards[0].slug, area: unknown }, common => common.notFoundArea],
  [
    'area in an unknown ward',
    areaPage,
    { ward: unknown, area: unknown },
    common => common.notFoundArea
  ],
  ['blog post', postPage, { post: unknown }, common => common.notFoundPost],
  ['blog category', categoryPage, { category: unknown }, common => common.notFoundCategory],
  ['service', servicePage, { service: unknown }, common => common.notFoundService],
  ['video', watchPage, { video: unknown }, common => common.notFoundVideo]
]

const withLocale = (locale: string, params: Params) => ({
  params: Promise.resolve({ ...params, locale }) as Promise<never>
})

async function statusOf(page: Promise<unknown>): Promise<number> {
  try {
    await page
  } catch (error) {
    return getAccessFallbackHTTPStatus(error as Parameters<typeof getAccessFallbackHTTPStatus>[0])
  }
  return 200
}

describe.each(locales)('a slug the site does not have (%s)', locale => {
  it.each(
    cases
  )('answers a %s page with a 404 and the not-found title', async (_route, page, params, title) => {
    expect(await statusOf(page.default(withLocale(locale, params)))).toBe(404)
    expect(await page.generateMetadata(withLocale(locale, params))).toEqual({
      title: title(getDictionary(locale).common)
    })
  })
})
