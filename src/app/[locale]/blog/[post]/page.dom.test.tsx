import fs from 'node:fs'
import path from 'node:path'
import { render } from '@testing-library/react'
import postcss from 'postcss'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { describe, expect, it } from 'vitest'
import BlogPostPage from '@/app/[locale]/blog/[post]/page'
import { getAllBlogPosts } from '@/lib/data/blog-posts'
import { locales } from '@/lib/i18n/config'
import { defined } from '@/test/defined'

const newestPosts = locales.flatMap(locale =>
  getAllBlogPosts(locale)
    .slice(0, 1)
    .map(post => [post.slug, locale, post] as const)
)

function normalized(text: string | null) {
  return (text ?? '').replace(/\s+/g, ' ').trim()
}

function markdownBlocks(markdown: string): string[] {
  const { container, unmount } = render(
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
  )
  const blocks = Array.from(container.querySelectorAll('h2, h3, h4, p, li'), block =>
    normalized(block.textContent)
  ).filter(text => text !== '' && !text.includes('{{video:'))
  unmount()
  return blocks
}

function styledSelectors(): string[] {
  const stylesheet = postcss.parse(
    fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8')
  )
  const selectors: string[] = []
  stylesheet.walkRules(rule => {
    if (rule.nodes.some(node => node.type === 'decl')) {
      selectors.push(...rule.selectors.map(selector => selector.replace(/\s+/g, ' ').trim()))
    }
  })
  return selectors
}

describe('blog post body', () => {
  it.each(
    newestPosts
  )('renders %s (%s) inside the blog prose styles', async (slug, locale, post) => {
    const expected = markdownBlocks(post.content)
    const { container } = render(
      await BlogPostPage({ params: Promise.resolve({ locale, post: slug }) })
    )
    const prose = container.querySelectorAll('.blog-prose')

    expect(prose).toHaveLength(1)
    expect(expected.length).toBeGreaterThan(0)
    const proseText = normalized(defined(prose[0]).textContent)
    expect(expected.filter(block => !proseText.includes(block))).toEqual([])
  })

  it('styles headings, paragraphs and lists inside the blog prose', () => {
    expect(styledSelectors()).toEqual(
      expect.arrayContaining([
        '.blog-prose h2',
        '.blog-prose p',
        '.blog-prose ul',
        '.blog-prose li'
      ])
    )
  })
})
