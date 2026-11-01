import { describe, expect, it, test } from 'vitest'
import { runAgainstGitHub } from './github-stub'
import {
  closingReferences,
  exemptFromIssueLink,
  fixWithoutTest,
  isConventionalTitle,
  isFix,
  issueRule,
  linesWithLocalPaths,
  localPathRule,
  localPathsExemption,
  matchesAnyGlob,
  noIssueReason,
  otherBase,
  patiently,
  pullRequestLines,
  runCheck,
  stagingNote,
  testsOf,
  titleRule
} from './pull-request.mjs'

const repository = 'serpcompany/pitonne.jp'
const tests = testsOf(process.cwd())

type Pull = {
  number: number
  title: string
  body: string
  author: string
  base: string
  head: string
  fromThisRepository: boolean
}

const pull = (more: Partial<Pull> = {}): Pull => ({
  number: 42,
  title: 'feat: the contact page opens the form',
  body: '',
  author: 'octocat',
  base: 'staging',
  head: 'issue-12-contact-form',
  fromThisRepository: true,
  ...more
})

function fakeApi({
  states = {},
  linked = [],
  changed = []
}: {
  states?: Record<number, string | null>
  linked?: number[][]
  changed?: string[]
} = {}) {
  const asked: string[] = []
  let looks = 0
  return {
    asked,
    api: {
      issueState: async (_: string, number: number) => {
        asked.push(`issue ${number}`)
        return states[number] ?? null
      },
      closingIssues: async () => {
        asked.push('linked')
        return linked[looks++] ?? []
      },
      changedFiles: async () => {
        asked.push('files')
        return changed
      }
    }
  }
}

const check = (name: string, given: Pull, api = fakeApi().api) =>
  runCheck(name, {
    pull: given,
    repository,
    defaultBranch: 'main',
    tests,
    api,
    wait: async () => {}
  })

describe('title', () => {
  test.each([
    'fix: Escape closes the Settings window',
    'feat(blog): categories list their posts',
    'chore!: drop Node 22',
    'ci: every action is pinned'
  ])('takes %s as a Conventional Commit title', title => {
    expect(isConventionalTitle(title)).toBe(true)
  })

  test.each([
    'Add a cancellation policy',
    'content(blog): align two posts',
    'fix:no space',
    'fix: ',
    'Fix: capitalised',
    'feat(Blog): a capital in the scope'
  ])("doesn't take %s", title => {
    expect(isConventionalTitle(title)).toBe(false)
  })

  it('explains a plain title with the rule', async () => {
    const verdict = await check('title', pull({ title: 'Update the footer' }))
    expect(verdict).toEqual({ passed: false, message: `"Update the footer"\n\n${titleRule}` })
  })
})

