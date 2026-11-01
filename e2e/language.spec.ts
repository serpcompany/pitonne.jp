import { expect, goTo, header, heading, openMenu, test, text } from './fixtures'

test('the home page loads in English and in Japanese, each in its own language', async ({
  page
}) => {
  await goTo(page, '/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(heading(page)).toBeVisible()
  await goTo(page, '/ja/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja')
  await expect(heading(page)).toBeVisible()
})

test('the language switch leads to the same page in the other language and back', async ({
  page,
  isMobile
}) => {
  await goTo(page, '/services/')
  await openMenu(page, 'en', isMobile)
  await header(page).getByRole('link', { name: text.en.languageSwitcher.ja, exact: true }).click()
  await expect(page).toHaveURL('/ja/services/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja')
  await expect(heading(page)).toBeVisible()
  await openMenu(page, 'ja', isMobile)
  await header(page).getByRole('link', { name: text.ja.languageSwitcher.en, exact: true }).click()
  await expect(page).toHaveURL('/services/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})
