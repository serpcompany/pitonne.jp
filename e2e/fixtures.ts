import { test as base, expect, type Locator, type Page } from 'playwright/test'
import { deployEnvironment, isIndexable, siteOrigin } from '../src/lib/deploy-environment.mts'
import en from '../src/lib/i18n/dictionaries/en.json'
import ja from '../src/lib/i18n/dictionaries/ja.json'

export { expect }

export const environment = deployEnvironment(process.env)
export const indexable = isIndexable(environment)
export const origin = siteOrigin(environment)
export const text = { en, ja }
type Locale = keyof typeof text

const stubs: Record<string, { contentType: string; body: string }> = {
  script: { contentType: 'text/javascript', body: '' },
  stylesheet: { contentType: 'text/css', body: '' },
  document: { contentType: 'text/html', body: '<!doctype html><title>Stub</title>' }
}

export const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page, baseURL }, use) => {
      const errors: string[] = []
      const own = new URL(baseURL ?? 'http://127.0.0.1').origin
      page.on('console', message => {
        if (message.type() === 'error')
          errors.push(`console error: ${message.text()} (${message.location().url})`)
      })
      page.on('pageerror', error => errors.push(`page error: ${error.message}`))
      await page.route(
        url => url.origin !== own,
        route => {
          const stub = stubs[route.request().resourceType()]
          return stub ? route.fulfill({ status: 200, ...stub }) : route.fulfill({ status: 204 })
        }
      )
      await use(errors)
      expect(errors, 'the page logs no console error and throws no error').toEqual([])
    },
    { auto: true }
  ]
})

export const header = (page: Page) => page.locator('header')

export async function openMenu(page: Page, locale: Locale, isMobile: boolean) {
  if (!isMobile) return
  await header(page).getByRole('button', { name: text[locale].common.toggleMenu }).click()
}

export async function goTo(page: Page, path: string) {
  const response = await page.goto(path)
  expect(response?.status(), `${path} answers 200`).toBe(200)
  return response
}

export const heading = (page: Page) => page.getByRole('heading', { level: 1 })

export async function follow(page: Page, link: Locator) {
  const href = await link.getAttribute('href')
  expect(href, 'the link has an address').toBeTruthy()
  await link.click()
  await expect(page).toHaveURL(new URL(href ?? '', page.url()).href)
  await expect(heading(page)).toBeVisible()
  return href
}
