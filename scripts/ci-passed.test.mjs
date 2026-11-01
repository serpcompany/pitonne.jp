import { describe, expect, it } from 'vitest'
import { runAgainstGitHub } from '../tools/checks/github-stub'
import {
  checksPassed,
  ciWorkflow,
  gitHubReader,
  isCiRun,
  receiptPassed,
  runIdOf
} from './ci-passed.mjs'

const repository = 'serpcompany/pitonne.jp'
const repositoryId = 1228099867
const sha = '651a854324ed4cc4f9800ac5d7d79ef483213601'
const tree = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'
const jobUrl = run => `https://github.com/${repository}/actions/runs/${run}/job/9${run}`

const ciRun = (id, more = {}) => ({
  id,
  path: ciWorkflow,
  event: 'push',
  head_branch: 'staging',
  head_sha: sha,
  ...more
})

const checkRun = (run, more = {}) => ({
  conclusion: 'success',
  head_sha: sha,
  app: { slug: 'github-actions' },
  details_url: jobUrl(run),
  ...more
})

function fakeGitHub(answers) {
  const asked = []
  return {
    asked,
    read: async path => {
      asked.push(path)
      const answer = answers[path]
      if (answer instanceof Error) throw answer
      if (answer === undefined) throw new Error(`GET ${path} returned 404`)
      return answer
    }
  }
}

const checkRunsPath = check =>
  `/repos/${repository}/commits/${sha}/check-runs?check_name=${check}&per_page=100`
const runPath = id => `/repos/${repository}/actions/runs/${id}`
const artifactsPath = suite =>
  `/repos/${repository}/actions/artifacts?name=passed-${suite}-${tree}&per_page=100`

async function passedWith(checkRuns, runs, { checks = ['test'], branches = ['staging'] } = {}) {
  const answers = Object.fromEntries(
    checks.map(check => [checkRunsPath(check), { check_runs: checkRuns }])
  )
  for (const run of runs) answers[runPath(run.id)] = run
  const log = []
  const { read } = fakeGitHub(answers)
  const passed = await checksPassed(read, {
    repository,
    sha,
    checks,
    branches,
    log: line => log.push(line)
  })
  return { passed, log }
}

describe('a check counts as passed only when CI ran it for a push of that commit', () => {
  it('counts a successful check run of a ci.yml push run on the branch, at that commit', async () => {
    const { passed, log } = await passedWith([checkRun(1)], [ciRun(1)])
    expect(passed).toBe(true)
    expect(log).toEqual([`test passed on ${sha} in CI's push run 1 on staging.`])
  })

  it('needs every check it names', async () => {
    const answers = {
      [checkRunsPath('verify')]: { check_runs: [checkRun(1)] },
      [checkRunsPath('test')]: { check_runs: [] },
      [runPath(1)]: ciRun(1)
    }
    const log = []
    const { read } = fakeGitHub(answers)
    const passed = await checksPassed(read, {
      repository,
      sha,
      checks: ['verify', 'test'],
      branches: ['staging'],
      log: line => log.push(line)
    })
    expect(passed).toBe(false)
    expect(log.at(-1)).toBe(
      `test didn't pass on ${sha} in a run of ${ciWorkflow} for a push to staging.`
    )
  })

  it.each([
    [
      'a pull request run, which tested a merge commit',
      [checkRun(1)],
      [ciRun(1, { event: 'pull_request' })]
    ],
    ['another workflow', [checkRun(1)], [ciRun(1, { path: '.github/workflows/other.yml' })]],
    ['a push to another branch', [checkRun(1)], [ciRun(1, { head_branch: 'issue-12-form' })]],
    ['a run of another commit', [checkRun(1)], [ciRun(1, { head_sha: 'f'.repeat(40) })]],
    ['a check run that failed', [checkRun(1, { conclusion: 'failure' })], [ciRun(1)]],
    ['a check run another app made', [checkRun(1, { app: { slug: 'some-app' } })], [ciRun(1)]],
    [
      'a details link into another repository',
      [checkRun(1, { details_url: 'https://github.com/someone/pitonne.jp/actions/runs/1/job/91' })],
      [ciRun(1)]
    ],
    ['no check run at all', [], []]
  ])('never counts %s', async (_, checkRuns, runs) => {
    expect((await passedWith(checkRuns, runs)).passed).toBe(false)
  })

  it('takes a run on any branch it is given, such as staging or main for the fast path', async () => {
    const onMain = [ciRun(1, { head_branch: 'main' })]
    expect(
      (await passedWith([checkRun(1)], onMain, { branches: ['staging', 'main'] })).passed
    ).toBe(true)
    expect((await passedWith([checkRun(1)], onMain, { branches: ['staging'] })).passed).toBe(false)
  })

  it('looks past a check run that doesn’t count to one that does', async () => {
    const runs = [ciRun(1, { event: 'pull_request' }), ciRun(2)]
    expect((await passedWith([checkRun(1), checkRun(2)], runs)).passed).toBe(true)
  })

  it('says not passed when GitHub can’t be asked', async () => {
    const { read } = fakeGitHub({ [checkRunsPath('test')]: new Error('GET … returned 502') })
    const log = []
    const passed = await checksPassed(read, {
      repository,
      sha,
      checks: ['test'],
      branches: ['staging'],
      log: line => log.push(line)
    })
    expect(passed).toBe(false)
    expect(log[0]).toBe(
      `::warning::Couldn't tell whether test passed on ${sha}: GET … returned 502`
    )
  })

  it('passes nothing for an empty list of checks or branches', async () => {
    expect((await passedWith([checkRun(1)], [ciRun(1)], { checks: [] })).passed).toBe(false)
    expect((await passedWith([checkRun(1)], [ciRun(1)], { branches: [] })).passed).toBe(false)
  })
})

