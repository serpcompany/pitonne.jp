import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import matter from 'gray-matter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { main } from './translate-content.ts'

const deeplUrl = 'https://api-free.deepl.com/v2/translate'
const ja = text => `JA[${text}]`

let root
let log
let errors
let requests

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'translate-content-'))
  vi.spyOn(process, 'cwd').mockReturnValue(root)
  vi.stubEnv('DEEPL_API_KEY', 'test-key')
  log = vi.spyOn(console, 'log').mockImplementation(() => {})
  errors = vi.spyOn(console, 'error').mockImplementation(() => {})
  requests = []
  deepl(async init => {
    const { text } = JSON.parse(init.body)
    return Response.json({ translations: text.map(item => ({ text: ja(item) })) })
  })
})

afterEach(() => {
  process.exitCode = undefined
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  fs.rmSync(root, { recursive: true, force: true })
})

function deepl(answer) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, init) => {
      requests.push({ url, init, body: JSON.parse(init.body) })
      return answer(init)
    })
  )
}

function write(file, data, body = '') {
  const absolute = path.join(root, file)
  fs.mkdirSync(path.dirname(absolute), { recursive: true })
  fs.writeFileSync(absolute, matter.stringify(body, data))
}

const read = file => matter(fs.readFileSync(path.join(root, file), 'utf8'))
const exists = file => fs.existsSync(path.join(root, file))
const printed = () => log.mock.calls.map(call => call.join(' '))

const service = {
  title: 'IV Therapy',
  slug: 'iv-therapy',
  shortDescription: 'Drips at home.',
  fullDescription: 'Drips at home or hotel.',
  benefits: ['Fast', 'Safe'],
  keyPoints: ['Doctor led'],
  faqs: [{ question: 'How long?', answer: 'An hour.' }]
}

const post = {
  title: 'Hangover help',
  slug: 'hangover-help',
  excerpt: 'What helps.',
  publishedAt: '2026-05-31',
  tags: ['hangover'],
  author: { name: 'Medical Team', role: 'Doctors' }
}

