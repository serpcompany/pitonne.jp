import { describe, expect, it } from 'vitest'
import { type Scenario, simulate } from './job-results'
import { readWorkflow } from './workflows'

const ci = readWorkflow('ci.yml')
const repository = 'serpcompany/pitonne.jp'

type Classified = {
  docs?: boolean
  content?: boolean
  skip?: boolean
  fast?: boolean
  receipts?: boolean
}

const lookedUp = (skipped: boolean, receipts: boolean): Record<string, string> => {
  if (skipped) return {}
  const state = receipts ? 'passed' : 'run'
  return { e2e: state, lighthouse: state }
}

const appKey = {
  vars: { SERP_AGENT_APP_ID: '123456' },
  secrets: { SERP_AGENT_PRIVATE_KEY: 'a private key made for CI' }
}

const steps = ({
  docs = false,
  content = false,
  skip = false,
  fast = false,
  receipts = false
}: Classified) => ({
  changes: {
    classify: { docs_only: String(docs), content_only: String(content), skip: String(skip) },
    fast: (docs ? {} : { fast: String(fast) }) as Record<string, string>,
    tree: { tree: 'a1b2c3' },
    receipts: lookedUp(content || docs, receipts)
  }
})

function pullRequest(
  { draft = false, fork = false, ...classified }: Classified & { draft?: boolean; fork?: boolean },
  failing: string[] = []
): Scenario {
  return {
    github: {
      event_name: 'pull_request',
      repository,
      ref_name: '42/merge',
      event: {
        pull_request: {
          number: 42,
          draft,
          base: { ref: 'staging' },
          head: { sha: 'f00d', repo: { full_name: fork ? 'someone/pitonne.jp' : repository } }
        }
      }
    },
    steps: steps(classified),
    failing,
    ...(fork ? {} : appKey)
  }
}

const push = (branch: string, classified: Classified = {}, failing: string[] = []): Scenario => ({
  github: { event_name: 'push', repository, ref_name: branch, event: {} },
  steps: steps(classified),
  failing,
  ...appKey
})

const run = (scenario: Scenario) => simulate(ci, scenario)
const ran = (scenario: Scenario) =>
  Object.entries(run(scenario).results)
    .filter(([, result]) => result !== 'skipped')
    .map(([id, result]) => (result === 'success' ? id : `${id}:${result}`))

const checks = ['changes', 'verify', 'test', 'e2e', 'lighthouse']
const SETUP = 'Set up Node and pnpm, and install'
const SUITES = ['e2e', 'lighthouse']
const VERIFY = 'The shared checks the change can affect, at the version the lockfile pins'
const verified = (scenario: Scenario) => run(scenario).stepEnv('verify', VERIFY).CHECKS
const DOCS_ONLY = ['changes', 'verify']

describe('what CI runs on a pull request into staging', () => {
  it('checks a ready one in full and previews it', () => {
    expect(ran(pullRequest({}))).toEqual([...checks, 'preview'])
    expect(verified(pullRequest({}))).toBe('')
  })

  it('skips the browser journeys and Lighthouse on a draft, until it is marked ready', () => {
    expect(ran(pullRequest({ draft: true }))).toEqual(['changes', 'verify', 'test', 'preview'])
    expect(ci.on.pull_request?.types).toContain('ready_for_review')
  })

  it('previews no pull request from a fork, which gets no secrets, and fails its verify for want of the app key', () => {
    expect(ran(pullRequest({ fork: true }))).toEqual(
      checks.map(id => (id === 'verify' ? 'verify:failure' : id))
    )
  })

  it('runs only verify’s docs and secrets checks on a docs-only one, ready or draft, and previews nothing', () => {
    for (const draft of [false, true]) {
      const docs = pullRequest({ docs: true, draft })
      expect(ran(docs), String(draft)).toEqual(DOCS_ONLY)
      expect(run(docs).results, String(draft)).toMatchObject({
        test: 'skipped',
        e2e: 'skipped',
        lighthouse: 'skipped',
        preview: 'skipped'
      })
      expect(verified(docs), String(draft)).toBe('docs,secrets')
    }
  })

  it('sets up and installs in every check, and in a slow suite only when it runs', () => {
    for (const id of ['verify', 'test', ...SUITES])
      expect(run(pullRequest({})).stepRuns(id, SETUP), id).toBe(true)
    expect(run(pullRequest({ docs: true })).stepRuns('verify', SETUP)).toBe(true)
    const tested = run(push('staging', { receipts: true }))
    for (const suite of SUITES) expect(tested.stepRuns(suite, SETUP), suite).toBe(false)
  })

  it('runs every shared check and fails test, the required check, when the change could not be classified, rather than skip them', () => {
    for (const docs of [false, true]) {
      const failed = pullRequest({ docs }, ['changes'])
      expect(run(failed).results, String(docs)).toMatchObject({
        changes: 'failure',
        verify: 'success',
        test: 'failure',
        e2e: 'skipped',
        lighthouse: 'skipped',
        preview: 'skipped'
      })
      expect(verified(failed), String(docs)).toBe('')
    }
  })

  it('records no receipt, since the pull request’s own code ran in the job that would', () => {
    for (const scenario of [pullRequest({}), pullRequest({ fork: true })])
      for (const suite of ['e2e', 'lighthouse'])
        expect(run(scenario).stepRuns(suite, 'Record that this tree passed')).toBe(false)
    for (const suite of ['e2e', 'lighthouse'])
      expect(run(push('staging')).stepRuns(suite, 'Record that this tree passed')).toBe(true)
  })
})

