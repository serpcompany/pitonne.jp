import fs from 'node:fs'
import matter from 'gray-matter'
import { afterEach, describe, expect, it, vi } from 'vitest'

type TreeEntry = { path: string; type: string; sha: string }

const api = 'http://127.0.0.1:3000/api/keystatic'
const sameSite = { headers: { 'no-cors': '1' } }

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

async function localCms() {
  vi.stubEnv('NEXT_PUBLIC_KEYSTATIC_STORAGE', 'local')
  const { GET } = await import('@/app/api/keystatic/[...params]/route.keystatic')
  const tree = (await (await GET(new Request(`${api}/tree`, sameSite))).json()) as TreeEntry[]
  const blob = (entry: TreeEntry) =>
    GET(new Request(`${api}/blob/${entry.sha}/${entry.path}`, sameSite))
  return { tree, blob }
}

describe('the CMS API at /api/keystatic', () => {
  it.each([
    ['an English post', /^content\/blog\/[^/]+\.md$/],
    ['a Japanese post', /^content\/blog\/ja\/[^/]+\.md$/],
    ['a blog category', /^content\/blog-categories\/[^/]+\.json$/]
  ])(
    'serves the local CMS %s from the content files',
    async (_kind, file) => {
      const { tree, blob } = await localCms()
      const entry = tree.find(candidate => file.test(candidate.path)) as TreeEntry
      const response = await blob(entry)

      expect(response.status).toBe(200)
      expect(Buffer.from(await response.arrayBuffer())).toEqual(fs.readFileSync(entry.path))
    },
    60_000
  )

  const titleInMarkdown = (file: string) => String(matter(fs.readFileSync(file, 'utf8')).data.title)
  const nameInJson = (file: string) => String(JSON.parse(fs.readFileSync(file, 'utf8')).name)

  it.each([
    ['blog', 'title', 'content/blog', '.md', titleInMarkdown],
    ['blogJa', 'title', 'content/blog/ja', '.md', titleInMarkdown],
    ['blogCategories', 'name', 'content/blog-categories', '.json', nameInJson]
  ] as const)(
    'lists in the %s collection, by its %s, every file of %s and nothing else',
    async (collection, field, folder, extension, titleOnDisk) => {
      const { createReader } = await import('@keystatic/core/reader')
      const { default: config } = await import('../../../../../keystatic.config')
      const onDisk = Object.fromEntries(
        fs
          .readdirSync(folder)
          .filter(file => file.endsWith(extension))
          .map(file => [file.slice(0, -extension.length), titleOnDisk(`${folder}/${file}`)])
      )
      const entries = createReader(process.cwd(), config).collections[collection]

      const listed = Object.fromEntries(
        await Promise.all(
          (await entries.list()).map(async slug => {
            const entry = (await entries.read(slug)) as Record<string, unknown>
            return [slug, entry[field]] as const
          })
        )
      )

      expect(Object.keys(onDisk).length).toBeGreaterThan(0)
      expect(listed).toEqual(onDisk)
    },
    60_000
  )

  it('refuses a file outside the collections', async () => {
    const { tree, blob } = await localCms()
    const entry = tree.find(candidate => candidate.path === 'package.json') as TreeEntry

    expect((await blob(entry)).status).toBe(400)
  }, 60_000)
})
