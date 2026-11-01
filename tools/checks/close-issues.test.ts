import { describe, expect, it } from 'vitest'
import { closeNamedIssues, closingComment } from './close-issues.mjs'
import { runAgainstGitHub } from './github-stub'

const repository = 'serpcompany/pitonne.jp'

const merged = (body: string, base = 'staging') => ({
  number: 42,
  title: 'feat: the form opens',
  body,
  author: 'octocat',
  base,
  head: 'issue-12-form',
  fromThisRepository: true,
  merged: true,
  mergeCommit: 'abc1234def5678'
})

function fakeApi(states: Record<number, string | null>) {
  const done: string[] = []
  return {
    done,
    api: {
      issueState: async (_: string, number: number) => states[number] ?? null,
      comment: async (_: string, number: number, body: string) => {
        done.push(`comment #${number}: ${body}`)
      },
      close: async (_: string, number: number) => {
        done.push(`close #${number}`)
      }
    }
  }
}

describe('closing the issues a pull request into staging names', () => {
  it('comments on each open issue of this repository, then closes it, and leaves the rest', async () => {
    const { api, done } = fakeApi({ 1: 'open', 2: 'closed', 4: 'pull request' })
    const log: string[] = []
    const pull = merged('Closes #1\nFixes #2\nResolves #3\nCloses #4\nCloses serpcompany/serp#5')
    const closed = await closeNamedIssues({
      pull,
      repository,
      api,
      log: (line: string) => log.push(line)
    })
    expect(closed).toEqual([1])
    expect(done).toEqual([`comment #1: ${closingComment(pull)}`, 'close #1'])
    expect(log).toEqual([
      'Closed #1.',
      '#2 is already closed.',
      `::warning::#3 isn't an issue in ${repository}.`,
      '::warning::#4 is a pull request, not an issue.',
      '::notice::serpcompany/serp#5 is in another repository, so close it by hand.'
    ])
  })

  it('says which pull request closed the issue, and that Production gets it with the next promotion', () => {
    const comment = closingComment(merged('Closes #1'))
    expect(comment).toContain('Closed by #42, merged into `staging` as abc1234.')
    expect(comment).toContain('next promotion')
  })

  it('closes nothing for a pull request that closed without merging, or that merged elsewhere', async () => {
    const { api, done } = fakeApi({ 1: 'open' })
    const log: string[] = []
    for (const pull of [{ ...merged('Closes #1'), merged: false }, merged('Closes #1', 'main')])
      expect(
        await closeNamedIssues({ pull, repository, api, log: (line: string) => log.push(line) })
      ).toEqual([])
    expect(done).toEqual([])
  })

  it('reads the pull request from the event file and closes through GitHub’s API', async () => {
    const event = {
      pull_request: {
        number: 42,
        title: 'feat: the form opens',
        body: 'Closes #7',
        merged: true,
        merge_commit_sha: 'abc1234def5678',
        user: { login: 'octocat' },
        base: { ref: 'staging', repo: { full_name: repository } },
        head: { ref: 'issue-7-form', repo: { full_name: repository } }
      }
    }
    const issue = `/repos/${repository}/issues/7`
    const run = await runAgainstGitHub('tools/checks/close-issues.mjs', [], {
      event,
      route: ({ method, path }) => {
        if (method === 'GET' && path === issue) return { status: 200, body: { state: 'open' } }
        if (method === 'POST' && path === `${issue}/comments`) return { status: 201, body: {} }
        if (method === 'PATCH' && path === issue) return { status: 200, body: {} }
        return undefined
      }
    })
    expect(run.status).toBe(0)
    expect(run.output).toContain('Closed #7.')
    expect(run.requests.map(({ method, path }) => `${method} ${path}`)).toEqual([
      `GET ${issue}`,
      `POST ${issue}/comments`,
      `PATCH ${issue}`
    ])
    expect(JSON.parse(run.requests[2].body)).toEqual({ state: 'closed', state_reason: 'completed' })
  })
})
