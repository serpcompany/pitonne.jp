import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import BlogPage from '@/app/[locale]/blog/page'
import { getAllBlogPosts } from '@/lib/data/blog-posts'
import { localizedRoute } from '@/lib/data/routes'
import { locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { defined } from '@/test/defined'

const dict = getDictionary('en')

describe('blog index page', () => {
  it.each(
    locales
  )('features the newest post, then lists the rest newest first (%s)', async locale => {
    const { container } = render(await BlogPage({ params: Promise.resolve({ locale }) }))
    const postPath = new RegExp(`^${localizedRoute('/blog/', locale)}(?!category/)[^/]+/?$`)
    const shown = Array.from(container.querySelectorAll('a'), link =>
      link.getAttribute('href')
    ).filter((href): href is string => href !== null && postPath.test(href))
    const posts = getAllBlogPosts(locale)

    expect([...new Set(shown)].map(href => href.replace(/\/?$/, '/'))).toEqual(
      posts.map(post => localizedRoute(`/blog/${post.slug}/`, locale))
    )
    const dates = posts.map(post => post.publishedAt)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it('does not render the standalone top image below the hero', async () => {
    render(await BlogPage({ params: Promise.resolve({ locale: 'en' }) }))

    expect(
      screen.queryByAltText('Pitonne wellness care and treatment insights in Tokyo')
    ).not.toBeInTheDocument()
  })

  it('renders supplied featured images with descriptive alt text and accessible active category contrast', async () => {
    render(await BlogPage({ params: Promise.resolve({ locale: 'en' }) }))

    const postsWithImages = getAllBlogPosts().filter(post => post.featureImage)
    expect(postsWithImages.length).toBeGreaterThan(0)
    for (const post of postsWithImages) {
      expect(post.featureImage).toMatch(/^\/images\/content\/blog\//)
      expect(post.featureImageAlt).toBeTruthy()
      expect(screen.getByRole('img', { name: post.featureImageAlt }).getAttribute('src')).toContain(
        encodeURIComponent(defined(post.featureImage))
      )
    }
    expect(screen.getByRole('link', { name: dict.blog.all })).toHaveClass('bg-[#7A8F87]')
  })
})
