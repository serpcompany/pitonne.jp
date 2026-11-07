import { afterEach, describe, expect, it, vi } from 'vitest'
import { gitHubApi, patiently } from './pull-request.mjs'

const repository = 'serpcompany/pitonne.jp'

type Reply = number | { status: number; body: unknown }
type Asked = { url: string; method: string; headers: Record<string, string>; body?: string }

function gitHub(replies: Reply[]) {
  const asked: Asked[] = []
  const pauses: number[] = []
  vi.stubGlobal('fetch', async (url: string, init: Omit<Asked, 'url'>) => {
    asked.push({ url, ...init })
    const reply = replies[Math.min(asked.length - 1, replies.length - 1)]
    if (reply === 0) throw new TypeError('fetch failed')
    const { status, body } = typeof reply === 'number' ? { status: reply, body: {} } : reply
    return { ok: status < 300, status, json: async () => body }
  })
  const api = gitHubApi({
    token: 't',
    api: 'https://github.example',
    pause: async (milliseconds: number) => {
      pauses.push(milliseconds)
    }
  })
  return { api, asked, pauses, paths: () => asked.map(({ url }) => url.slice(22)) }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('asking GitHub', () => {
  it('asks again after 5 and 15 seconds when GitHub fails, is busy or can’t be reached', async () => {
    const { api, pauses } = gitHub([0, 429, { status: 200, body: { state: 'open' } }])
    expect(await api.issueState(repository, 7)).toBe('open')
    expect(pauses).toEqual([5000, 15000])
    const down = gitHub([0])
    await expect(down.api.close(repository, 7)).rejects.toThrow(
      `PATCH /repos/${repository}/issues/7 got no answer (TypeError: fetch failed)`
    )
    expect(down.asked).toHaveLength(3)
  })

  it('never posts a comment twice, and asks nothing again when GitHub refuses', async () => {
    const comment = gitHub([502])
    await expect(comment.api.comment(repository, 7, 'Closed by #42')).rejects.toThrow(
      `POST /repos/${repository}/issues/7/comments returned 502`
    )
    expect(comment.asked).toHaveLength(1)
    expect(JSON.parse(String(comment.asked[0].body))).toEqual({ body: 'Closed by #42' })
    const refused = gitHub([403])
    await expect(refused.api.pullsOfCommit(repository, 'abc')).rejects.toThrow(
      `GET /repos/${repository}/commits/abc/pulls?per_page=100 returned 403`
    )
    expect(refused.asked).toHaveLength(1)
  })

  it('sends its token, and a JSON content type only with a body', async () => {
    const { api, asked } = gitHub([200])
    await api.close(repository, 7)
    await api.pullsOfCommit(repository, 'abc')
    expect(asked[0].headers).toMatchObject({
      Authorization: 'Bearer t',
      'Content-Type': 'application/json'
    })
    expect(asked[1].headers).not.toHaveProperty('Content-Type')
    expect(asked[1].body).toBeUndefined()
  })

  it('asks api.github.com and waits real seconds unless told otherwise', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout'] })
    const urls: string[] = []
    vi.stubGlobal('fetch', async (url: string) => {
      urls.push(url)
      return urls.length === 1
        ? { ok: false, status: 503 }
        : { ok: true, status: 200, json: async () => ({ state: 'closed' }) }
    })
    const asking = gitHubApi({ token: 't' }).issueState(repository, 7)
    await vi.advanceTimersByTimeAsync(4999)
    expect(urls).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(await asking).toBe('closed')
    expect(urls).toEqual([
      `https://api.github.com/repos/${repository}/issues/7`,
      `https://api.github.com/repos/${repository}/issues/7`
    ])
  })
})

describe('what GitHub says about a pull request', () => {
  it.each([
    [{ status: 200, body: { state: 'open' } }, 'open'],
    [{ status: 200, body: { state: 'closed', pull_request: {} } }, 'pull request'],
    [404, null],
    [410, null]
  ])('reads an issue answered with %j as %j', async (reply, state) => {
    expect(await gitHub([reply]).api.issueState(repository, 7)).toBe(state)
  })

  it('fails when GitHub can’t say what the issue is', async () => {
    await expect(gitHub([500]).api.issueState(repository, 7)).rejects.toThrow(
      `GET /repos/${repository}/issues/7 returned 500`
    )
  })

  it('reads the issues GitHub linked to a pull request, and none when GraphQL finds no pull request', async () => {
    const nodes = { nodes: [{ number: 3 }, { number: 5 }] }
    const linked = gitHub([
      {
        status: 200,
        body: { data: { repository: { pullRequest: { closingIssuesReferences: nodes } } } }
      }
    ])
    expect(await linked.api.closingIssues(repository, 42)).toEqual([3, 5])
    expect(linked.paths()).toEqual(['/graphql'])
    expect(JSON.parse(String(linked.asked[0].body)).variables).toEqual({
      owner: 'serpcompany',
      name: 'pitonne.jp',
      number: 42
    })
    const missing = gitHub([{ status: 200, body: { data: null, errors: [{ type: 'NOT_FOUND' }] } }])
    expect(await missing.api.closingIssues(repository, 42)).toEqual([])
  })

  it('reads every page of changed files and leaves out removed ones', async () => {
    const files = (count: number, prefix: string) =>
      Array.from({ length: count }, (_, n) => ({ filename: `${prefix}${n}.ts`, status: 'added' }))
    const { api, paths } = gitHub([
      { status: 200, body: [...files(99, 'src/a'), { filename: 'old.ts', status: 'removed' }] },
      { status: 200, body: files(1, 'src/b') }
    ])
    const changed = await api.changedFiles(repository, 42)
    expect(changed).toHaveLength(100)
    expect(changed).not.toContain('old.ts')
    expect(changed.at(-1)).toBe('src/b0.ts')
    expect(paths()).toEqual([
      `/repos/${repository}/pulls/42/files?per_page=100&page=1`,
      `/repos/${repository}/pulls/42/files?per_page=100&page=2`
    ])
  })
})

describe('asking until GitHub has an answer', () => {
  it('waits five seconds of real time between asks by default', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout'] })
    const answers = [[], [3]]
    let asks = 0
    const found = patiently(async () => answers[asks++])
    await vi.advanceTimersByTimeAsync(4999)
    expect(asks).toBe(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(await found).toEqual([3])
  })
})
