import { describe, expect, it } from 'vitest'
import { type Route, runAgainstGitHub } from './github-stub'
import { checkNames, issueRule, main, stagingNote } from './pull-request.mjs'

const repository = 'serpcompany/pitonne.jp'
const nowhere: Route = () => undefined

const opened = (more: Record<string, unknown> = {}) => ({
  pull_request: {
    number: 42,
    title: 'feat: the form opens',
    body: 'Closes #3',
    user: { login: 'octocat' },
    base: { ref: 'staging', repo: { full_name: repository } },
    head: { ref: 'issue-3-form', repo: { full_name: repository } },
    ...more
  },
  repository: { full_name: repository, default_branch: 'main' }
})

const run = (args: string[], event: unknown, route = nowhere, env = {}) =>
  runAgainstGitHub(main, args, { event, route, env })

describe('pull-request.mjs as each job runs it', () => {
  it('checks the title without a token, as the title job gives it none', async () => {
    const titled = await run(['title'], opened(), nowhere, { GITHUB_TOKEN: undefined })
    expect(titled).toEqual({
      status: 0,
      output: '"feat: the form opens" names its type.\n',
      requests: []
    })
  })

  it('fails without a check to run, or an event without a pull request', async () => {
    const unnamed = await run([], opened())
    expect(unnamed.status).toBe(1)
    expect(unnamed.output).toBe(`Run it as one of: ${checkNames.join(', ')}.\n`)
    const pushed = await run(['title'], { repository: opened().repository })
    expect(pushed.status).toBe(1)
    expect(pushed.output).toBe('This event has no pull request to check.\n')
  })

  it('reads a pull request with no description, which GitHub sends as null', async () => {
    const text = await run(['text'], opened({ body: null }))
    expect(text.status).toBe(0)
    expect(text.output).toBe('No local paths in the title or body.\n')
    const linked = await run(['issue-link'], opened({ body: null }))
    expect(linked.status).toBe(1)
    expect(linked.output).toBe(`${issueRule}\n\n${stagingNote}\n`)
  })

  it('fails a pull request into staging that names an issue GitHub doesn’t have', async () => {
    const linked = await run(['issue-link'], opened({ body: 'Closes #9' }))
    expect(linked.status).toBe(1)
    expect(linked.output).toContain(`#9 isn't an issue in ${repository}.`)
    expect(linked.requests.map(({ path }) => path)).toEqual([`/repos/${repository}/issues/9`])
  })

  it('reads the issues GitHub linked to a pull request into main', async () => {
    const intoMain = opened({ base: { ref: 'main', repo: { full_name: repository } } })
    const linked = await run(['issue-link'], intoMain, ({ method, path }) =>
      method === 'POST' && path === '/graphql'
        ? {
            status: 200,
            body: {
              data: {
                repository: {
                  pullRequest: { closingIssuesReferences: { nodes: [{ number: 3 }] } }
                }
              }
            }
          }
        : undefined
    )
    expect(linked.status).toBe(0)
    expect(linked.output).toBe('Closes #3\n')
  })

  it('reads every page of a fix’s changed files, and the test patterns in verify.json', async () => {
    const fix = opened({ title: 'fix: the form sends' })
    const page = (number: number) =>
      `/repos/${repository}/pulls/42/files?per_page=100&page=${number}`
    const code = Array.from({ length: 99 }, (_, n) => ({ filename: `src/f${n}.ts` }))
    const removedTest = { filename: 'src/old.test.ts', status: 'removed' }
    const changing = (last: string) => (sent: { path: string }) =>
      sent.path === page(1)
        ? { status: 200, body: [...code, removedTest] }
        : sent.path === page(2)
          ? { status: 200, body: [{ filename: last }] }
          : undefined
    const untested = await run(['fix-test'], fix, changing('src/form.ts'))
    expect(untested.status).toBe(1)
    expect(untested.output).toContain('src/f98.ts\nsrc/form.ts\n\nA fix comes with its test')
    expect(untested.output).not.toContain('old.test.ts')
    expect(untested.requests.map(({ path }) => path)).toEqual([page(1), page(2)])
    const tested = await run(['fix-test'], fix, changing('scripts/smoke-form.mjs'))
    expect(tested.status).toBe(0)
    expect(tested.output).toBe('Changes a test.\n')
  })
})
