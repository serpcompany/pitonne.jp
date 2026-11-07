#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { isDocsOnlyChange } from './draft-only-change.mjs'
import { runMain } from './run-main.mjs'

export const ciWorkflow = '.github/workflows/ci.yml'
export const walkLimit = 50

const retryAfter = [5, 15]
const pauseFor = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

export function gitHubReader({ token, api = 'https://api.github.com', pause = pauseFor }) {
  return async path => {
    for (let attempt = 0; ; attempt++) {
      const response = await fetch(`${api}${path}`, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28'
        },
        signal: AbortSignal.timeout(30_000)
      }).catch(error => ({ ok: false, status: 0, error }))
      if (response.ok) return response.json()
      const retryable = response.status === 0 || response.status === 429 || response.status >= 500
      if (!retryable || attempt >= retryAfter.length) {
        const why = response.status
          ? `returned ${response.status}`
          : `got no answer (${response.error})`
        throw new Error(`GET ${path} ${why}`)
      }
      await pause(retryAfter[attempt] * 1000)
    }
  }
}

export const protectedBranches = ['staging', 'main']

export const isCiPush = (run, { branches = protectedBranches, sha = null } = {}) =>
  run?.path === ciWorkflow &&
  run.event === 'push' &&
  branches.includes(run.head_branch) &&
  (sha === null || run.head_sha === sha)

const passedJobs = (jobs, checks) =>
  checks.filter(check => jobs.some(job => job.name === check && job.conclusion === 'success'))

async function passingRun(read, { repository, sha, checks, branches }) {
  const listed = await read(
    `/repos/${repository}/actions/workflows/ci.yml/runs?head_sha=${sha}&event=push&per_page=100`
  )
  for (const run of listed.workflow_runs) {
    if (!isCiPush(run, { branches, sha })) continue
    const { jobs = [] } = await read(
      `/repos/${repository}/actions/runs/${run.id}/jobs?filter=latest&per_page=100`
    )
    if (passedJobs(jobs, checks).length === checks.length) return run
  }
  return null
}

export async function checksPassed(
  read,
  { repository, sha, checks, branches, log, chain = [sha] }
) {
  if (!checks.length || !branches.length) return false
  try {
    for (const commit of chain) {
      const run = await passingRun(read, { repository, sha: commit, checks, branches })
      if (run) {
        log(
          `${checks.join(', ')} passed on ${commit} in CI's push run ${run.id} on ${run.head_branch}.`
        )
        return true
      }
    }
  } catch (error) {
    log(`::warning::Couldn't tell whether ${checks.join(', ')} passed on ${sha}: ${error.message}`)
    return false
  }
  log(
    `${checks.join(', ')} didn't all pass on ${chain.join(' or ')} in one run of ${ciWorkflow} for a push to ${branches.join(' or ')}.`
  )
  return false
}

export const gitIn = cwd => args =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })

const changedPaths = (git, from, to) =>
  git(['diff', '--no-renames', '--name-only', from, to]).split('\n').filter(Boolean)

export function docsOnlyChain(git, sha, limit = walkLimit) {
  const chain = []
  for (let commit = sha; ; ) {
    const [found, parent] = git(['rev-list', '--parents', '-n', '1', commit]).trim().split(' ')
    chain.push(found)
    if (!parent || !isDocsOnlyChange(changedPaths(git, parent, found))) break
    if (chain.length > limit) return null
    commit = parent
  }
  return chain
}

export async function checksPassedUnderDocs(read, git, { limit = walkLimit, ...options }) {
  const { sha, log } = options
  let chain
  try {
    chain = docsOnlyChain(git, sha, limit)
  } catch (error) {
    log(`::warning::Couldn't read the commits under ${sha}: ${error.message}`)
    return false
  }
  if (!chain) {
    log(
      `${sha} is more than ${limit} docs-only commits above any other, so it counts as not passed.`
    )
    return false
  }
  if (chain.length > 1)
    log(
      `${sha} changes only docs since ${chain.at(-1)}, so a pass on either, or on a commit between them, counts.`
    )
  return checksPassed(read, { ...options, chain })
}

export async function receiptPassed(read, { repository, repositoryId, suite, tree, log }) {
  const name = `passed-${suite}-${tree}`
  try {
    const listed = await read(
      `/repos/${repository}/actions/artifacts?name=${encodeURIComponent(name)}&per_page=100`
    )
    for (const artifact of listed.artifacts) {
      if (artifact.name !== name || artifact.expired) continue
      if (String(artifact.workflow_run?.head_repository_id) !== String(repositoryId)) continue
      if (!protectedBranches.includes(artifact.workflow_run?.head_branch)) continue
      const run = await read(`/repos/${repository}/actions/runs/${artifact.workflow_run.id}`)
      if (isCiPush(run)) {
        log(`${suite} passed on tree ${tree} in CI's push run ${run.id} on ${run.head_branch}.`)
        return true
      }
    }
  } catch (error) {
    log(`::warning::Couldn't look up ${name}: ${error.message}`)
  }
  return false
}

const usage =
  'Run it as: ci-passed.mjs checks <sha> <branch>[,<branch>] "<check> ...", or ci-passed.mjs receipt <suite> <tree>.'

export async function main([what, ...given]) {
  const environment = process.env
  const read = gitHubReader({
    token: environment.GITHUB_TOKEN,
    api: environment.GITHUB_API_URL
  })
  const repository = environment.GITHUB_REPOSITORY
  const log = line => console.log(line)
  let passed
  const [sha, branches, ...names] = given
  const checks = names
    .join(' ')
    .split(/[\s,]+/)
    .filter(Boolean)
  if (what === 'checks' && sha && branches && checks.length) {
    passed = await checksPassedUnderDocs(read, gitIn(process.cwd()), {
      repository,
      sha,
      checks,
      branches: branches.split(',').filter(Boolean),
      log
    })
  } else if (what === 'receipt' && given.length === 2) {
    const [suite, tree] = given
    passed = await receiptPassed(read, {
      repository,
      repositoryId: environment.GITHUB_REPOSITORY_ID,
      suite,
      tree,
      log
    })
  } else {
    log(`::error::${usage}`)
    process.exitCode = 2
    return
  }
  process.exitCode = passed ? 0 : 1
}

await runMain(import.meta.url, main)
