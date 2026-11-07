import fs from 'node:fs'
import path from 'node:path'
import { render, screen, within } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getDictionary } from '@/lib/i18n/dictionaries'
import {
  fixture,
  fixturePost,
  removeContentFixture,
  withContent,
  writeContentFixture
} from '@/test/content-fixture'

const newest = 'newest-imageless-fixture-post'
const params = <T extends object>(values: T) => ({
  params: Promise.resolve({ locale: 'en', ...values })
})
let root: string

beforeAll(() => {
  root = writeContentFixture()
  fs.writeFileSync(
    path.join(root, 'content', 'blog', `${newest}.md`),
    fixturePost('Newest imageless fixture', 'iv-therapy', false, '2099-01-01')
  )
})

afterAll(() => removeContentFixture(root))

function postLink(slug: string) {
  return within(
    screen
      .getAllByRole('link')
      .find(link => link.getAttribute('href')?.startsWith(`/blog/${slug}`)) as HTMLElement
  )
}

describe('a post an editor publishes with no feature image', () => {
  it('is featured on the blog index with a placeholder in place of the image', async () => {
    await withContent(root, async () => {
      const { default: BlogPage } = await import('@/app/[locale]/blog/page')
      render(await BlogPage(params({})))

      const featured = postLink(newest)
      expect(featured.getByText(getDictionary('en').blog.featured)).toBeVisible()
      expect(featured.getByText(getDictionary('en').blog.featuredArticle)).toBeVisible()
      expect(featured.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  it('is listed with no image on the blog index and on its category page', async () => {
    await withContent(root, async () => {
      const { default: BlogPage } = await import('@/app/[locale]/blog/page')
      const { default: CategoryPage } = await import('@/app/[locale]/blog/category/[category]/page')

      const index = render(await BlogPage(params({})))
      expect(postLink(fixture.englishOnly).getByRole('heading')).toBeVisible()
      expect(postLink(fixture.englishOnly).queryByRole('img')).not.toBeInTheDocument()
      index.unmount()

      render(await CategoryPage(params({ category: fixture.englishOnlyCategory })))
      expect(postLink(fixture.englishOnly).getByRole('heading')).toBeVisible()
      expect(postLink(fixture.englishOnly).queryByRole('img')).not.toBeInTheDocument()
    })
  })
})