describe('reading a run and a check run', () => {
  it('takes the run from a job link of this repository on this server only', () => {
    expect(runIdOf(jobUrl(40513860827), { repository })).toBe('40513860827')
    expect(runIdOf(jobUrl(7), { repository, server: 'https://ghe.example.com' })).toBeNull()
    expect(runIdOf('not a link', { repository })).toBeNull()
    expect(runIdOf(`https://github.com/${repository}/actions/runs/7`, { repository })).toBeNull()
  })

  it('knows a CI run by its workflow file, event, branch and commit', () => {
    expect(isCiRun(ciRun(1), { events: ['push'], branches: ['staging'], sha })).toBe(true)
    expect(isCiRun(ciRun(1), { events: ['pull_request'] })).toBe(false)
    expect(isCiRun(null, { events: ['push'] })).toBe(false)
  })
})

describe('a receipt counts only when CI uploaded it in a run of this repository', () => {
  const artifact = (id, more = {}) => ({
    name: `passed-e2e-${tree}`,
    expired: false,
    workflow_run: { id, head_repository_id: repositoryId },
    ...more
  })

  async function receipt(artifacts, runs) {
    const answers = { [artifactsPath('e2e')]: { artifacts } }
    for (const run of runs) answers[runPath(run.id)] = run
    const { read } = fakeGitHub(answers)
    const log = []
    const passed = await receiptPassed(read, {
      repository,
      repositoryId: String(repositoryId),
      suite: 'e2e',
      tree,
      log: line => log.push(line)
    })
    return { passed, log }
  }

  it.each([
    ['push', ciRun(1)],
    ['pull_request', ciRun(1, { event: 'pull_request', head_branch: 'issue-12-form' })]
  ])('counts one from a ci.yml %s run', async (_, run) => {
    expect((await receipt([artifact(1)], [run])).passed).toBe(true)
  })

  it.each([
    ['another workflow’s', [artifact(1)], [ciRun(1, { path: '.github/workflows/upload.yml' })]],
    ['a fork’s', [artifact(1, { workflow_run: { id: 1, head_repository_id: 1 } })], [ciRun(1)]],
    ['an expired', [artifact(1, { expired: true })], [ciRun(1)]],
    ['another event’s', [artifact(1)], [ciRun(1, { event: 'workflow_dispatch' })]],
    ['another name’s', [artifact(1, { name: 'passed-e2e-0000' })], [ciRun(1)]]
  ])('never counts %s', async (_, artifacts, runs) => {
    expect((await receipt(artifacts, runs)).passed).toBe(false)
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
  const environment = {
    GITHUB_REPOSITORY_ID: String(repositoryId),
    GITHUB_SERVER_URL: 'https://github.com'
  }

  it('exits 0 when every check passed in CI, and 1 when GitHub refuses', async () => {
    const answers = {
      [checkRunsPath('verify')]: { check_runs: [checkRun(5)] },
      [checkRunsPath('test')]: { check_runs: [checkRun(5)] },
      [runPath(5)]: ciRun(5)
    }
    const passed = await runAgainstGitHub(
      'scripts/ci-passed.mjs',
      ['checks', sha, 'staging,main', 'verify test'],
      {
        event: {},
        env: environment,
        route: ({ path }) => (answers[path] ? { status: 200, body: answers[path] } : undefined)
      }
    )
    expect(passed.status).toBe(0)
    expect(passed.requests.map(({ method, path }) => `${method} ${path}`)).toEqual([
      `GET ${checkRunsPath('verify')}`,
      `GET ${runPath(5)}`,
      `GET ${checkRunsPath('test')}`,
      `GET ${runPath(5)}`
    ])
    const refused = await runAgainstGitHub(
      'scripts/ci-passed.mjs',
      ['checks', sha, 'staging', 'verify'],
      { event: {}, env: environment, route: () => ({ status: 403, body: {} }) }
    )
    expect(refused.status).toBe(1)
    expect(refused.output).toContain("::warning::Couldn't tell whether verify passed")
  })

  it('exits 0 for a receipt CI uploaded, and 2 when it is run wrongly', async () => {
    const answers = {
      [artifactsPath('lighthouse')]: {
        artifacts: [
          {
            name: `passed-lighthouse-${tree}`,
            expired: false,
            workflow_run: { id: 6, head_repository_id: repositoryId }
          }
        ]
      },
      [runPath(6)]: ciRun(6)
    }
    const route = ({ path }) => (answers[path] ? { status: 200, body: answers[path] } : undefined)
    const found = await runAgainstGitHub('scripts/ci-passed.mjs', ['receipt', 'lighthouse', tree], {
      event: {},
      env: environment,
      route
    })
    expect(found.status).toBe(0)
    const wrong = await runAgainstGitHub('scripts/ci-passed.mjs', ['checks', sha, 'staging'], {
      event: {},
      env: environment,
      route
    })
    expect(wrong.status).toBe(2)
  })
})
