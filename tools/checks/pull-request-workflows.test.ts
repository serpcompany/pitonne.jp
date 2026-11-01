import { describe, expect, it } from 'vitest'
import { type Scenario, simulate } from './job-results'
import { checkNames, closedOnMergeInto } from './pull-request.mjs'
import { expression, readWorkflow, scripts } from './workflows'

const rules = readWorkflow('pull-request.yml')
const closing = readWorkflow('close-issues.yml')
const repository = 'serpcompany/pitonne.jp'

const opened = (login: string, more: Record<string, unknown> = {}): Scenario => ({
  github: {
    event_name: 'pull_request',
    repository,
    event: {
      pull_request: {
        user: { login },
        draft: false,
        merged: false,
        head: { repo: { full_name: repository } },
        ...more
      }
    }
  }
})

describe('the Pull request workflow', () => {
  it('runs one job per check, named as the check, on every pull request and every edit of its text', () => {
    expect(Object.keys(rules.jobs)).toEqual(checkNames)
    expect(rules.on.pull_request?.types).toEqual([
      'opened',
      'edited',
      'reopened',
      'synchronize',
      'ready_for_review'
    ])
    expect(JSON.stringify(rules.on)).not.toContain('paths')
  })

  it('checks out only the script, and verify.json for the test patterns, and installs nothing', () => {
    for (const [name, job] of Object.entries(rules.jobs)) {
      const [checkout, check] = job.steps ?? []
      expect(job.steps, name).toHaveLength(2)
      expect(checkout.uses).toMatch(/^actions\/checkout@[0-9a-f]{40}$/)
      expect(checkout.with).toMatchObject({
        'sparse-checkout-cone-mode': false,
        'persist-credentials': false
      })
      const files = String(checkout.with?.['sparse-checkout']).trim().split('\n')
      expect(files).toEqual(
        name === 'fix-test'
          ? ['tools/checks/pull-request.mjs', 'verify.json']
          : ['tools/checks/pull-request.mjs']
      )
      expect(check.run).toBe(`node tools/checks/pull-request.mjs ${name}`)
    }
  })

  it('reads the title and body from the event file, never through the environment or the command line', () => {
    for (const [name, job] of Object.entries(rules.jobs)) {
      const env = job.steps?.[1].env ?? {}
      expect(env, name).toEqual(
        ['issue-link', 'fix-test'].includes(name)
          ? { GITHUB_TOKEN: expression('github.token') }
          : {}
      )
    }
    expect(JSON.stringify(rules)).not.toMatch(/pull_request\.(title|body)/)
  })

  it('only reads', () => {
    expect(rules.permissions).toEqual({
      contents: 'read',
      'pull-requests': 'read',
      issues: 'read'
    })
    for (const job of Object.values(rules.jobs)) expect(job.permissions).toBeUndefined()
  })

  it('runs every check for people and agents alike; the script exempts dependency bots itself', () => {
    for (const login of ['octocat', 'serp-agent[bot]', 'dependabot[bot]']) {
      expect(Object.values(simulate(rules, opened(login)).results)).toEqual(
        checkNames.map(() => 'success')
      )
    }
  })
})

describe('the Close issues workflow', () => {
  const job = closing.jobs.close

  it('runs when a pull request into staging closes, and closes issues only when it merged', () => {
    expect(closing.on).toEqual({
      pull_request_target: { types: ['closed'], branches: [closedOnMergeInto] }
    })
    const merged = (value: boolean) =>
      simulate(closing, opened('octocat', { merged: value, base: { ref: closedOnMergeInto } }))
        .results.close
    expect(merged(true)).toBe('success')
    expect(merged(false)).toBe('skipped')
  })

  it('runs the base branch’s own script with the job’s token, which may only write issues', () => {
    expect(closing.permissions).toEqual({ contents: 'read' })
    expect(job.permissions).toEqual({ contents: 'read', issues: 'write' })
    const [checkout] = job.steps ?? []
    expect(checkout.with?.ref).toBeUndefined()
    expect(checkout.with).toMatchObject({ 'persist-credentials': false })
    expect(String(checkout.with?.['sparse-checkout']).trim().split('\n')).toEqual([
      'tools/checks/pull-request.mjs',
      'tools/checks/close-issues.mjs'
    ])
    expect(scripts(job)).toBe('node tools/checks/close-issues.mjs')
    expect(job.steps?.[1].env).toEqual({ GITHUB_TOKEN: expression('github.token') })
  })
})
