import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import matter from 'gray-matter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { main } from './fetch-google-docs.mjs'
import { BLOG_DRAFT_SOURCES, buildGoogleDocExportUrl } from './google-docs-blog-drafts.mjs'

let root
let drafts
let log
let errors

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'fetch-google-docs-'))
  drafts = path.join(root, 'tmp', 'blog-drafts')
  vi.spyOn(process, 'cwd').mockReturnValue(root)
  log = vi.spyOn(console, 'log').mockImplementation(() => {})
  errors = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  process.exitCode = undefined
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  fs.rmSync(root, { recursive: true, force: true })
})

function googleDocs(answer) {
  const requests = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, init) => {
      requests.push({ url: String(url), init })
      const source = BLOG_DRAFT_SOURCES.find(
        candidate => String(buildGoogleDocExportUrl(candidate)) === String(url)
      )
      return answer(source)
    })
  )
  return requests
}

const exported = source =>
  new Response(`# Tab 1\n\n# About ${source.topic}\n\nBody for ${source.topic}.`)

describe('pnpm drafts:fetch', () => {
  it('writes one markdown draft per configured Google Docs tab and lists them', async () => {
    const requests = googleDocs(exported)

    await main()

    expect(requests.map(request => request.url)).toEqual(
      BLOG_DRAFT_SOURCES.map(source => String(buildGoogleDocExportUrl(source)))
    )
    expect(requests.every(request => request.init.redirect === 'follow')).toBe(true)
    expect(fs.readdirSync(drafts).sort()).toEqual(
      BLOG_DRAFT_SOURCES.map(source => `${source.slug}.md`).sort()
    )
    for (const source of BLOG_DRAFT_SOURCES) {
      const draft = matter(fs.readFileSync(path.join(drafts, `${source.slug}.md`), 'utf8'))
      expect(draft.data).toMatchObject({ slug: source.slug, title: `About ${source.topic}` })
      expect(draft.content.trim()).toBe(`# About ${source.topic}\n\nBody for ${source.topic}.`)
    }
    expect(log.mock.calls.map(call => call[0])).toEqual([
      `Generated ${BLOG_DRAFT_SOURCES.length} blog drafts:`,
      ...BLOG_DRAFT_SOURCES.map(source => `  - ${source.slug}.md (${source.topic})`)
    ])
    expect(process.exitCode).toBeUndefined()
  })

  it('replaces the markdown drafts of an earlier run and leaves other files alone', async () => {
    fs.mkdirSync(path.join(drafts, 'notes.md'), { recursive: true })
    fs.writeFileSync(path.join(drafts, 'stale-draft.md'), 'old')
    fs.writeFileSync(path.join(drafts, 'review.txt'), 'keep')
    googleDocs(exported)

    await main()

    expect(fs.existsSync(path.join(drafts, 'stale-draft.md'))).toBe(false)
    expect(fs.readFileSync(path.join(drafts, 'review.txt'), 'utf8')).toBe('keep')
    expect(fs.statSync(path.join(drafts, 'notes.md')).isDirectory()).toBe(true)
    expect(fs.readdirSync(drafts).sort()).toEqual(
      [...BLOG_DRAFT_SOURCES.map(source => `${source.slug}.md`), 'notes.md', 'review.txt'].sort()
    )
    expect(errors).not.toHaveBeenCalled()
    expect(process.exitCode).toBeUndefined()
  })

  it('fails with exit code 1, naming the doc and tab, when Google Docs refuses an export', async () => {
    const refused = BLOG_DRAFT_SOURCES[1]
    googleDocs(source =>
      source === refused ? new Response('denied', { status: 403 }) : exported(source)
    )

    await main()

    expect(process.exitCode).toBe(1)
    expect(errors.mock.calls[0][0]).toEqual(
      new Error(`Failed to fetch ${refused.docId} (${refused.tabId}): 403`)
    )
    expect(errors.mock.calls[1][0]).toBe(`Configured sources: ${BLOG_DRAFT_SOURCES.length}`)
    expect(log).not.toHaveBeenCalled()
  })
})