describe('issue-link', () => {
  it('reads the reason from a line that says there is no issue', () => {
    expect(noIssueReason('No issue: a typo in a workflow name\n\n## Why')).toBe(
      'No issue: a typo in a workflow name'
    )
    expect(noIssueReason('## Why\nno issue: found while reviewing')).toBe(
      'no issue: found while reviewing'
    )
    expect(noIssueReason('No issue:\n')).toBeUndefined()
    expect(noIssueReason('There is no issue: see below')).toBeUndefined()
  })

  it('reads the issues a description closes from its closing keywords', () => {
    expect(
      closingReferences(
        'Closes #542\nfixes: #12, Resolved serpcompany/serp#7 and closes https://github.com/a/b/issues/9.\nFixes\t#22',
        repository
      )
    ).toEqual([
      { repository: '', number: 542 },
      { repository: '', number: 12 },
      { repository: 'serpcompany/serp', number: 7 },
      { repository: 'a/b', number: 9 },
      { repository: '', number: 22 }
    ])
    expect(
      closingReferences(
        'Closes #18, closes SerpCompany/Pitonne.jp#18, and CLOSES https://github.com/serpcompany/pitonne.jp/issues/18',
        repository
      )
    ).toEqual([{ repository: '', number: 18 }])
  })

  test.each([
    ['in inline code', 'Write `Closes #13` in the body.'],
    ['in a fenced block', 'Before\n```md\nCloses #14\n```\nafter'],
    ['in a fence that is never closed', 'Before\n```\nCloses #14\nto the end'],
    ['in an HTML comment', ['<!', '-- Closes #20 --', '>'].join('')],
    ['too large to be an issue', 'Closes #99999999999'],
    ['after a word that only ends like a keyword', 'a bug-fix #17, a hotfix #21, a prefix #6'],
    ['after a word that closes nothing', 'Part of #3, refs #4, encloses #5']
  ])('reads no issue from a number %s, where GitHub links nothing', (_, body) => {
    expect(closingReferences(body, repository)).toEqual([])
  })

  it('passes a pull request into staging that names an open issue, without asking GitHub to link it', async () => {
    const { api, asked } = fakeApi({ states: { 12: 'open' } })
    const verdict = await check('issue-link', pull({ body: 'Closes #12\n\nThe form opens.' }), api)
    expect(verdict.passed).toBe(true)
    expect(verdict.message).toContain('Closes #12, which the Close issues workflow closes')
    expect(asked).toEqual(['issue 12'])
  })

  it('warns about an issue that is already closed or lives in another repository', async () => {
    const { api } = fakeApi({ states: { 12: 'closed' } })
    const verdict = await check(
      'issue-link',
      pull({ body: 'Closes #12\nCloses serpcompany/serp#7' }),
      api
    )
    expect(verdict.passed).toBe(true)
    expect(verdict.message).toContain('::warning::#12 is already closed.')
    expect(verdict.message).toContain('::warning::Close serpcompany/serp#7 by hand')
  })

  it('fails a pull request into staging that names a missing issue or a pull request', async () => {
    const { api } = fakeApi({ states: { 12: 'open', 13: 'pull request' } })
    const verdict = await check(
      'issue-link',
      pull({ body: 'Closes #12\nFixes #13\nFixes #99' }),
      api
    )
    expect(verdict.passed).toBe(false)
    expect(verdict.message).toContain('#13 is a pull request, not an issue.')
    expect(verdict.message).toContain(`#99 isn't an issue in ${repository}.`)
  })

  it('fails a pull request into staging that names no issue of this repository', async () => {
    for (const body of ['The form opens.', 'Part of #12', 'Closes serpcompany/serp#7']) {
      const verdict = await check('issue-link', pull({ body }))
      expect(verdict).toEqual({ passed: false, message: `${issueRule}\n\n${stagingNote}` })
    }
  })

  it('takes a stated reason without asking GitHub', async () => {
    const { api, asked } = fakeApi()
    const verdict = await check(
      'issue-link',
      pull({ body: 'No issue: a doc fix found on the way' }),
      api
    )
    expect(verdict).toEqual({ passed: true, message: 'No issue: a doc fix found on the way' })
    expect(asked).toEqual([])
  })

  it('asks GitHub three times, five seconds apart, for the issues it linked to a pull request into main', async () => {
    const linked = fakeApi({ linked: [[], [], [12]] })
    const into = pull({ base: 'main', head: 'issue-12-hotfix', body: 'Closes #12' })
    expect(await check('issue-link', into, linked.api)).toEqual({
      passed: true,
      message: 'Closes #12'
    })
    expect(linked.asked).toEqual(['linked', 'linked', 'linked'])
    const never = fakeApi()
    expect(await check('issue-link', into, never.api)).toEqual({
      passed: false,
      message: issueRule
    })
    const waited: number[] = []
    await patiently(async () => [], {
      wait: async (milliseconds: number) => void waited.push(milliseconds)
    })
    expect(waited).toEqual([5000, 5000])
  })

  it('tells a stacked pull request why GitHub links no issue to it yet', async () => {
    const verdict = await check('issue-link', pull({ base: 'issue-12-parent', body: 'Closes #13' }))
    expect(verdict).toEqual({
      passed: false,
      message: `${issueRule}\n\n${otherBase('issue-12-parent', 'main')}`
    })
    expect(otherBase('main', 'main')).toBe('')
  })

  it('exempts dependency updates, releases and promotions between main and staging, but not a fork', () => {
    expect(exemptFromIssueLink(pull({ author: 'dependabot[bot]' }))).toBe(true)
    expect(exemptFromIssueLink(pull({ head: 'release-please--branches--main' }))).toBe(true)
    expect(exemptFromIssueLink(pull({ base: 'main', head: 'staging' }))).toBe(true)
    expect(exemptFromIssueLink(pull({ base: 'staging', head: 'main' }))).toBe(true)
    expect(
      exemptFromIssueLink(pull({ base: 'staging', head: 'main', fromThisRepository: false }))
    ).toBe(false)
    expect(exemptFromIssueLink(pull({ author: 'serp-agent[bot]' }))).toBe(false)
  })
})

