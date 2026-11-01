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
