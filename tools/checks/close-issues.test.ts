import { describe, expect, it } from 'vitest'
import {
  closeIssuesOfPush,
  closeNamedIssues,
  closingComment,
  commitsOf,
  mergedAs,
  pullNamedBy
} from './close-issues.mjs'
import { runAgainstGitHub } from './github-stub'

const repository = 'serpcompany/pitonne.jp'
const squash = 'abc1234def5678abc1234def5678abc1234def56'

const merged = (body: string) => ({
  number: 42,
  title: 'feat: the form opens',
  body,
  author: 'octocat',
  base: 'staging',
  head: 'issue-12-form',
  fromThisRepository: true,
  merged: true,
  mergeCommit: squash
})

const listed = (number: number, body: string, sha: string, base = 'staging') => ({
  number,
  title: 'feat: the form opens',
  body,
  merged_at: '2026-11-01T10:00:00Z',
  merge_commit_sha: sha,
  user: { login: 'octocat' },
  base: { ref: base, repo: { full_name: repository } },
  head: { ref: `issue-${number}`, repo: { full_name: repository } }
})

function fakeApi(
  states: Record<number, string | null>,
  { pulls = {}, failing = [] }: { pulls?: Record<string, unknown[]>; failing?: string[] } = {}
) {
  const done: string[] = []
  const fails = (what: string) => {
    if (failing.includes(what)) throw new Error(`${what} returned 502`)
  }
  return {
    done,
    api: {
      pullsOfCommit: async (_: string, sha: string) => {
        fails(`pulls ${sha}`)
        return pulls[sha] ?? []
      },
      issueState: async (_: string, number: number) => states[number] ?? null,
      comment: async (_: string, number: number, body: string) => {
        fails(`comment #${number}`)
        done.push(`comment #${number}: ${body}`)
      },
      close: async (_: string, number: number) => {
        done.push(`close #${number}`)
      }
    }
  }
}

const logged = () => {
  const lines: string[] = []
  return { lines, log: (line: string) => lines.push(line) }
}

describe('closing the issues a merged pull request names', () => {
  it('comments on each open issue of this repository, then closes it, and leaves the rest', async () => {
    const { api, done } = fakeApi({ 1: 'open', 2: 'closed', 4: 'pull request' })
    const { lines, log } = logged()
    const pull = merged('Closes #1\nFixes #2\nResolves #3\nCloses #4\nCloses serpcompany/serp#5')
    expect(await closeNamedIssues({ pull, repository, api, log })).toEqual({
      closed: [1],
      failed: []
    })
    expect(done).toEqual([`comment #1: ${closingComment(pull)}`, 'close #1'])
    expect(lines).toEqual([
      'Closed #1, which #42 names.',
      '#2 is already closed.',
      `::warning::#3 isn't an issue in ${repository}.`,
      '::warning::#4 is a pull request, not an issue.',
      '::notice::serpcompany/serp#5 is in another repository, so close it by hand.'
    ])
  })

  it('goes on past an issue it couldn’t close, and reports each one', async () => {
    const { api, done } = fakeApi({ 1: 'open', 2: 'open' }, { failing: ['comment #1'] })
    const { lines, log } = logged()
    const result = await closeNamedIssues({
      pull: merged('Closes #1\nCloses #2'),
      repository,
      api,
      log
    })
    expect(result).toEqual({ closed: [2], failed: [1] })
    expect(done).toEqual([`comment #2: ${closingComment(merged(''))}`, 'close #2'])
    expect(lines[0]).toBe("::error::Couldn't close #1, which #42 names: comment #1 returned 502")
  })

  it('says which pull request closed the issue, and that Production gets it with the next promotion', () => {
    const comment = closingComment(merged('Closes #1'))
    expect(comment).toContain('Closed by #42, merged into `staging` as abc1234.')
    expect(comment).toContain('next promotion')
  })
})

