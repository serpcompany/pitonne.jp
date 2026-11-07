import { isValidElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import EnglishLayout, { generateMetadata as englishLayoutMetadata } from '@/app/(en)/layout'
import EnglishHomePage from '@/app/(en)/page'
import LocaleLayout, { generateMetadata as localeLayoutMetadata } from '@/app/[locale]/layout'
import LocaleHomePage from '@/app/[locale]/page'

type Params = Record<string, string>
type RouteModule = {
  default: (props: { params: Promise<Params> }) => ReactNode | Promise<ReactNode>
  generateMetadata: (props: { params: Promise<Params> }) => Promise<unknown>
  generateStaticParams?: () => Params[]
}
type RouteCase = [path: string, english: () => Promise<unknown>, locale: () => Promise<unknown>]

const routes: RouteCase[] = [
  ['/about/', () => import('@/app/(en)/about/page'), () => import('@/app/[locale]/about/page')],
  [
    '/areas-served/',
    () => import('@/app/(en)/areas-served/page'),
    () => import('@/app/[locale]/areas-served/page')
  ],
  [
    '/areas-served/[ward]/',
    () => import('@/app/(en)/areas-served/[ward]/page'),
    () => import('@/app/[locale]/areas-served/[ward]/page')
  ],
  [
    '/areas-served/[ward]/[area]/',
    () => import('@/app/(en)/areas-served/[ward]/[area]/page'),
    () => import('@/app/[locale]/areas-served/[ward]/[area]/page')
  ],
  ['/blog/', () => import('@/app/(en)/blog/page'), () => import('@/app/[locale]/blog/page')],
  [
    '/blog/[post]/',
    () => import('@/app/(en)/blog/[post]/page'),
    () => import('@/app/[locale]/blog/[post]/page')
  ],
  [
    '/blog/category/[category]/',
    () => import('@/app/(en)/blog/category/[category]/page'),
    () => import('@/app/[locale]/blog/category/[category]/page')
  ],
  [
    '/contact/',
    () => import('@/app/(en)/contact/page'),
    () => import('@/app/[locale]/contact/page')
  ],
  ['/faqs/', () => import('@/app/(en)/faqs/page'), () => import('@/app/[locale]/faqs/page')],
  ['/legal/', () => import('@/app/(en)/legal/page'), () => import('@/app/[locale]/legal/page')],
  [
    '/legal/disclaimer/',
    () => import('@/app/(en)/legal/disclaimer/page'),
    () => import('@/app/[locale]/legal/disclaimer/page')
  ],
  [
    '/legal/privacy-policy/',
    () => import('@/app/(en)/legal/privacy-policy/page'),
    () => import('@/app/[locale]/legal/privacy-policy/page')
  ],
  [
    '/legal/terms-conditions/',
    () => import('@/app/(en)/legal/terms-conditions/page'),
    () => import('@/app/[locale]/legal/terms-conditions/page')
  ],
  [
    '/services/',
    () => import('@/app/(en)/services/page'),
    () => import('@/app/[locale]/services/page')
  ],
  [
    '/services/[service]/',
    () => import('@/app/(en)/services/[service]/page'),
    () => import('@/app/[locale]/services/[service]/page')
  ],
  ['/videos/', () => import('@/app/(en)/videos/page'), () => import('@/app/[locale]/videos/page')],
  [
    '/watch/[video]/',
    () => import('@/app/(en)/watch/[video]/page'),
    () => import('@/app/[locale]/watch/[video]/page')
  ]
]

const isAsyncComponent = (type: unknown) =>
  typeof type === 'function' && type.constructor.name === 'AsyncFunction'

async function markup(node: ReactNode | Promise<ReactNode>): Promise<string> {
  const resolved = await node
  if (isValidElement(resolved) && isAsyncComponent(resolved.type)) {
    return markup((resolved.type as (props: unknown) => Promise<ReactNode>)(resolved.props))
  }
  return renderToStaticMarkup(resolved)
}

describe('English pages at the bare paths', () => {
  it.each(
    routes
  )('serve %s as the English page of the locale route, with its metadata', async (_path, englishModule, localeModule) => {
    const english = (await englishModule()) as RouteModule
    const locale = (await localeModule()) as RouteModule
    const params = english.generateStaticParams?.()[0] ?? {}
    const asEnglish = () => Promise.resolve({ ...params, locale: 'en' })
    const englishMarkup = await markup(english.default({ params: Promise.resolve(params) }))

    expect(englishMarkup).toMatch(/<h1[\s>]/)
    expect(englishMarkup).toBe(await markup(locale.default({ params: asEnglish() })))
    expect(await english.generateMetadata({ params: Promise.resolve(params) })).toEqual(
      await locale.generateMetadata({ params: asEnglish() })
    )
  })

  it('serve the home page as the English one', async () => {
    const englishMarkup = await markup(EnglishHomePage())

    expect(englishMarkup).toMatch(/<h1[\s>]/)
    expect(englishMarkup).toBe(
      await markup(LocaleHomePage({ params: Promise.resolve({ locale: 'en' }) }))
    )
  })

  it('wrap them in the English site layout, with its metadata', async () => {
    const english = { params: Promise.resolve({ locale: 'en' }) }
    const page = <p>A page</p>
    const englishMarkup = await markup(EnglishLayout({ children: page }))

    expect(englishMarkup).toContain('<html lang="en"')
    expect(englishMarkup).toBe(await markup(LocaleLayout({ ...english, children: page })))
    expect(await englishLayoutMetadata()).toEqual(await localeLayoutMetadata(english))
  })
})
