import type { Page } from 'playwright/test'
import { getBusinessInfo } from '../src/lib/data/site'
import { expect, follow, goTo, heading, test, text } from './fixtures'

const main = (page: Page) => page.locator('main')
const postLink = 'a[href^="/blog/"]:not([href="/blog/"]):not([href^="/blog/category/"])'

test('a service page opens from the services index and leads back to it', async ({ page }) => {
  await goTo(page, '/services/')
  await follow(page, main(page).locator('a[href^="/services/"]:not([href="/services/"])').first())
  await follow(page, main(page).locator('a[href="/services/"]').first())
})

test('a blog post opens from the blog index, and a category lists posts that open', async ({
  page
}) => {
  await goTo(page, '/blog/')
  await follow(page, main(page).locator(postLink).first())
  await expect(main(page).locator('article').first()).toBeVisible()
  await goTo(page, '/blog/')
  await follow(page, main(page).locator('a[href^="/blog/category/"]').first())
  await follow(page, main(page).locator(postLink).first())
})

test('an area page opens from its ward, which opens from the areas index', async ({ page }) => {
  await goTo(page, '/areas-served/')
  const ward = await follow(
    page,
    main(page).locator('a[href^="/areas-served/"]:not([href="/areas-served/"])').first()
  )
  await follow(page, main(page).locator(`a[href^="${ward}"]:not([href="${ward}"])`).first())
})

test('the contact page offers the clinic’s phone and opens and closes the message form', async ({
  page
}) => {
  await goTo(page, '/contact/')
  const { phone } = getBusinessInfo('en')
  await expect(main(page).locator(`a[href="tel:${phone}"]`).first()).toBeVisible()
  await main(page).getByRole('button', { name: text.en.common.sendMessage }).click()
  const form = page.getByRole('dialog')
  await expect(form.locator(`iframe[title="${text.en.contact.formTitle}"]`)).toBeVisible()
  await form.getByRole('button', { name: text.en.contact.closeForm }).click()
  await expect(form).toBeHidden()
  await goTo(page, '/ja/contact/')
  await expect(heading(page)).toBeVisible()
  await expect(main(page).getByRole('button', { name: text.ja.common.sendMessage })).toHaveCount(0)
})