describe('finding the pull requests a push to staging merged', () => {
  it('takes every commit the push brought, or its head commit', () => {
    expect(
      commitsOf({ commits: [{ id: 'a', message: 'x' }, { id: 'b' }], head_commit: { id: 'b' } })
    ).toEqual([
      { id: 'a', message: 'x' },
      { id: 'b', message: '' }
    ])
    expect(commitsOf({ commits: [], head_commit: { id: 'c', message: 'y' } })).toEqual([
      { id: 'c', message: 'y' }
    ])
    expect(commitsOf({})).toEqual([])
  })

  it('reads the pull request a squash merge names at the end of its subject', () => {
    expect(pullNamedBy('feat: the form opens (#42)')).toBe(42)
    expect(pullNamedBy('fix: closes #12 (#12) (#42)\n\nbody (#7)')).toBe(42)
    expect(pullNamedBy('chore: merge main into staging')).toBeNull()
    expect(pullNamedBy('Update blog post (#3) now')).toBeNull()
  })

  it('counts a pull request only when it merged into staging as that very commit', () => {
    expect(mergedAs(listed(42, '', squash), squash)).toBe(true)
    expect(mergedAs(listed(42, '', squash, 'main'), squash)).toBe(false)
    expect(mergedAs(listed(42, '', 'f'.repeat(40)), squash)).toBe(false)
    expect(mergedAs({ ...listed(42, '', squash), merged_at: null }, squash)).toBe(false)
  })

  it('closes only what a squash merge into staging names: not a sync from main, a CMS save or a hotfix', async () => {
    const hotfix = 'd'.repeat(40)
    const { api, done } = fakeApi(
      { 7: 'open', 8: 'open' },
      {
        pulls: {
          [squash]: [listed(42, 'Closes #7', squash)],
          [hotfix]: [listed(43, 'Closes #8', hotfix, 'main')]
        }
      }
    )
    const { lines, log } = logged()
    const event = {
      ref: 'refs/heads/staging',
      commits: [{ id: hotfix }, { id: 'c'.repeat(40) }, { id: squash }]
    }
    expect(await closeIssuesOfPush({ event, repository, api, log })).toEqual({
      closed: [7],
      failures: 0
    })
    expect(done.filter(line => line.startsWith('close'))).toEqual(['close #7'])
    expect(lines).toContain(
      "ddddddd isn't a pull request merged into staging, so it closes nothing."
    )
  })

  it('closes nothing for a push to another branch', async () => {
    const { api, done } = fakeApi(
      { 7: 'open' },
      { pulls: { [squash]: [listed(42, 'Closes #7', squash)] } }
    )
    const { log } = logged()
    const event = { ref: 'refs/heads/main', commits: [{ id: squash }] }
    expect(await closeIssuesOfPush({ event, repository, api, log })).toEqual({
      closed: [],
      failures: 0
    })
    expect(done).toEqual([])
  })

  it('goes on past a commit whose pull requests it couldn’t list, and counts it as a failure', async () => {
    const other = 'e'.repeat(40)
    const { api } = fakeApi(
      { 7: 'open' },
      { pulls: { [squash]: [listed(42, 'Closes #7', squash)] }, failing: [`pulls ${other}`] }
    )
    const { lines, log } = logged()
    const event = { ref: 'refs/heads/staging', commits: [{ id: other }, { id: squash }] }
    expect(await closeIssuesOfPush({ event, repository, api, log })).toEqual({
      closed: [7],
      failures: 1
    })
    expect(lines[0]).toBe(
      `::error::Couldn't find the pull request ${other} merged: pulls ${other} returned 502`
    )
  })
})

