import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { vi } from 'vitest'

export const fixture = {
  draft: 'draft-fixture-post',
  englishOnly: 'english-only-fixture-post',
  japaneseOnly: 'japanese-only-fixture-post',
  englishOnlyCategory: 'english-only-fixture-category'
} as const

const excerpt =
  'A post the tests add to a copy of the content, with an excerpt long enough for a meta description.'

function post(title: string, categorySlug: string, draft: boolean): string {
  return [
    '---',
    `title: ${JSON.stringify(title)}`,
    `excerpt: ${JSON.stringify(excerpt)}`,
    "publishedAt: '2026-10-01'",
    `categorySlug: ${categorySlug}`,
    'author:',
    '  name: Pitonne Medical Team',
    '  role: Wellness Experts',
    `draft: ${draft}`,
    '---',
    'A body the tests wrote.',
    ''
  ].join('\n')
}

const category = {
  name: 'English-only fixture',
  nameJa: 'English-only fixture',
  description: 'x'.repeat(120),
  descriptionJa: 'x'.repeat(120)
}

export function writeContentFixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pitonne-content-'))
  const content = path.join(root, 'content')
  fs.cpSync(path.join(process.cwd(), 'content'), content, { recursive: true })
  const write = (file: string, text: string) => fs.writeFileSync(path.join(content, file), text)
  write(`blog/${fixture.draft}.md`, post('Draft fixture', 'iv-therapy', true))
  write(`blog/ja/${fixture.draft}.md`, post('Draft fixture', 'iv-therapy', true))
  write(
    `blog/${fixture.englishOnly}.md`,
    post('English-only fixture', fixture.englishOnlyCategory, false)
  )
  write(`blog/ja/${fixture.japaneseOnly}.md`, post('Japanese-only fixture', 'iv-therapy', false))
  write(`blog-categories/${fixture.englishOnlyCategory}.json`, JSON.stringify(category))
  return root
}

export function removeContentFixture(root: string): void {
  fs.rmSync(root, { recursive: true, force: true })
}

export async function withContent<T>(root: string, run: () => Promise<T>): Promise<T> {
  const cwd = vi.spyOn(process, 'cwd').mockReturnValue(root)
  vi.resetModules()
  try {
    return await run()
  } finally {
    cwd.mockRestore()
    vi.resetModules()
  }
}
