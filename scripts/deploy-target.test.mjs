import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { runScript } from '../tools/checks/github-stub'
import { chooseDeploy, main } from './deploy-target.mjs'

const folders = []

afterEach(() => {
  for (const folder of folders.splice(0)) fs.rmSync(folder, { recursive: true, force: true })
})

function scratch(name) {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), `deploy-target-${name}-`))
  folders.push(folder)
  return folder
}

const git = (cwd, ...args) =>
  execFileSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', ...args], {
    cwd,
    encoding: 'utf8'
  }).trim()

function commit(repository, message) {
  fs.writeFileSync(path.join(repository, 'file.txt'), message)
  git(repository, 'add', 'file.txt')
  git(repository, 'commit', '--quiet', '-m', message)
  return git(repository, 'rev-parse', 'HEAD')
}

function stagingClone() {
  const origin = scratch('origin')
  git(origin, 'init', '--quiet', '--initial-branch=staging')
  const first = commit(origin, 'first')
  const clone = scratch('clone')
  git(clone, 'clone', '--quiet', origin, '.')
  return { origin, clone, first }
}

async function deployTarget(cwd, args, { output = true } = {}) {
  const file = path.join(scratch('output'), 'output.txt')
  fs.writeFileSync(file, '')
  const run = await runScript(main, args, {
    cwd,
    env: { GITHUB_OUTPUT: output ? file : undefined }
  })
  return { status: run.status, log: run.output, output: fs.readFileSync(file, 'utf8') }
}

describe('deploy target', () => {
  it('deploys the commit when it is the tip', () => {
    expect(chooseDeploy({ sha: 'C2', tip: 'C2' }).sha).toBe('C2')
  })

  it('deploys the tip for every queued older run, so rapid CMS saves all go live and nothing older overwrites newer', () => {
    for (const sha of ['S', 'C1', 'C2', 'D'])
      expect(chooseDeploy({ sha, tip: 'C3' }).sha).toBe('C3')
  })

  it('refuses to choose without a tip, rather than deploy the commit the run was started for', () => {
    expect(() => chooseDeploy({ sha: 'C1', tip: null })).toThrow('no branch tip')
  })

  it('fetches the branch and deploys its tip, even when the run was started for an older commit', async () => {
    const { origin, clone, first } = stagingClone()
    const newer = commit(origin, 'newer')
    const run = await deployTarget(clone, ['staging', first])
    expect(run.status).toBe(0)
    expect(run.output).toBe(`sha=${newer}\n`)
  })

  it('deploys the tip the checkout fetched when the fetch fails, since no deploy before it saw a newer one', async () => {
    const { origin, clone, first } = stagingClone()
    fs.rmSync(origin, { recursive: true, force: true })
    const run = await deployTarget(clone, ['staging', first])
    expect(run.status).toBe(0)
    expect(run.log).toContain("::warning::Couldn't fetch origin/staging")
    expect(run.output).toBe(`sha=${first}\n`)
  })

  it('fails loudly and chooses nothing when it can read no tip at all', async () => {
    const { origin, clone, first } = stagingClone()
    fs.rmSync(origin, { recursive: true, force: true })
    git(clone, 'update-ref', '-d', 'refs/remotes/origin/staging')
    const run = await deployTarget(clone, ['staging', first])
    expect(run.status).toBe(1)
    expect(run.log).toContain(
      "::error::Couldn't read the tip of origin/staging, so nothing deploys"
    )
    expect(run.output).toBe('')
  })

  it('says what it deploys when the run was started for the tip, and writes no output outside Actions', async () => {
    const { clone, first } = stagingClone()
    const run = await deployTarget(clone, ['staging', first], { output: false })
    expect(run.status).toBe(0)
    expect(run.log).toBe(`deploying ${first}, the branch tip\n`)
    expect(run.output).toBe('')
  })

  it.each([
    ['another branch', ['issue-12-form', 'C1']],
    ['no commit', ['staging']]
  ])('refuses %s with its usage and exit code 2', async (_, args) => {
    const { clone } = stagingClone()
    const run = await deployTarget(clone, args)
    expect(run.status).toBe(2)
    expect(run.log).toBe('Usage: node scripts/deploy-target.mjs <main|staging> <sha>\n')
    expect(run.output).toBe('')
  })
})