describe('waiting for GitHub to link a squash merge to its commit', () => {
  const pushOf = (message: string) => ({
    ref: 'refs/heads/staging',
    commits: [{ id: squash, message }]
  })

  function slowApi(answers: unknown[][]) {
    let calls = 0
    const { api, done } = fakeApi({ 7: 'open' })
    return {
      done,
      calls: () => calls,
      api: {
        ...api,
        pullsOfCommit: async () => answers[Math.min(calls++, answers.length - 1)]
      }
    }
  }

  it('asks again while GitHub doesn’t link the pull request the subject names, then closes its issues', async () => {
    const { api, done, calls } = slowApi([[], [], [listed(42, 'Closes #7', squash)]])
    const waits: number[] = []
    const { lines, log } = logged()
    const result = await closeIssuesOfPush({
      event: pushOf('feat: the form opens (#42)'),
      repository,
      api,
      log,
      wait: async (milliseconds: number) => {
        waits.push(milliseconds)
      }
    })
    expect(result).toEqual({ closed: [7], failures: 0 })
    expect(calls()).toBe(3)
    expect(waits).toEqual([10_000, 10_000])
    expect(lines[0]).toBe("GitHub doesn't link #42's merge to abc1234 yet; asking again in 10 s.")
    expect(done.at(-1)).toBe('close #7')
  })

  it('fails, naming the pull request, when GitHub never links it', async () => {
    const { api, calls } = slowApi([[]])
    const { lines, log } = logged()
    const result = await closeIssuesOfPush({
      event: pushOf('feat: the form opens (#42)'),
      repository,
      api,
      log,
      wait: async () => {}
    })
    expect(result).toEqual({ closed: [], failures: 1 })
    expect(calls()).toBe(4)
    expect(lines.at(-1)).toContain(
      `::error::Couldn't find the pull request ${squash} merged: its subject names #42`
    )
    expect(lines.at(-1)).toContain('Close the issues #42 names by hand')
  })

  it.each([
    ['names no pull request, such as a sync from main', 'chore: merge main into staging', []],
    [
      'names one merged elsewhere, such as a hotfix into main',
      'fix: the phone link (#43)',
      [listed(43, 'Closes #8', squash, 'main')]
    ]
  ])('asks once for a commit that %s, and closes nothing', async (_, message, answer) => {
    const { api, calls, done } = slowApi([answer])
    const { log } = logged()
    const result = await closeIssuesOfPush({
      event: pushOf(message),
      repository,
      api,
      log,
      wait: async () => {
        throw new Error('It waited.')
      }
    })
    expect(result).toEqual({ closed: [], failures: 0 })
    expect(calls()).toBe(1)
    expect(done).toEqual([])
  })
})

describe('the Close issues script against GitHub’s API', () => {
  const pulls = `/repos/${repository}/commits/${squash}/pulls?per_page=100`
  const issue = (number: number) => `/repos/${repository}/issues/${number}`

  async function closeFor(body: string, failingComment?: number) {
    const run = await runAgainstGitHub('tools/checks/close-issues.mjs', [], {
      event: { ref: 'refs/heads/staging', commits: [{ id: squash }] },
      route: ({ method, path }) => {
        if (method === 'GET' && path === pulls)
          return { status: 200, body: [listed(42, body, squash)] }
        if (method === 'GET') return { status: 200, body: { state: 'open' } }
        if (method === 'POST' && path === `${issue(failingComment ?? 0)}/comments`)
          return { status: 502, body: {} }
        if (method === 'POST') return { status: 201, body: {} }
        if (method === 'PATCH') return { status: 200, body: {} }
        return undefined
      }
    })
    return { ...run, asked: run.requests.map(({ method, path }) => `${method} ${path}`) }
  }

  it('lists the commit’s pull requests, then comments on and closes each issue', async () => {
    const run = await closeFor('Closes #7')
    expect(run.status).toBe(0)
    expect(run.output).toContain('Closed #7, which #42 names.')
    expect(run.asked).toEqual([
      `GET ${pulls}`,
      `GET ${issue(7)}`,
      `POST ${issue(7)}/comments`,
      `PATCH ${issue(7)}`
    ])
    expect(JSON.parse(run.requests[3].body)).toEqual({ state: 'closed', state_reason: 'completed' })
  })

  it('never posts a comment twice: a failed comment fails the run, and the next issue still closes', async () => {
    const run = await closeFor('Closes #7\nCloses #8', 7)
    expect(run.status).toBe(1)
    expect(run.asked).toEqual([
      `GET ${pulls}`,
      `GET ${issue(7)}`,
      `POST ${issue(7)}/comments`,
      `GET ${issue(8)}`,
      `POST ${issue(8)}/comments`,
      `PATCH ${issue(8)}`
    ])
    expect(run.output).toContain("::error::Couldn't close #7, which #42 names")
    expect(run.output).toContain('::error::1 step(s) failed')
  })
})
