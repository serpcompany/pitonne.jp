import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { type Scenario, simulate } from './job-results'
import { expression, job, readWorkflow, step } from './workflows'

const review = readWorkflow('code-review.yml')
const reviewer = job(review, 'review')
const repository = 'serpcompany/pitonne.jp'
const claude = step(reviewer, 'review')

const pullRequest = (
  login: string,
  { draft = false, fork = false }: { draft?: boolean; fork?: boolean } = {}
): Scenario => ({
  github: {
    event_name: 'pull_request',
    repository,
    event: {
      pull_request: {
        draft,
        user: { login },
        head: { repo: { full_name: fork ? 'someone/pitonne.jp' : repository } }
      }
    }
  }
})

const claudeArgs = String(claude.with?.claude_args)
const toolList = (flag: string) =>
  new RegExp(`${flag} "([^"]+)"`).exec(claudeArgs)?.[1].split(',') ?? []

describe('the Code review workflow', () => {
  it('reviews every push to a ready pull request from this repository, a person’s or an agent’s', () => {
    for (const login of ['octocat', 'serp-agent[bot]'])
      expect(simulate(review, pullRequest(login)).results).toEqual({ review: 'success' })
    expect(review.on.pull_request?.types).toEqual([
      'opened',
      'synchronize',
      'reopened',
      'ready_for_review'
    ])
    expect(review.concurrency).toEqual({
      group: `code-review-${expression('github.event.pull_request.number')}`,
      'cancel-in-progress': true
    })
  })

  it('skips drafts, forks, Claude’s own pull requests and dependency updates', () => {
    const skipped = { review: 'skipped' }
    expect(simulate(review, pullRequest('octocat', { draft: true })).results).toEqual(skipped)
    expect(simulate(review, pullRequest('octocat', { fork: true })).results).toEqual(skipped)
    for (const login of ['claude[bot]', 'dependabot[bot]', 'renovate[bot]'])
      expect(simulate(review, pullRequest(login)).results).toEqual(skipped)
  })

  it('reviews a pull request that changes this workflow too, since no app checks the workflow file', () => {
    expect(Object.keys(review.jobs)).toEqual(['review'])
    expect(reviewer.needs).toBeUndefined()
    expect(JSON.stringify(review)).not.toContain('workflow_ref')
  })

  it('posts with the job’s own token, which can write only the pull request’s comments', () => {
    expect(review.permissions).toEqual({ contents: 'read' })
    expect(reviewer.permissions).toEqual({
      contents: 'read',
      checks: 'read',
      issues: 'read',
      packages: 'read',
      'pull-requests': 'write'
    })
    expect(claude.uses).toMatch(/^anthropics\/claude-code-action@[0-9a-f]{40}$/)
    expect(claude.with?.claude_code_oauth_token).toBe(expression('secrets.CLAUDE_CODE_OAUTH_TOKEN'))
    expect(claude.with?.github_token).toBe(expression('github.token'))
    expect(reviewer.env).toMatchObject({
      REVIEW_BOT: 'github-actions[bot]',
      SUMMARY_BOT: 'github-actions[bot]'
    })
  })

  it('loads no project settings, and lets the reviewer read, comment and start reviewers, never run git or open .git', () => {
    expect(claudeArgs).toContain('--setting-sources user')
    expect(toolList('--allowedTools')).toEqual([
      'mcp__github_inline_comment__create_inline_comment',
      'Bash(gh pr view:*)',
      'Bash(gh pr diff:*)',
      'Bash(gh issue view:*)',
      'Edit(./tmp/review-summary.md)',
      'Agent',
      'Task',
      'Read',
      'Glob',
      'Grep'
    ])
    expect(toolList('--disallowedTools')).toEqual([
      'Read(./.git/**)',
      'Edit(./.git/**)',
      'Read(//proc/**)',
      'Edit(//home/runner/work/_temp/**)',
      'Edit(//home/runner/work/_actions/**)',
      'Edit(//opt/hostedtoolcache/**)',
      'Edit(~/.*/**)'
    ])
    expect(reviewer.env?.SUMMARY_FILE).toBe('tmp/review-summary.md')
    expect(toolList('--allowedTools')).not.toContain('Write')
    const checkout = step(
      reviewer,
      "Check out the whole repository, with its history, at the pull request's head"
    )
    expect(checkout.with?.['persist-credentials']).toBe(false)
  })

  it('starts only once verify and test passed on the head commit, test by being skipped on a docs-only change, and reviews nothing after a failure', () => {
    const wait = step(reviewer, 'fast')
    expect(wait.env?.CHECKS).toBe('verify test')
    expect(wait.run).toContain('commits/$HEAD_SHA/check-runs?check_name=$check')
    expect(wait.run).toContain('case "$check=$state" in')
    expect(wait.run).toContain('*=success|test=skipped) ;;')
    expect(wait.run).not.toContain('verify=skipped')
    const later = reviewer.steps?.slice((reviewer.steps ?? []).indexOf(wait) + 1) ?? []
    for (const each of later)
      expect(each.if ?? '', each.name ?? each.uses).toContain("steps.fast.outputs.passed == 'true'")
  })

  it("runs the review's scripts from the package the default branch's lockfile pins, never from the checkout", () => {
    const take = step(
      reviewer,
      "Take the review's scripts from the @serpcompany/verify the default branch's lockfile pins"
    )
    expect(take.run).toContain('git show "origin/$DEFAULT_BRANCH:pnpm-lock.yaml"')
    expect(take.run).toContain('openssl dgst -sha512 -binary')
    expect(take.run).toContain('if [ "$got" != "$integrity" ]; then')
    const lockfile = fs.readFileSync('pnpm-lock.yaml', 'utf8')
    expect(lockfile).toMatch(
      /^ {2}'@serpcompany\/verify@[\d.]+':\n {4}resolution: \{integrity: sha512-[A-Za-z0-9+/=]+, tarball: https:\/\/npm\.pkg\.github\.com\/download\/@serpcompany\/verify\/[^ }]+\}$/m
    )
    for (const each of reviewer.steps ?? []) {
      expect(each.run ?? '').not.toMatch(/node (tools|scripts)\//)
      if (each.run?.startsWith('node '))
        expect(each.run).toContain('$RUNNER_TEMP/serp-verify/package/dist/review/main.js')
    }
  })

  it('gives a first review to the reviewer at high effort, and a re-review or a small change to the re-reviewer', () => {
    const role = step(reviewer, 'role')
    expect(role.run).toContain('role=reviewer model=claude-opus-5-5 effort=high')
    expect(role.run).toContain('role=reviewer model=claude-opus-5-5 effort=xhigh')
    expect(role.run).toContain('role=re-reviewer model=claude-sonnet-5-5 effort=medium')
    expect(role.run).toContain('if [ -n "$SINCE" ]; then')
    expect(role.env?.SINCE).toBe(expression('steps.context.outputs.since'))
    expect(claude.with?.claude_args).toContain(`--model ${expression('steps.role.outputs.model')}`)
    expect(claude.with?.claude_args).toContain(
      `--effort ${expression('steps.role.outputs.effort')}`
    )
  })

  it('runs no script the reviewer could have rewritten: it takes them again, checked, after the review', () => {
    const steps = reviewer.steps ?? []
    const again = step(
      reviewer,
      'Take the scripts again, so nothing the reviewer wrote runs with the token'
    )
    expect(steps.indexOf(again)).toBeGreaterThan(steps.indexOf(claude))
    expect(again.env).toMatchObject({
      TARBALL: expression('steps.scripts.outputs.tarball'),
      INTEGRITY: expression('steps.scripts.outputs.integrity')
    })
    expect(again.run?.split('\n')[0]).toBe('rm -rf "$RUNNER_TEMP/serp-verify"')
    expect(again.run).toContain('if [ "$got" != "$INTEGRITY" ]; then')
    const after = steps.slice(steps.indexOf(again) + 1).filter(each => each.run)
    expect(after.map(each => each.run)).toEqual([
      'node "$RUNNER_TEMP/serp-verify/package/dist/review/main.js" summary',
      'node "$RUNNER_TEMP/serp-verify/package/dist/review/main.js" verdict'
    ])
  })

  it('limits each step in time, so a hung review still reports', () => {
    expect(step(reviewer, 'fast')['timeout-minutes']).toBe(25)
    expect(claude['timeout-minutes']).toBe(20)
    expect(reviewer['timeout-minutes']).toBeGreaterThan(25 + 20)
  })
})
