import fs from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { removeScratchHistories, scratchHistory } from '../tools/checks/ci-passed-fixtures'
import { runScript } from '../tools/checks/github-stub'
import { main } from './draft-only-change.mjs'

const draft = title => `---\ntitle: ${title}\ndraft: true\n---\nBody`
const published = title => `---\ntitle: ${title}\ndraft: false\n---\nBody`

afterEach(removeScratchHistories)

function history() {
  const scratch = scratchHistory()
  const base = scratch.save({
    'src/a.ts': 'export {}\n',
    'content/blog/old-draft.md': draft('Old'),
    'content/blog/ja/kept.md': draft('Kept')
  })
  return { ...scratch, base }
}

async function compared(folder, args) {
  const output = path.join(folder, '.git', 'github-output')
  fs.writeFileSync(output, '')
  const run = await runScript(main, args, { cwd: folder, env: { GITHUB_OUTPUT: output } })
  return { ...run, written: fs.readFileSync(output, 'utf8') }
}

const outputs = (skip, contentOnly, docsOnly) =>
  `skip=${skip}\ncontent_only=${contentOnly}\ndocs_only=${docsOnly}\n`

describe('draft-only-change.mjs on a push', () => {
  it('skips the deploy when the push only edits, adds or deletes draft posts', async () => {
    const { folder, save, base } = history()
    const after = save({
      'content/blog/ja/kept.md': draft('Kept, edited'),
      'content/blog/new.md': draft('New'),
      'content/blog/old-draft.md': null
    })
    const run = await compared(folder, [base, after])
    expect(run.status).toBe(0)
    expect(run.output).toBe('Only draft blog posts changed; skipping deploy.\n')
    expect(run.written).toBe(outputs(true, true, false))
  })

  it('takes the content fast path when a post is published', async () => {
    const { folder, save, base } = history()
    const after = save({ 'content/blog/ja/kept.md': published('Kept') })
    const run = await compared(folder, [base, after])
    expect(run.output).toBe('Only CMS content changed.\n')
    expect(run.written).toBe(outputs(false, true, false))
  })

  it('says so when the push changes only docs', async () => {
    const { folder, save, base } = history()
    const after = save({ 'docs/a.md': '# A\n' })
    const run = await compared(folder, [base, after])
    expect(run.output).toBe('Only docs changed, which no build, test or script reads.\n')
    expect(run.written).toBe(outputs(false, false, true))
  })

  it('treats code, a first push and a run with a commit missing as a code change', async () => {
    const { folder, save, base } = history()
    const after = save({ 'src/a.ts': 'export const a = 1\n' })
    for (const args of [[base, after], ['0'.repeat(40), after], [base], []]) {
      const run = await compared(folder, args)
      expect(run.output).toBe(
        'Code or configuration changed (or no previous commit to compare with).\n'
      )
      expect(run.written).toBe(outputs(false, false, false))
    }
  })

  it('counts code moved into docs as a code change, since it deletes the code', async () => {
    const { folder, run, base } = history()
    fs.mkdirSync(path.join(folder, 'docs'))
    run('mv', 'src/a.ts', 'docs/a.md')
    run('commit', '--quiet', '-m', 'move')
    const moved = await compared(folder, [base, run('rev-parse', 'HEAD')])
    expect(moved.written).toBe(outputs(false, false, false))
  })

  it('writes no outputs outside GitHub Actions', async () => {
    const { folder, save, base } = history()
    const after = save({ 'docs/a.md': '# A\n' })
    const run = await runScript(main, [base, after], {
      cwd: folder,
      env: { GITHUB_OUTPUT: undefined }
    })
    expect(run.output).toBe('Only docs changed, which no build, test or script reads.\n')
    expect(fs.readdirSync(folder).sort()).toEqual(['.git', 'content', 'docs', 'src'])
  })
})