describe('fix-test', () => {
  test.each([
    'src/lib/seo.test.ts',
    'src/components/header.dom.test.tsx',
    'scripts/deploy-target.test.mjs',
    'tools/checks/pull-request.test.ts',
    'e2e/navigation.spec.ts',
    'scripts/smoke-environment.mjs',
    'scripts/smoke-canonical-host.mjs'
  ])('counts %s as a test', path => {
    expect(matchesAnyGlob(tests.patterns, path)).toBe(true)
  })

  test.each([
    'src/lib/seo.ts',
    'e2e/fixtures.ts',
    'scripts/deploy-target.mjs',
    '.github/workflows/ci.yml',
    'docs/agents/ci.md'
  ])("doesn't count %s as a test", path => {
    expect(matchesAnyGlob(tests.patterns, path)).toBe(false)
  })

  it('needs a test among the changes of a pull request titled fix: or from a fix/ branch', () => {
    expect(isFix('fix/115-remove-us-phone', 'feat: x', tests.fixBranches)).toBe(true)
    expect(isFix('issue-12-x', 'fix(contact): the number is Japanese', tests.fixBranches)).toBe(
      true
    )
    expect(isFix('issue-12-x', 'docs: fix: is a type', tests.fixBranches)).toBe(false)
    expect(fixWithoutTest('issue-12-x', 'fix: x', ['src/lib/seo.ts'], tests)).toBe(true)
    expect(
      fixWithoutTest('issue-12-x', 'fix: x', ['src/lib/seo.ts', 'src/lib/seo.test.ts'], tests)
    ).toBe(false)
  })

  it('lists the changed files and the rule, and reads no files when the pull request is no fix', async () => {
    const { api, asked } = fakeApi({ changed: ['src/lib/seo.ts'] })
    const verdict = await check('fix-test', pull({ title: 'fix: titles fit' }), api)
    expect(verdict.passed).toBe(false)
    expect(verdict.message).toContain('Changes no test:\nsrc/lib/seo.ts')
    const plain = fakeApi()
    expect(await check('fix-test', pull(), plain.api)).toEqual({
      passed: true,
      message: 'Not a fix.'
    })
    expect(plain.asked).toEqual([])
    expect(asked).toEqual(['files'])
  })
})

describe('text', () => {
  test.each([
    'Built it in /Users/alice/code/site',
    'See /home/bob/out',
    'Copied from ~/Downloads',
    String.raw`Ran from C:\Users\labou\AppData`,
    'Wrote /tmp/report.txt',
    'In tmp/review-change first',
    'The scratchpad held it',
    'From .claude/worktrees/issue-12'
  ])('flags %s', line => {
    expect(linesWithLocalPaths([line])).toEqual([{ number: 1, line }])
  })

  test.each([
    'Changed src/home/page.tsx',
    'See https://example.com/Users/alice/tmp/x',
    'Ran `pnpm check`, which passed'
  ])('passes %s', line => {
    expect(linesWithLocalPaths([line])).toEqual([])
  })

  it('reads the title as line 1 and exempts a pull request that says why it names local paths', async () => {
    expect(pullRequestLines('feat: x', 'one\r\ntwo\n\n')).toEqual(['feat: x', 'one', 'two'])
    expect(localPathsExemption(['feat: x', 'Local paths: it documents the hook'])).toBe(
      'Local paths: it documents the hook'
    )
    expect(localPathsExemption(['feat: x', 'Local paths:'])).toBeUndefined()
    const verdict = await check('text', pull({ body: 'Body\nWrote /tmp/report.txt' }))
    expect(verdict.passed).toBe(false)
    expect(verdict.message).toContain('(line 3): Wrote /tmp/report.txt')
    expect(verdict.message).toContain(localPathRule)
  })
})

describe('every check', () => {
  it('passes a pull request from a dependency bot without reading it, and refuses an unknown check', async () => {
    const bot = pull({ author: 'renovate[bot]', title: 'Update dependency x' })
    for (const name of ['title', 'issue-link', 'fix-test', 'text'])
      expect(await check(name, bot)).toEqual({
        passed: true,
        message: 'Exempt: opened by renovate[bot].'
      })
    expect((await check('branch', pull())).passed).toBe(false)
  })

  it('reads the pull request from the event file and GitHub from its API, never from the command line', async () => {
    const event = {
      pull_request: {
        number: 42,
        title: 'feat: the form opens; $(rm -rf .)',
        body: 'Closes #3',
        user: { login: 'octocat' },
        base: { ref: 'staging', repo: { full_name: repository } },
        head: { ref: 'issue-3-form', repo: { full_name: repository } }
      },
      repository: { full_name: repository, default_branch: 'main' }
    }
    const route = ({ method, path }: { method: string; path: string }) =>
      method === 'GET' && path === `/repos/${repository}/issues/3`
        ? { status: 200, body: { number: 3, state: 'open' } }
        : undefined
    const linked = await runAgainstGitHub('tools/checks/pull-request.mjs', ['issue-link'], {
      event,
      route
    })
    expect(linked.status).toBe(0)
    expect(linked.output).toContain('Closes #3')
    const titled = await runAgainstGitHub('tools/checks/pull-request.mjs', ['title'], {
      event: { ...event, pull_request: { ...event.pull_request, title: 'Make $(rm -rf .) work' } },
      route
    })
    expect(titled.status).toBe(1)
    expect(titled.output).toContain('"Make $(rm -rf .) work"')
    expect(titled.requests).toEqual([])
  })
})