describe('what CI runs on a push', () => {
  it('checks a code push to staging in full, then deploys Staging', () => {
    expect(ran(push('staging'))).toEqual([...checks, 'deploy'])
    expect(verified(push('staging'))).toBe('')
  })

  it.each([
    'staging',
    'main'
  ])('runs only verify’s docs and secrets checks on a docs-only push to %s, and deploys nothing', branch => {
    const docs = push(branch, { docs: true })
    expect(ran(docs)).toEqual(DOCS_ONLY)
    expect(verified(docs)).toBe('docs,secrets')
    expect(run(docs).results).toMatchObject({
      test: 'skipped',
      e2e: 'skipped',
      lighthouse: 'skipped',
      deploy: 'skipped',
      'deploy-content': 'skipped',
      alert: 'skipped'
    })
    for (const step of ['fast', 'receipts'])
      expect(run(docs).stepRuns('changes', step), step).toBe(false)
  })

  it('alerts on a docs-only push to main whose docs check failed, and on a failed classification', () => {
    expect(ran(push('main', { docs: true }, ['verify']))).toEqual([
      'changes',
      'verify:failure',
      'alert'
    ])
    expect(run(push('main', { docs: true }, ['changes'])).results).toMatchObject({
      verify: 'success',
      test: 'failure',
      deploy: 'skipped',
      'deploy-content': 'skipped',
      alert: 'success'
    })
  })

  it('skips the slow suites and the check build on a tree whose receipts it found', () => {
    const tested = run(push('staging', { receipts: true }))
    expect(ran(push('staging', { receipts: true }))).toEqual([...checks, 'deploy'])
    expect(tested.stepRuns('test', 'Build the production export')).toBe(false)
    expect(
      tested.stepRuns('e2e', 'Run the browser journeys on the export, served as Pages serves it')
    ).toBe(false)
    expect(tested.stepRuns('lighthouse', 'Score eight pages with Lighthouse')).toBe(false)
    expect(tested.stepRuns('test', 'pnpm lint')).toBe(true)
  })

  it('looks up no receipt for a CMS save, so a slow API can’t hold back its deploy', () => {
    const content = run(push('main', { content: true, fast: true }))
    expect(content.stepRuns('changes', 'tree')).toBe(true)
    expect(content.stepRuns('changes', 'receipts')).toBe(false)
    expect(
      content.stepRuns('e2e', 'Run the browser journeys on the export, served as Pages serves it')
    ).toBe(true)
    expect(run(push('main')).stepRuns('changes', 'receipts')).toBe(true)
    expect(run(pullRequest({})).stepRuns('changes', 'receipts')).toBe(false)
  })

  it('deploys a CMS save on main at once, beside the checks, whatever they say', () => {
    expect(ran(push('main', { content: true, fast: true }))).toEqual([...checks, 'deploy-content'])
    expect(verified(push('main', { content: true, fast: true }))).toBe('')
    expect(ran(push('main', { content: true, fast: true }, ['e2e']))).toEqual([
      'changes',
      'verify',
      'test',
      'e2e:failure',
      'lighthouse',
      'deploy-content',
      'alert'
    ])
  })

  it('deploys nothing for a push of draft posts only', () => {
    expect(ran(push('main', { skip: true }))).toEqual(checks)
  })

  it('makes a push that mixes code and content wait for every check before it deploys', () => {
    expect(ran(push('main'))).toEqual([...checks, 'deploy'])
    for (const failing of ['verify', 'test', 'e2e', 'lighthouse']) {
      const results = run(push('main', {}, [failing])).results
      expect(results.deploy, failing).toBe('skipped')
      expect(results.alert, failing).toBe('success')
    }
  })

  it('deploys a promotion, which passed every check on staging, at once', () => {
    expect(ran(push('main', { fast: true, receipts: true }))).toEqual([...checks, 'deploy-content'])
  })

  it('alerts only on main', () => {
    expect(run(push('staging', {}, ['test'])).results.alert).toBe('skipped')
    expect(run(push('main', {}, ['changes'])).results).toMatchObject({
      test: 'failure',
      deploy: 'skipped',
      'deploy-content': 'skipped',
      alert: 'success'
    })
  })
})
