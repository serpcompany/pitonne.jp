import fs from 'node:fs'
import path from 'node:path'
import { render } from '@testing-library/react'
import { afterAll, describe, expect, it } from 'vitest'
import { removeContentFixture, withContent, writeContentFixture } from '@/test/content-fixture'

const contentRoot = writeContentFixture()
const japanesePosts = path.join(contentRoot, 'content', 'blog', 'ja')
for (const file of fs.readdirSync(japanesePosts)) fs.rmSync(path.join(japanesePosts, file))

afterAll(() => removeContentFixture(contentRoot))

describe('latest posts section', () => {
  it('leaves the section out of a language that has no published posts', async () => {
    const markup = await withContent(contentRoot, async () => {
      const { LatestPostsSection } = await import('@/components/shared/latest-posts-section')
      const { getDictionary } = await import('@/lib/i18n/dictionaries')
      const { container } = render(
        <>
          <LatestPostsSection locale="en" />
          <LatestPostsSection locale="ja" />
        </>
      )
      return {
        html: container.innerHTML,
        en: getDictionary('en').blog.readOurLatestPosts,
        ja: getDictionary('ja').blog.readOurLatestPosts
      }
    })

    expect(markup.html).toContain(markup.en)
    expect(markup.html).not.toContain(markup.ja)
  })
})