describe('pnpm translate', () => {
  it('refuses to run without a DeepL key', async () => {
    vi.stubEnv('DEEPL_API_KEY', '')
    write('content/blog/hangover-help.md', post, 'Body.')

    await main([])

    expect(process.exitCode).toBe(1)
    expect(errors).toHaveBeenCalledWith('Error: DEEPL_API_KEY environment variable is required')
    expect(log).not.toHaveBeenCalled()
    expect(requests).toEqual([])
  })

  it('translates every English service and post that has no Japanese file yet', async () => {
    write('content/services/iv-therapy.md', service, 'Service body.')
    write('content/blog/hangover-help.md', post, 'Post body.')
    write('content/blog/ja/already.md', { title: 'もう訳した' }, '本文')
    write('content/blog/already.md', { title: 'Already' }, 'Done before.')
    fs.writeFileSync(path.join(root, 'content/blog/notes.txt'), 'not a post')

    await main([])

    expect(read('content/services/ja/iv-therapy.md')).toMatchObject({
      data: {
        title: ja('IV Therapy'),
        slug: 'iv-therapy',
        shortDescription: ja('Drips at home.'),
        fullDescription: ja('Drips at home or hotel.'),
        benefits: [ja('Fast'), ja('Safe')],
        keyPoints: [ja('Doctor led')],
        faqs: [{ question: ja('How long?'), answer: ja('An hour.') }]
      },
      content: `${ja('Service body.')}\n`
    })
    expect(read('content/blog/ja/hangover-help.md')).toMatchObject({
      data: {
        ...post,
        title: ja('Hangover help'),
        excerpt: ja('What helps.'),
        tags: [ja('hangover')],
        author: { name: ja('Medical Team'), role: ja('Doctors') }
      },
      content: `${ja('Post body.')}\n`
    })
    expect(read('content/blog/ja/already.md').data.title).toBe('もう訳した')
    expect(exists('content/blog/ja/notes.txt')).toBe(false)
    expect(read('content/services/iv-therapy.md').data).toEqual(service)
    expect(printed()).toEqual([
      'DeepL Content Translation',
      'Mode: NORMAL',
      '',
      '\nProcessing content/services/',
      '  Translating content/services/iv-therapy.md (9 segments)...',
      '  DONE content/services/iv-therapy.md -> ja/iv-therapy.md',
      '\nProcessing content/blog/',
      '  SKIP content/blog/already.md (translation exists, use --force to overwrite)',
      '  Translating content/blog/hangover-help.md (6 segments)...',
      '  DONE content/blog/hangover-help.md -> ja/hangover-help.md',
      '\nDone!'
    ])
    expect(process.exitCode).toBeUndefined()
  })

  it('translates the text in lists and FAQs and keeps what is not text', async () => {
    write('content/services/iv-therapy.md', {
      title: 'IV Therapy',
      sessions: 3,
      shortDescription: 4,
      benefits: ['Fast', 5],
      faqs: [{ question: 'Question only?' }, { answer: 'Answer only.' }]
    })

    await main(['--file', 'content/services/iv-therapy.md'])

    expect(read('content/services/ja/iv-therapy.md').data).toEqual({
      title: ja('IV Therapy'),
      sessions: 3,
      shortDescription: 4,
      benefits: [ja('Fast'), 5],
      faqs: [{ question: ja('Question only?') }, { answer: ja('Answer only.') }]
    })
  })

  it('translates whichever of the author name and role a post has', async () => {
    write('content/blog/named.md', { slug: 'named', author: { name: 'Medical Team' } })
    write('content/blog/roled.md', { slug: 'roled', author: { role: 'Doctors' } })

    await main(['--file', 'content/blog/named.md'])
    await main(['--file', 'content/blog/roled.md'])

    expect(read('content/blog/ja/named.md').data.author).toEqual({ name: ja('Medical Team') })
    expect(read('content/blog/ja/roled.md').data.author).toEqual({ role: ja('Doctors') })
  })

  it('copies a post with no text to translate without calling DeepL', async () => {
    write('content/blog/empty.md', { slug: 'empty', publishedAt: '2026-05-31' })

    await main(['--file', 'content/blog/empty.md'])

    expect(requests).toEqual([])
    expect(read('content/blog/ja/empty.md').data).toEqual({
      slug: 'empty',
      publishedAt: '2026-05-31'
    })
    expect(printed()).toContain('  Translating content/blog/empty.md (0 segments)...')
  })

  it('asks DeepL for English to Japanese with the key in the header', async () => {
    write('content/blog/hangover-help.md', { title: 'Hangover help' }, 'Post body.')

    await main(['--file', 'content/blog/hangover-help.md'])

    expect(requests).toHaveLength(1)
    expect(requests[0].url).toBe(deeplUrl)
    expect(requests[0].init.method).toBe('POST')
    expect(requests[0].init.headers).toEqual({
      Authorization: 'DeepL-Auth-Key test-key',
      'Content-Type': 'application/json'
    })
    expect(requests[0].body).toEqual({
      text: ['Hangover help', 'Post body.'],
      source_lang: 'EN',
      target_lang: 'JA'
    })
  })

  it('waits 200 ms between files to stay under the rate limit', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout'] })
    write('content/services/one.md', { title: 'One' })
    write('content/services/two.md', { title: 'Two' })
    fs.mkdirSync(path.join(root, 'content/blog'))

    const run = main([])
    await vi.waitFor(() => expect(requests).toHaveLength(1))
    await vi.advanceTimersByTimeAsync(199)
    expect(requests).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(1)
    await vi.waitFor(() => expect(requests).toHaveLength(2))
    await vi.advanceTimersByTimeAsync(200)
    await run

    expect(printed().at(-1)).toBe('\nDone!')
  })

  it('overwrites an existing Japanese file with --force', async () => {
    write('content/services/iv-therapy.md', { title: 'IV Therapy' })
    write('content/services/ja/iv-therapy.md', { title: '古い訳' })

    await main(['--force', '--file', 'content/services/iv-therapy.md'])

    expect(read('content/services/ja/iv-therapy.md').data.title).toBe(ja('IV Therapy'))
    expect(printed()).toContain('Mode: FORCE')
  })

  it('counts what it would translate and writes nothing with --dry-run', async () => {
    write('content/services/iv-therapy.md', service, 'Service body.')

    await main(['--dry-run', '--force', '--file', 'content/services/iv-therapy.md'])

    expect(requests).toEqual([])
    expect(exists('content/services/ja')).toBe(false)
    expect(printed()).toEqual([
      'DeepL Content Translation',
      'Mode: DRY RUN',
      '',
      '  DRY RUN content/services/iv-therapy.md -> ja/iv-therapy.md',
      '    9 text segments to translate'
    ])
  })

  it('translates only the file given with --file', async () => {
    write('content/blog/hangover-help.md', post, 'Post body.')
    write('content/blog/other.md', { title: 'Other' })

    await main(['--file', 'content/blog/hangover-help.md'])

    expect(exists('content/blog/ja/hangover-help.md')).toBe(true)
    expect(exists('content/blog/ja/other.md')).toBe(false)
    expect(printed()).not.toContain('\nDone!')
  })

  it('fails with exit code 1 for a --file outside the services and blog folders', async () => {
    await main(['--file', 'content/pages/about.md'])

    expect(process.exitCode).toBe(1)
    expect(errors).toHaveBeenCalledWith(
      'Cannot determine content type for:',
      'content/pages/about.md'
    )
    expect(requests).toEqual([])
  })

  it('fails with exit code 1 and the reason DeepL gives when DeepL refuses', async () => {
    deepl(async () => new Response('Quota exceeded', { status: 456 }))
    write('content/blog/hangover-help.md', post, 'Post body.')

    await main(['--file', 'content/blog/hangover-help.md'])

    expect(process.exitCode).toBe(1)
    expect(errors).toHaveBeenCalledWith(
      'Translation failed:',
      new Error('DeepL API error 456: Quota exceeded')
    )
    expect(exists('content/blog/ja/hangover-help.md')).toBe(false)
  })

  it('skips a missing content folder and still translates the other', async () => {
    write('content/blog/hangover-help.md', { title: 'Hangover help' }, 'Post body.')

    await main([])

    expect(printed()).toContain('Skipping content/services (not found)')
    expect(read('content/blog/ja/hangover-help.md').data.title).toBe(ja('Hangover help'))
    expect(printed().at(-1)).toBe('\nDone!')
    expect(process.exitCode).toBeUndefined()
  })
})
