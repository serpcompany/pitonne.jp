import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  EXCERPT_MAX_LENGTH,
  EXCERPT_MIN_LENGTH,
  META_DESCRIPTION_MAX_LENGTH,
  META_DESCRIPTION_MIN_LENGTH
} from '@/lib/blog-rules'
import config from '../../keystatic.config'

type Field = { validate: (value: string) => unknown }
type Collection = { label: string; path: string; schema: Record<string, Field> }

const collections = config.collections as unknown as Record<string, Collection>
const text = (length: number) => 'x'.repeat(length)

function accepts(field: Field, lengths: number[]) {
  return lengths.map(length => {
    try {
      field.validate(text(length))
      return true
    } catch {
      return false
    }
  })
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('the CMS', () => {
  it('signs editors in through Keystatic Cloud, to edit the blog in two languages and its categories', () => {
    expect(config.storage).toEqual({ kind: 'cloud' })
    expect(config.cloud).toEqual({ project: 'serp/pitonne-website' })
    expect(
      Object.values(collections).map(collection => [collection.label, collection.path])
    ).toEqual([
      ['Blog (English)', 'content/blog/*'],
      ['Blog (Japanese)', 'content/blog/ja/*'],
      ['Blog categories', 'content/blog-categories/*']
    ])
  })

  it('edits local files only when started for that', async () => {
    vi.stubEnv('NEXT_PUBLIC_KEYSTATIC_STORAGE', 'local')
    vi.resetModules()

    expect((await import('../../keystatic.config')).default.storage).toEqual({ kind: 'local' })
  }, 120_000)

  it('refuses an excerpt, meta description or category description outside the build’s limits', () => {
    const excerpt = [EXCERPT_MIN_LENGTH - 1, EXCERPT_MIN_LENGTH, EXCERPT_MAX_LENGTH]
    const description = [
      META_DESCRIPTION_MIN_LENGTH - 1,
      META_DESCRIPTION_MIN_LENGTH,
      META_DESCRIPTION_MAX_LENGTH,
      META_DESCRIPTION_MAX_LENGTH + 1
    ]

    for (const blog of [collections.blog, collections.blogJa]) {
      expect(accepts(blog.schema.excerpt, [...excerpt, EXCERPT_MAX_LENGTH + 1])).toEqual([
        false,
        true,
        true,
        false
      ])
      expect(accepts(blog.schema.metaDescription, [0, ...description.slice(0, 2)])).toEqual([
        true,
        false,
        true
      ])
    }
    for (const field of ['description', 'descriptionJa']) {
      expect(accepts(collections.blogCategories.schema[field], description)).toEqual([
        false,
        true,
        true,
        false
      ])
    }
  })
})
