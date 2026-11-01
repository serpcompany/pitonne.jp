import { describe, expect, it } from 'vitest'
import { type Scenario, simulate } from './job-results'
import { readWorkflow } from './workflows'

const ci = readWorkflow('ci.yml')
const repository = 'serpcompany/pitonne.jp'

type Classified = { docs?: boolean; skip?: boolean; fast?: boolean; receipts?: boolean }

const steps = ({ docs = false, skip = false, fast = false, receipts = false }: Classified) => ({
  changes: {
    classify: { docs_only: String(docs), skip: String(skip) },
    fast: { fast: String(fast) },
    receipts: {
      tree: 'a1b2c3',
      e2e: receipts ? 'passed' : 'run',
      lighthouse: receipts ? 'passed' : 'run'
    }
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
    failing
  }
}

const push = (branch: string, classified: Classified = {}, failing: string[] = []): Scenario => ({
  github: { event_name: 'push', repository, ref_name: branch, event: {} },
  steps: steps(classified),
  failing
})

const run = (scenario: Scenario) => simulate(ci, scenario)
const ran = (scenario: Scenario) =>
  Object.entries(run(scenario).results)
    .filter(([, result]) => result !== 'skipped')
    .map(([id, result]) => (result === 'success' ? id : `${id}:${result}`))

const checks = ['changes', 'verify', 'test', 'e2e', 'lighthouse']

describe('what CI runs on a pull request into staging', () => {
  it('checks a ready one in full and previews it', () => {
    expect(ran(pullRequest({}))).toEqual([...checks, 'preview'])
  })

  it('skips the browser journeys and Lighthouse on a draft, until it is marked ready', () => {
    expect(ran(pullRequest({ draft: true }))).toEqual(['changes', 'verify', 'test', 'preview'])
    expect(ci.on.pull_request?.types).toContain('ready_for_review')
  })

  it('previews no pull request from a fork, which gets no secrets', () => {
    expect(ran(pullRequest({ fork: true }))).toEqual(checks)
  })

  it('reports every check on a docs-only change, but builds and drives nothing', () => {
    const docs = run(pullRequest({ docs: true }))
    expect(ran(pullRequest({ docs: true }))).toEqual([...checks, 'preview'])
    expect(docs.stepRuns('test', 'pnpm test')).toBe(true)
    expect(docs.stepRuns('test', 'Build the production export')).toBe(false)
    expect(
      docs.stepRuns('e2e', 'Run the browser journeys on the export, served as Pages serves it')
    ).toBe(false)
    expect(docs.stepRuns('lighthouse', 'Score eight pages with Lighthouse')).toBe(false)
    const code = run(pullRequest({}))
    expect(code.stepRuns('test', 'Build the production export')).toBe(true)
    expect(
      code.stepRuns('e2e', 'Run the browser journeys on the export, served as Pages serves it')
    ).toBe(true)
  })

  it('fails test, the required check, when the change could not be classified, rather than skip it', () => {
    expect(run(pullRequest({}, ['changes'])).results).toMatchObject({
      changes: 'failure',
      test: 'failure',
      e2e: 'skipped',
      preview: 'skipped'
    })
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
  })

  it('builds and drives a docs-only push like any other, since its checks vouch for the commits under it', () => {
    const docs = run(push('staging', { docs: true }))
    expect(ran(push('staging', { docs: true }))).toEqual([...checks, 'deploy'])
    expect(docs.stepRuns('test', 'Build the production export')).toBe(true)
    expect(
      docs.stepRuns('e2e', 'Run the browser journeys on the export, served as Pages serves it')
    ).toBe(true)
    expect(docs.stepRuns('lighthouse', 'Score eight pages with Lighthouse')).toBe(true)
    const tested = run(push('staging', { docs: true, receipts: true }))
    expect(tested.stepRuns('test', 'Build the production export')).toBe(false)
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

  it('deploys a CMS save on main at once, beside the checks, whatever they say', () => {
    expect(ran(push('main', { fast: true }))).toEqual([...checks, 'deploy-content'])
    expect(ran(push('main', { fast: true }, ['e2e']))).toEqual([
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
