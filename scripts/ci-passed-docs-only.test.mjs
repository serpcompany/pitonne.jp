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
import { checksPassedUnderDocs, ciWorkflow, docsOnlyChain, walkLimit } from './ci-passed.mjs'

afterEach(removeScratchHistories)

const outcomes = {
  passed: allPassed,
  docs: () => [job('verify'), ...checks.slice(1).map(name => job(name, 'skipped'))],
  failed: () => [job('verify'), job('test'), job('e2e', 'failure'), job('lighthouse')]
}

function gitHubWith(results) {
  const answers = {}
  let id = 0
  for (const [commit, outcome] of Object.entries(results)) {
    if (outcome instanceof Error) answers[runsPathOf(commit)] = outcome
    else if (outcome === 'none') answers[runsPathOf(commit)] = { workflow_runs: [] }
    else {
      id++
      answers[runsPathOf(commit)] = { workflow_runs: [ciPushRun(id, { head_sha: commit })] }
      answers[jobsPath(id)] = { jobs: outcomes[outcome]() }
    }
  }
  return fakeGitHub(answers)
}

async function passedFrom(git, tip, results, limit) {
  const { read, asked } = gitHubWith(results)
  const log = []
  const passed = await checksPassedUnderDocs(read, git, {
    repository,
    sha: tip,
    checks,
    branches: ['staging'],
    log: line => log.push(line),
    limit
  })
  return { passed, log, asked }
}

describe('a commit that changes only docs counts as passed only through a tested commit under it', () => {
  it('counts a docs-only commit on a commit that passed', async () => {
    const { commit, git } = scratchHistory()
    const code = commit('src/a.ts')
    const docs = commit('docs/a.md')
    const { passed, log, asked } = await passedFrom(git, docs, { [docs]: 'docs', [code]: 'passed' })
    expect(passed).toBe(true)
    expect(asked).toEqual([runsPathOf(docs), jobsPath(1), runsPathOf(code), jobsPath(2)])
    expect(log).toEqual([
      `${docs} changes only docs since ${code}, so a pass on either, or on a commit between them, counts.`,
      `${checks.join(', ')} passed on ${code} in CI's push run 2 on staging.`
    ])
  })

  it('refuses a docs-only commit on a commit that failed, whose own run skipped the suites', async () => {
    const { commit, git } = scratchHistory()
    const code = commit('src/a.ts')
    const docs = commit('docs/a.md')
    const { passed, log } = await passedFrom(git, docs, { [docs]: 'docs', [code]: 'failed' })
    expect(passed).toBe(false)
    expect(log.at(-1)).toBe(
      `${checks.join(', ')} didn't all pass on ${docs} or ${code} in one run of ${ciWorkflow} for a push to staging.`
    )
  })

  it('walks a chain of docs-only commits, under docs/, at the root and in skills', async () => {
    const { commit, git } = scratchHistory()
    const code = commit('src/a.ts')
    const first = commit('docs/a.md')
    const second = commit('NOTES.md', 'docs/agents/b.md')
    const third = commit('.claude/skills/some-skill/SKILL.md')
    expect(docsOnlyChain(git, third)).toEqual([third, second, first, code])
    const results = { [third]: 'docs', [second]: 'none', [first]: 'docs', [code]: 'passed' }
    expect((await passedFrom(git, third, results)).passed).toBe(true)
    expect((await passedFrom(git, third, { ...results, [code]: 'failed' })).passed).toBe(false)
  })

  it('counts a docs-only commit whose own push run passed every check, as when code came in the same push', async () => {
    const { commit, git } = scratchHistory()
    const code = commit('src/a.ts')
    const docs = commit('docs/a.md')
    const { passed, asked } = await passedFrom(git, docs, { [docs]: 'passed', [code]: 'none' })
    expect(passed).toBe(true)
    expect(asked).toEqual([runsPathOf(docs), jobsPath(1)])
  })

  it('stops at the first commit that changes more than docs, CMS content included', async () => {
    const { commit, git } = scratchHistory()
    const code = commit('src/a.ts')
    const content = commit('content/blog/post.md')
    const data = commit('docs/image-audit/sheet-image-manifest.json')
    const docs = commit('docs/a.md')
    expect(docsOnlyChain(git, docs)).toEqual([docs, data])
    commit('docs/agents/ci.md')
    const results = { [docs]: 'docs', [data]: 'docs', [content]: 'docs', [code]: 'passed' }
    expect((await passedFrom(git, docs, results)).passed).toBe(false)
    expect(docsOnlyChain(git, content)).toEqual([content])
  })

  it('walks through a merge that brings in only docs, and needs one that brings in more to pass itself', async () => {
    const { commit, run, git } = scratchHistory()
    const code = commit('src/a.ts')
    run('switch', '--quiet', '-c', 'side')
    commit('docs/a.md')
    run('switch', '--quiet', 'staging')
    run('merge', '--quiet', '--no-ff', '--no-edit', 'side')
    const docsMerge = run('rev-parse', 'HEAD')
    expect(docsOnlyChain(git, docsMerge)).toEqual([docsMerge, code])
    expect(
      (await passedFrom(git, docsMerge, { [docsMerge]: 'docs', [code]: 'passed' })).passed
    ).toBe(true)
    run('switch', '--quiet', 'side')
    commit('src/b.ts')
    run('switch', '--quiet', 'staging')
    run('merge', '--quiet', '--no-ff', '--no-edit', 'side')
    const codeMerge = run('rev-parse', 'HEAD')
    expect(docsOnlyChain(git, codeMerge)).toEqual([codeMerge])
    expect((await passedFrom(git, codeMerge, { [codeMerge]: 'failed' })).passed).toBe(false)
  })

  it(`gives up after ${walkLimit} docs-only commits, and asks GitHub nothing`, async () => {
    expect(walkLimit).toBe(50)
    const { commit, git } = scratchHistory()
    const code = commit('src/a.ts')
    const docs = [1, 2, 3].map(n => commit(`docs/${n}.md`))
    expect(docsOnlyChain(git, docs[2], 3)).toEqual([...docs.reverse(), code])
    const fourth = commit('docs/4.md')
    expect(docsOnlyChain(git, fourth, 3)).toBeNull()
    const { passed, log, asked } = await passedFrom(git, fourth, { [code]: 'passed' }, 3)
    expect(passed).toBe(false)
    expect(asked).toEqual([])
    expect(log).toEqual([
      `${fourth} is more than 3 docs-only commits above any other, so it counts as not passed.`
    ])
  })

  it('says not passed when git can’t read the commit, or GitHub fails on any commit it asks about', async () => {
    const { commit, git } = scratchHistory()
    const code = commit('src/a.ts')
    const missing = await passedFrom(git, 'f'.repeat(40), { [code]: 'passed' })
    expect(missing.passed).toBe(false)
    expect(missing.asked).toEqual([])
    expect(missing.log[0]).toMatch(/^::warning::Couldn't read the commits under f{40}: /)
    const docs = commit('docs/a.md')
    const failing = await passedFrom(git, docs, {
      [docs]: new Error('GET … returned 502'),
      [code]: 'passed'
    })
    expect(failing.passed).toBe(false)
    expect(failing.asked).toEqual([runsPathOf(docs)])
  })
})
