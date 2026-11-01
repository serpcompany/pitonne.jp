import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { chooseDeploy } from './deploy-target.mjs'

const script = path.resolve('scripts/deploy-target.mjs')
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

function deployTarget(cwd, sha) {
  const output = path.join(scratch('output'), 'output.txt')
  fs.writeFileSync(output, '')
  const run = spawnSync(process.execPath, [script, 'staging', sha], {
    cwd,
    env: { ...process.env, GITHUB_OUTPUT: output },
    encoding: 'utf8'
  })
  return {
    status: run.status,
    log: run.stdout + run.stderr,
    output: fs.readFileSync(output, 'utf8')
  }
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

  it('fetches the branch and deploys its tip, even when the run was started for an older commit', () => {
    const { origin, clone, first } = stagingClone()
    const newer = commit(origin, 'newer')
    const run = deployTarget(clone, first)
    expect(run.status).toBe(0)
    expect(run.output).toBe(`sha=${newer}\n`)
  })

  it('deploys the tip the checkout fetched when the fetch fails, since no deploy before it saw a newer one', () => {
    const { origin, clone, first } = stagingClone()
    fs.rmSync(origin, { recursive: true, force: true })
    const run = deployTarget(clone, first)
    expect(run.status).toBe(0)
    expect(run.log).toContain("::warning::Couldn't fetch origin/staging")
    expect(run.output).toBe(`sha=${first}\n`)
  })

  it('fails loudly and chooses nothing when it can read no tip at all', () => {
    const { origin, clone, first } = stagingClone()
    fs.rmSync(origin, { recursive: true, force: true })
    git(clone, 'update-ref', '-d', 'refs/remotes/origin/staging')
    const run = deployTarget(clone, first)
    expect(run.status).toBe(1)
    expect(run.log).toContain(
      "::error::Couldn't read the tip of origin/staging, so nothing deploys"
    )
    expect(run.output).toBe('')
  })
})
