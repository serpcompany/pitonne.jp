import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BlogPostTemplate, type BlogPostViewModel } from '@/components/blog/blog-post-template'
import { pitonneVideos } from '@/lib/data/videos'
import type { Locale } from '@/lib/i18n/config'
import { defined } from '@/test/defined'

const [firstVideo, secondVideo] = pitonneVideos

function renderPost(
  content: string,
  locale: Locale = 'en',
  extra: Partial<BlogPostViewModel> = {}
) {
  const post: BlogPostViewModel = {
    slug: 'an-editor-written-post',
    title: 'An editor-written post',
    date: '2026-10-01',
    publishedAt: '2026-10-01',
    content,
    excerpt: 'A post an editor wrote in the CMS.',
    featureImageAlt: 'An editor-written post',
    category: 'IV Therapy',
    categorySlug: 'iv-therapy',
    author: { name: 'Pitonne Medical Team', role: 'Wellness Experts' },
    ...extra
  }
  return render(
    <BlogPostTemplate
      post={post}
      relatedPosts={[]}
      relatedServices={[]}
      latestPosts={[]}
      locale={locale}
    />
  )
}

describe('a blog post body an editor writes', () => {
  it('turns a top-level heading in the body into a second-level one, so the page keeps one h1', () => {
    renderPost('# A heading in the body\n\nSome text.')

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 2, name: 'A heading in the body' })).toBeVisible()
  })

  it('leaves a link with no address empty rather than pointing it at the home page', () => {
    renderPost('Read [this]() first.')

    expect(screen.getByText('this').closest('a')).toHaveAttribute('href', '')
  })

  it('drops a video marker that names no known video and embeds the known ones, last line included', () => {
    const { container } = renderPost(
      `Intro.\n\n{{video:no-such-video}}\n\n{{video:${firstVideo.slug}}}\n\nMiddle.\n\n{{video:${secondVideo.slug}}}`
    )

    expect(Array.from(container.querySelectorAll('iframe'), frame => frame.src)).toEqual([
      firstVideo.embedUrl,
      secondVideo.embedUrl
    ])
    expect(container.textContent).not.toContain('{{video:')
  })

  it.each([
    ['en', firstVideo.title],
    ['ja', defined(firstVideo.titleJa)]
  ] as const)('titles a video embed in the page’s language (%s)', (locale, title) => {
    renderPost(`{{video:${firstVideo.slug}}}`, locale)

    expect(screen.getByTitle(title)).toHaveAttribute('src', firstVideo.embedUrl)
  })

  it('titles a Japanese embed of a video with no Japanese title by its English one', () => {
    const { titleJa: _title, ...english } = firstVideo
    const englishOnly = { ...english, slug: 'a-video-with-no-japanese-title' }
    pitonneVideos.push(englishOnly)
    try {
      renderPost(`{{video:${englishOnly.slug}}}`, 'ja')

      expect(screen.getByTitle(englishOnly.title)).toHaveAttribute('src', englishOnly.embedUrl)
    } finally {
      pitonneVideos.pop()
    }
  })
})
