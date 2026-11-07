import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ciWorkflow, gitIn } from '../../scripts/ci-passed.mjs'

export const repository = 'serpcompany/pitonne.jp'
export const checks = ['verify', 'test', 'e2e', 'lighthouse']

export const job = (name: string, conclusion = 'success') => ({ name, conclusion })
export const allPassed = () => checks.map(name => job(name))

export const ciPushRun = (id: number, more: Record<string, unknown>) => ({
  id,
  path: ciWorkflow,
  event: 'push',
  head_branch: 'staging',
  ...more
})

export const runsPathOf = (commit: string) =>
  `/repos/${repository}/actions/workflows/ci.yml/runs?head_sha=${commit}&event=push&per_page=100`
export const jobsPath = (id: number) =>
  `/repos/${repository}/actions/runs/${id}/jobs?filter=latest&per_page=100`

export function fakeGitHub(answers: Record<string, unknown>) {
  const asked: string[] = []
  return {
    asked,
    read: async (path: string) => {
      asked.push(path)
      const answer = answers[path]
      if (answer instanceof Error) throw answer
      if (answer === undefined) throw new Error(`GET ${path} returned 404`)
      return answer
    }
  }
}

const folders: string[] = []

export function removeScratchHistories() {
  for (const folder of folders.splice(0)) fs.rmSync(folder, { recursive: true, force: true })
}

export function scratchHistory() {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-passed-'))
  folders.push(folder)
  const run = (...args: string[]) =>
    execFileSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', ...args], {
      cwd: folder,
      encoding: 'utf8'
    }).trim()
  run('init', '--quiet', '--initial-branch=staging')
  let edits = 0
  const save = (files: Record<string, string | null>) => {
    for (const [file, text] of Object.entries(files)) {
      if (text === null) fs.rmSync(path.join(folder, file))
      else {
        fs.mkdirSync(path.join(folder, path.dirname(file)), { recursive: true })
        fs.writeFileSync(path.join(folder, file), text)
      }
    }
    run('add', '--all')
    run('commit', '--quiet', '-m', Object.keys(files).join(' '))
    return run('rev-parse', 'HEAD')
  }
  const commit = (...files: string[]) =>
    save(Object.fromEntries(files.map(file => [file, `edit ${++edits}\n`])))
  return { folder, run, commit, save, git: gitIn(folder) }
}
