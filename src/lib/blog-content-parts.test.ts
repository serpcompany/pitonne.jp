import { describe, expect, it } from 'vitest'
import { blogContentParts } from '@/lib/blog-content-parts'
import { getAllBlogPosts } from '@/lib/data/blog-posts'
import { locales } from '@/lib/i18n/config'

describe('blog content parts', () => {
  it('splits text around video embeds and keys each part by its kind and offset', () => {
    expect(blogContentParts('Intro {{video:first-clip}} middle {{video:second-clip}}')).toEqual([
      { kind: 'text', key: 'text-0', segment: 'Intro ' },
      { kind: 'video', key: 'video-6', segment: 'first-clip' },
      { kind: 'text', key: 'text-16', segment: ' middle ' },
      { kind: 'video', key: 'video-24', segment: 'second-clip' },
      { kind: 'text', key: 'text-35', segment: '' }
    ])
  })

  it('keeps the keys of adjacent embeds and the empty text between them apart', () => {
    expect(blogContentParts('{{video:a}}{{video:b}}').map(part => part.key)).toEqual([
      'text-0',
      'video-0',
      'text-1',
      'video-1',
      'text-2'
    ])
  })

  it('returns one text part for content without embeds', () => {
    expect(blogContentParts('Just prose.')).toEqual([
      { kind: 'text', key: 'text-0', segment: 'Just prose.' }
    ])
  })

  it.each(locales)('gives every part of every %s post a unique key', locale => {
    for (const post of getAllBlogPosts(locale)) {
      const keys = blogContentParts(post.content).map(part => part.key)
      expect(new Set(keys).size, post.slug).toBe(keys.length)
    }
  })
})
