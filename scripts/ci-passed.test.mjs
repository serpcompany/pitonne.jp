import { afterEach, describe, expect, it } from 'vitest'
import {
  allPassed,
  checks,
  ciPushRun,
  fakeGitHub,
  job,
  jobsPath,
  removeScratchHistories,
  repository,
  runsPathOf,
  scratchHistory
} from '../tools/checks/ci-passed-fixtures'
import { runAgainstGitHub } from '../tools/checks/github-stub'
import { checksPassed, ciWorkflow, gitHubReader, isCiPush, receiptPassed } from './ci-passed.mjs'

const repositoryId = 1228099867
const sha = '651a854324ed4cc4f9800ac5d7d79ef483213601'
const tree = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'

const ciRun = (id, more = {}) => ciPushRun(id, { head_sha: sha, ...more })

const runsPath = runsPathOf(sha)
const runPath = id => `/repos/${repository}/actions/runs/${id}`
const artifactsPath = suite =>
  `/repos/${repository}/actions/artifacts?name=passed-${suite}-${tree}&per_page=100`

afterEach(removeScratchHistories)

async function passedWith(runs, jobsOf, { branches = ['staging'], names = checks } = {}) {
  const answers = { [runsPath]: { workflow_runs: runs } }
  for (const run of runs) answers[jobsPath(run.id)] = { jobs: jobsOf(run.id) }
  const log = []
  const { read, asked } = fakeGitHub(answers)
  const passed = await checksPassed(read, {
    repository,
    sha,
    checks: names,
    branches,
    log: line => log.push(line)
  })
  return { passed, log, asked }
}

describe('a commit counts as passed only when one CI push run on staging or main passed every job', () => {
  it('counts a ci.yml push run on the branch, at that commit, whose named jobs all succeeded', async () => {
    const { passed, log, asked } = await passedWith([ciRun(1)], allPassed)
    expect(passed).toBe(true)
    expect(log).toEqual([`${checks.join(', ')} passed on ${sha} in CI's push run 1 on staging.`])
    expect(asked).toEqual([runsPath, jobsPath(1)])
  })

  it.each([
    ['a run of another workflow', ciRun(1, { path: '.github/workflows/other.yml' })],
    ['a pull request run, which tested a merge commit', ciRun(1, { event: 'pull_request' })],
    ['a push to another branch', ciRun(1, { head_branch: 'issue-12-form' })],
    ['a run of another commit', ciRun(1, { head_sha: 'f'.repeat(40) })]
  ])('never counts %s, whatever its jobs say', async (_, run) => {
    const { passed, asked } = await passedWith([run], allPassed)
    expect(passed).toBe(false)
    expect(asked).toEqual([runsPath])
  })

  it('needs every named job to succeed, in one run', async () => {
    const failed = await passedWith([ciRun(1)], () => [
      ...allPassed().slice(0, 2),
      job('e2e', 'failure')
    ])
    expect(failed.passed).toBe(false)
    expect(failed.log.at(-1)).toBe(
      `${checks.join(', ')} didn't all pass on ${sha} in one run of ${ciWorkflow} for a push to staging.`
    )
    const split = await passedWith([ciRun(1), ciRun(2)], id =>
      id === 1 ? allPassed().slice(0, 2) : allPassed().slice(2)
    )
    expect(split.passed).toBe(false)
  })

  it('looks past a run that doesn’t count to one that does', async () => {
    const runs = [ciRun(1, { head_branch: 'issue-12-form' }), ciRun(2, { head_branch: 'main' })]
    const { passed, asked } = await passedWith(runs, allPassed, { branches: ['staging', 'main'] })
    expect(passed).toBe(true)
    expect(asked).toEqual([runsPath, jobsPath(2)])
  })

  it('takes only the branches it is given: staging and main for the fast path, staging for promote', async () => {
    const onMain = [ciRun(1, { head_branch: 'main' })]
    expect((await passedWith(onMain, allPassed, { branches: ['staging', 'main'] })).passed).toBe(
      true
    )
    expect((await passedWith(onMain, allPassed, { branches: ['staging'] })).passed).toBe(false)
  })

  it('says not passed when GitHub can’t be asked', async () => {
    const { read } = fakeGitHub({ [runsPath]: new Error('GET … returned 502') })
    const log = []
    const passed = await checksPassed(read, {
      repository,
      sha,
      checks,
      branches: ['staging'],
      log: line => log.push(line)
    })
    expect(passed).toBe(false)
    expect(log[0]).toBe(
      `::warning::Couldn't tell whether ${checks.join(', ')} passed on ${sha}: GET … returned 502`
    )
  })

  it('passes nothing for an empty list of checks or branches', async () => {
    expect((await passedWith([ciRun(1)], allPassed, { names: [] })).passed).toBe(false)
    expect((await passedWith([ciRun(1)], allPassed, { branches: [] })).passed).toBe(false)
  })

  it('knows a CI push by its workflow file, event, branch and commit', () => {
    expect(isCiPush(ciRun(1), { sha })).toBe(true)
    expect(isCiPush(ciRun(1, { head_branch: 'main' }))).toBe(true)
    expect(isCiPush(ciRun(1, { head_branch: 'issue-12-form' }))).toBe(false)
    expect(isCiPush(null)).toBe(false)
  })
})

