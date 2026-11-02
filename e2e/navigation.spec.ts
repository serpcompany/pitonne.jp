import type { Page } from 'playwright/test'
import { canonicalRoutes } from '../src/lib/data/routes'
import { expect, follow, goTo, header, openMenu, test, text } from './fixtures'

const nav = text.en.nav
const primary = [
  [nav.about, canonicalRoutes.about],
  [nav.services, canonicalRoutes.services],
  [nav.areasServed, canonicalRoutes.areasServed],
  [nav.blog, canonicalRoutes.blog],
  [nav.videos, canonicalRoutes.videos],
  [nav.home, canonicalRoutes.home]
] as const
const fullHeaderFrom = 1280

async function expectHeaderAt(page: Page, width: number) {
  const bar = header(page).locator('nav')
  const full = [
    ...primary.map(([name]) => bar.getByRole('link', { name, exact: true })),
    bar.getByRole('link', { name: text.en.languageSwitcher.ja, exact: true }),
    bar.getByRole('button', { name: nav.phone, exact: true }),
    bar.getByRole('link', { name: text.en.common.contactUs, exact: true })
  ]
  const menu = [bar.getByRole('button', { name: text.en.common.toggleMenu, exact: true })]
  const [shown, hidden] = width >= fullHeaderFrom ? [full, menu] : [menu, full]
  await expect(bar.getByRole('link', { name: text.en.common.logoAlt, exact: true })).toBeVisible()
  for (const part of shown) await expect(part, `shown at ${width} pixels`).toBeVisible()
  for (const part of hidden) await expect(part, `hidden at ${width} pixels`).toBeHidden()
}

test('the header shows its section links from 1280 pixels wide, and the logo and a menu button below', async ({
  page,
  isMobile
}) => {
  await goTo(page, '/')
  await expectHeaderAt(page, page.viewportSize()?.width ?? 0)
  for (const width of isMobile ? [] : [fullHeaderFrom, fullHeaderFrom - 1]) {
    await page.setViewportSize({ width, height: 900 })
    await expectHeaderAt(page, width)
  }
})

test('the header stays pinned to the top of the window as the page scrolls', async ({ page }) => {
  await goTo(page, '/')
  const bar = header(page)
  const height = (await bar.boundingBox())?.height ?? 0
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(height)
  await expect(bar).toBeInViewport()
  await expect.poll(async () => (await bar.boundingBox())?.y).toBe(0)
})

test('the header links each section, one page after another, without reloading', async ({
  page,
  isMobile
}) => {
  test.skip(isMobile, 'The phone menu has its own journey')
  await goTo(page, '/')
  const marker = await page.evaluate(() => {
    const id = String(Math.random())
    Object.assign(window, { journey: id })
    return id
  })
  for (const [name, path] of primary) {
    const link = page.locator('header nav').getByRole('link', { name, exact: true })
    await expect(link).toHaveAttribute('href', path)
    await follow(page, link)
  }
  expect(await page.evaluate(() => (window as { journey?: string }).journey)).toBe(marker)
})

test('the phone menu opens each section, its sections expanding to their pages', async ({
  page,
  isMobile
}) => {
  test.skip(!isMobile, 'The desktop header shows its links without a menu')
  await goTo(page, '/')
  for (const [name, path] of [
    [nav.blog, canonicalRoutes.blog],
    [nav.videos, canonicalRoutes.videos]
  ]) {
    await openMenu(page, 'en', isMobile)
    const link = header(page).getByRole('link', { name, exact: true })
    await expect(link).toHaveAttribute('href', path)
    await follow(page, link)
  }
  for (const [section, prefix] of [
    [nav.about, canonicalRoutes.about],
    [nav.services, canonicalRoutes.services],
    [nav.areasServed, canonicalRoutes.areasServed]
  ]) {
    await openMenu(page, 'en', isMobile)
    await header(page).getByRole('button', { name: section, exact: true }).click()
    await follow(page, header(page).locator(`a[href^="${prefix}"]:visible`).first())
    expect(new URL(page.url()).pathname.startsWith(prefix)).toBe(true)
  }
})
