import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { matchesAnyGlob, pullRequestOf, runCheck, testsOf } from './pull-request.mjs'

const repository = 'serpcompany/pitonne.jp'

function linking(linked: number[]) {
  const asked: string[] = []
  const api = {
    issueState: async (_: string, number: number) => {
      asked.push(`issue ${number}`)
      return 'open'
    },
    closingIssues: async () => {
      asked.push('linked')
      return linked
    }
  }
  return { api, asked }
}

const pull = (base: string, head: string, body = '') => ({
  number: 42,
  title: 'feat: the form opens',
  body,
  author: 'octocat',
  base,
  head,
  fromThisRepository: true
})

const issueLink = (
  given: ReturnType<typeof pull>,
  defaultBranch: string,
  linked: number[] = []
) => {
  const { api, asked } = linking(linked)
  const verdict = runCheck('issue-link', {
    pull: given,
    repository,
    defaultBranch,
    api,
    attempts: 1
  })
  return verdict.then(found => ({ ...found, asked }))
}

describe('issue-link on each branch', () => {
  it.each([
    ['a release', pull('main', 'release-please--branches--main')],
    ['a promotion', pull('main', 'staging')]
  ])('exempts %s without asking GitHub', async (_, given) => {
    expect(await issueLink(given, 'main')).toEqual({
      passed: true,
      message: 'Exempt: a dependency update, a release, or a promotion.',
      asked: []
    })
  })

  it('warns that GitHub won’t close issues on a merge into main once staging is the default branch', async () => {
    const verdict = await issueLink(
      pull('main', 'hotfix-1', 'Closes #3\nFixes octo/other#4'),
      'staging'
    )
    expect(verdict).toEqual({
      passed: true,
      message:
        "::warning::GitHub won't close #3 octo/other#4 on a merge into main. Close it by hand after the merge.",
      asked: []
    })
  })

  it('asks GitHub for the issues it linked to a pull request into the default branch', async () => {
    const intoStaging = await issueLink(
      pull('staging', 'issue-3-form', 'Closes #3'),
      'staging',
      [3]
    )
    expect(intoStaging).toEqual({ passed: true, message: 'Closes #3', asked: ['linked'] })
    const intoMain = await issueLink(pull('main', 'hotfix-1'), 'staging', [5])
    expect(intoMain).toEqual({ passed: true, message: 'Closes #5', asked: ['linked'] })
  })
})

describe('reading the pull request from the event', () => {
  const event = (headRepository: unknown) => ({
    pull_request: {
      number: 42,
      title: 'chore: promote',
      body: '',
      user: { login: 'octocat' },
      base: { ref: 'main', repo: { full_name: repository } },
      head: { ref: 'staging', repo: headRepository },
      merge_commit_sha: null
    }
  })

  it('counts a pull request as from this repository only when its head is here', () => {
    expect(pullRequestOf(event({ full_name: repository }))?.fromThisRepository).toBe(true)
    expect(pullRequestOf(event({ full_name: 'fork/pitonne.jp' }))?.fromThisRepository).toBe(false)
    expect(pullRequestOf(event(null))?.fromThisRepository).toBe(false)
  })

  it('reads no pull request from an event without one', () => {
    expect(pullRequestOf({})).toBeNull()
  })
})

describe('the test patterns', () => {
  it('falls back to the usual test files and fix/ branches when the checkout has no verify.json', () => {
    const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'pull-request-'))
    try {
      const tests = testsOf(folder)
      expect(tests.fixBranches).toEqual(['fix/'])
      expect(matchesAnyGlob(tests.patterns, 'src/lib/a.test.ts')).toBe(true)
      expect(matchesAnyGlob(tests.patterns, 'tests/test_form.py')).toBe(true)
      expect(matchesAnyGlob(tests.patterns, 'scripts/smoke-form.mjs')).toBe(false)
    } finally {
      fs.rmSync(folder, { recursive: true, force: true })
    }
  })

  it('reads nested braces, ? and a trailing **, and an unclosed brace as itself', () => {
    expect(matchesAnyGlob(['**/*.{test,spec{,s}}.ts'], 'src/a.specs.ts')).toBe(true)
    expect(matchesAnyGlob(['**/*.{test,spec{,s}}.ts'], 'src/a.spec.ts')).toBe(true)
    expect(matchesAnyGlob(['**/*.{test,spec{,s}}.ts'], 'src/a.specz.ts')).toBe(false)
    expect(matchesAnyGlob(['e2e/**'], 'e2e/journeys/form.ts')).toBe(true)
    expect(matchesAnyGlob(['test_?.py'], 'test_a.py')).toBe(true)
    expect(matchesAnyGlob(['test_?.py'], 'test_ab.py')).toBe(false)
    expect(matchesAnyGlob(['src/{a.ts'], 'src/{a.ts')).toBe(true)
    expect(matchesAnyGlob(['src/{a.ts'], 'src/a.ts')).toBe(false)
  })
})
