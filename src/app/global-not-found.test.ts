import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import GlobalNotFound, { generateMetadata } from '@/app/global-not-found'
import RootLayout from '@/app/layout'
import { getDictionary } from '@/lib/i18n/dictionaries'

vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: 'font-inter' }),
  Playfair_Display: () => ({ variable: 'font-playfair' })
}))

vi.mock('next/navigation', async original => ({
  ...(await original<typeof import('next/navigation')>()),
  usePathname: () => '/no-such-page/'
}))

const dict = getDictionary('en')

describe('global not-found page', () => {
  it('takes its title from the dictionary and leaves the single noindex tag to Next.js', async () => {
    const metadata = await generateMetadata()

    expect(metadata.title).toBe(getDictionary('en').notFound.metaTitle)
    expect(metadata.icons).toBeDefined()
    expect(metadata).not.toHaveProperty('robots')
  })

  it('shows the English 404 page in the site layout, switching language to the Japanese home page', async () => {
    const layout = GlobalNotFound() as ReactElement<
      object,
      (props: object) => Promise<ReactElement>
    >
    const markup = renderToStaticMarkup(await layout.type(layout.props))

    expect(markup).toMatch(/^<html lang="en"/)
    expect(markup).toContain(dict.notFound.heading)
    expect(markup).toMatch(new RegExp(`<a [^>]*href="/ja/?"[^>]*>${dict.languageSwitcher.ja}</a>`))
    expect(markup).not.toContain('/ja/no-such-page')
  })
})

describe('root layout', () => {
  it('passes each page through untouched, leaving the document to the locale layouts', () => {
    const page = { type: 'p', props: {}, key: null } as unknown as ReactElement

    expect(RootLayout({ children: page })).toBe(page)
  })
})