describe('a receipt counts only when CI uploaded it in a push run on staging or main', () => {
  const artifact = (id, more = {}) => ({
    name: `passed-e2e-${tree}`,
    expired: false,
    workflow_run: { id, head_repository_id: repositoryId, head_branch: 'staging' },
    ...more
  })

  async function receipt(artifacts, runs) {
    const answers = { [artifactsPath('e2e')]: { artifacts } }
    for (const run of runs) answers[runPath(run.id)] = run
    const { read, asked } = fakeGitHub(answers)
    const log = []
    const passed = await receiptPassed(read, {
      repository,
      repositoryId: String(repositoryId),
      suite: 'e2e',
      tree,
      log: line => log.push(line)
    })
    return { passed, log, asked }
  }

  it.each(['staging', 'main'])('counts one from a ci.yml push run on %s', async branch => {
    const run = ciRun(1, { head_branch: branch })
    const found = await receipt(
      [
        artifact(1, {
          workflow_run: { id: 1, head_repository_id: repositoryId, head_branch: branch }
        })
      ],
      [run]
    )
    expect(found.passed).toBe(true)
    expect(found.log).toEqual([`e2e passed on tree ${tree} in CI's push run 1 on ${branch}.`])
  })

  it.each([
    [
      'a push to a feature branch, whose ci.yml is whatever that branch says',
      artifact(1, {
        workflow_run: { id: 1, head_repository_id: repositoryId, head_branch: 'issue-12-form' }
      }),
      ciRun(1, { head_branch: 'issue-12-form' })
    ],
    [
      'a pull request run, even with ci.yml unchanged, since the pull request’s code ran in it',
      artifact(1),
      ciRun(1, { event: 'pull_request' })
    ],
    [
      'a pull request run that edited ci.yml',
      artifact(1),
      ciRun(1, { event: 'pull_request', path: ciWorkflow, head_branch: 'issue-12-form' })
    ],
    ['another workflow’s', artifact(1), ciRun(1, { path: '.github/workflows/upload.yml' })],
    [
      'a fork’s',
      artifact(1, { workflow_run: { id: 1, head_repository_id: 1, head_branch: 'staging' } }),
      ciRun(1)
    ],
    ['an expired one', artifact(1, { expired: true }), ciRun(1)],
    ['one with another name', artifact(1, { name: 'passed-e2e-0000' }), ciRun(1)]
  ])('never counts %s', async (_, uploaded, run) => {
    expect((await receipt([uploaded], [run])).passed).toBe(false)
  })

  it('says not passed when GitHub can’t be asked', async () => {
    const { passed, log } = await receipt([artifact(1)], [])
    expect(passed).toBe(false)
    expect(log[0]).toMatch(/^::warning::Couldn't look up passed-e2e-/)
  })
})

describe('the GitHub reader', () => {
  const answering = statuses => {
    const pauses = []
    let call = 0
    const original = globalThis.fetch
    globalThis.fetch = async () => {
      const status = statuses[Math.min(call++, statuses.length - 1)]
      return { ok: status === 200, status, json: async () => ({ status }) }
    }
    const read = gitHubReader({ token: 't', pause: async ms => pauses.push(ms) })
    return { read, pauses, calls: () => call, restore: () => (globalThis.fetch = original) }
  }

  it('asks again after 5 and 15 seconds when GitHub fails, then gives up', async () => {
    const flaky = answering([502, 503, 200])
    try {
      expect(await flaky.read('/x')).toEqual({ status: 200 })
      expect(flaky.pauses).toEqual([5000, 15000])
    } finally {
      flaky.restore()
    }
    const down = answering([500])
    try {
      await expect(down.read('/x')).rejects.toThrow('GET /x returned 500')
      expect(down.calls()).toBe(3)
    } finally {
      down.restore()
    }
  })

  it('doesn’t ask again when GitHub refuses', async () => {
    const refused = answering([403])
    try {
      await expect(refused.read('/x')).rejects.toThrow('GET /x returned 403')
      expect(refused.calls()).toBe(1)
    } finally {
      refused.restore()
    }
  })
})

describe('the command line', () => {
  const environment = { GITHUB_REPOSITORY_ID: String(repositoryId) }
  const answering =
    answers =>
    ({ path }) =>
      answers[path] ? { status: 200, body: answers[path] } : undefined

  it('exits 0 when every check passed in a CI push run under docs-only commits, and 1 when GitHub refuses', async () => {
    const { folder, commit } = scratchHistory()
    const code = commit('src/a.ts')
    const docs = commit('docs/a.md')
    const answers = {
      [runsPathOf(docs)]: { workflow_runs: [] },
      [runsPathOf(code)]: { workflow_runs: [ciPushRun(5, { head_sha: code })] },
      [jobsPath(5)]: { jobs: [job('verify'), job('test')] }
    }
    const passed = await runAgainstGitHub(
      'scripts/ci-passed.mjs',
      ['checks', docs, 'staging,main', 'verify test'],
      { event: {}, env: environment, route: answering(answers), cwd: folder }
    )
    expect(passed.status).toBe(0)
    expect(passed.requests.map(({ method, path }) => `${method} ${path}`)).toEqual([
      `GET ${runsPathOf(docs)}`,
      `GET ${runsPathOf(code)}`,
      `GET ${jobsPath(5)}`
    ])
    const refused = await runAgainstGitHub(
      'scripts/ci-passed.mjs',
      ['checks', code, 'staging', 'verify'],
      { event: {}, env: environment, route: () => ({ status: 403, body: {} }), cwd: folder }
    )
    expect(refused.status).toBe(1)
    expect(refused.output).toContain("::warning::Couldn't tell whether verify passed")
  })

  it('exits 0 for a receipt CI uploaded on staging, and 2 when it is run wrongly', async () => {
    const answers = {
      [artifactsPath('lighthouse')]: {
        artifacts: [
          {
            name: `passed-lighthouse-${tree}`,
            expired: false,
            workflow_run: { id: 6, head_repository_id: repositoryId, head_branch: 'staging' }
          }
        ]
      },
      [runPath(6)]: ciRun(6)
    }
    const found = await runAgainstGitHub('scripts/ci-passed.mjs', ['receipt', 'lighthouse', tree], {
      event: {},
      env: environment,
      route: answering(answers)
    })
    expect(found.status).toBe(0)
    const wrong = await runAgainstGitHub('scripts/ci-passed.mjs', ['checks', sha, 'staging'], {
      event: {},
      env: environment,
      route: answering(answers)
    })
    expect(wrong.status).toBe(2)
  })
})
