import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from 'next/constants'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  EXCERPT_MAX_LENGTH,
  EXCERPT_MIN_LENGTH,
  META_DESCRIPTION_MAX_LENGTH,
  META_DESCRIPTION_MIN_LENGTH
} from '@/lib/blog-rules'
import config from '../../keystatic.config'
import nextConfig from '../../next.config.mjs'

type Field = { validate: (value: string) => unknown }
type Collection = { label: string; path: string; schema: Record<string, Field> }
type EditorState = {
  schema: { nodes: { heading: { spec: { parseDOM: { attrs: { level: number } }[] } } } }
}
type BodyField = {
  parse: (
    value: undefined,
    files: {
      content: Uint8Array
      other: Map<string, unknown>
      external: Map<string, unknown>
      slug: string
    }
  ) => EditorState
  serialize: (state: EditorState, options: { slug: string }) => { content: Uint8Array }
}

const collections = config.collections as unknown as Record<string, Collection>
const text = (length: number) => 'x'.repeat(length)
const packages = createRequire(import.meta.url)
const keystaticPackage = packages.resolve('@keystatic/core/package.json')
const keystaticBrowserBuild = pathToFileURL(
  path.join(
    path.dirname(keystaticPackage),
    packages('@keystatic/core/package.json').exports['.'].default
  )
).href

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
  vi.doUnmock('@keystatic/core')
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

  it('runs the Next.js server with its API routes only for the local CMS, under next dev with KEYSTATIC=1', () => {
    const staticSite = {
      output: 'export',
      allowedDevOrigins: undefined,
      pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
      skipTrailingSlashRedirect: false
    }
    const cases = [
      [PHASE_DEVELOPMENT_SERVER, '1'],
      [PHASE_DEVELOPMENT_SERVER, undefined],
      [PHASE_PRODUCTION_BUILD, '1'],
      [PHASE_PRODUCTION_BUILD, undefined]
    ] as const
    const configs = cases.map(([phase, keystatic]) => {
      vi.stubEnv('KEYSTATIC', keystatic)
      return nextConfig(phase)
    })

    expect(configs[0]).toMatchObject({
      output: undefined,
      allowedDevOrigins: ['127.0.0.1'],
      pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'keystatic.tsx', 'keystatic.ts'],
      skipTrailingSlashRedirect: true,
      trailingSlash: true
    })
    for (const config of configs.slice(1)) {
      expect(config).toMatchObject({ ...staticSite, trailingSlash: true })
    }
  })

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

  it('offers headings of levels 2 to 4 only in a post’s body, and turns a heading of another level, pasted or loaded, into the nearest of those', async () => {
    vi.doMock('@keystatic/core', () => import(keystaticBrowserBuild))
    vi.resetModules()
    const editor = (await import('../../keystatic.config')).default
      .collections as unknown as Record<string, { schema: { content: BodyField } }>
    const slug = 'a-post'
    const content = new TextEncoder().encode('# One\n\n### Three\n\n###### Six\n')

    for (const blog of [editor.blog, editor.blogJa]) {
      const body = blog.schema.content
      const state = body.parse(undefined, { content, other: new Map(), external: new Map(), slug })
      const saved = new TextDecoder().decode(body.serialize(state, { slug }).content)

      expect(state.schema.nodes.heading.spec.parseDOM.map(rule => rule.attrs.level)).toEqual([
        2, 3, 4
      ])
      expect(saved.match(/^#+ .*/gm)).toEqual(['## One', '### Three', '#### Six'])
    }
  }, 120_000)
})
