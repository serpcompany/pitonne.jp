#!/usr/bin/env node
import { runMain } from './run-main.mjs'

export const ciWorkflow = '.github/workflows/ci.yml'

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

export function runIdOf(detailsUrl, { repository, server = 'https://github.com' }) {
  let url
  try {
    url = new URL(String(detailsUrl ?? ''))
  } catch {
    return null
  }
  if (url.origin !== new URL(server).origin) return null
  const found = /^\/([^/]+\/[^/]+)\/actions\/runs\/(\d+)\/job\/\d+$/.exec(url.pathname)
  return found && found[1].toLowerCase() === repository.toLowerCase() ? found[2] : null
}

export const isCiRun = (run, { events, branches = null, sha = null }) =>
  run?.path === ciWorkflow &&
  events.includes(run.event) &&
  (branches === null || branches.includes(run.head_branch)) &&
  (sha === null || run.head_sha === sha)

async function passedIn(read, { repository, sha, check, branches, server }) {
  const listed = await read(
    `/repos/${repository}/commits/${sha}/check-runs?check_name=${encodeURIComponent(check)}&per_page=100`
  )
  for (const checkRun of listed.check_runs ?? []) {
    if (checkRun.conclusion !== 'success' || checkRun.head_sha !== sha) continue
    if (checkRun.app?.slug !== 'github-actions') continue
    const id = runIdOf(checkRun.details_url, { repository, server })
    if (!id) continue
    const run = await read(`/repos/${repository}/actions/runs/${id}`)
    if (isCiRun(run, { events: ['push'], branches, sha })) return run
  }
  return null
}

export async function checksPassed(read, { repository, sha, checks, branches, server, log }) {
  if (!checks.length || !branches.length) return false
  const missing = []
  for (const check of checks) {
    const run = await passedIn(read, { repository, sha, check, branches, server }).catch(error => {
      log(`::warning::Couldn't tell whether ${check} passed on ${sha}: ${error.message}`)
      return null
    })
    if (run) log(`${check} passed on ${sha} in CI's push run ${run.id} on ${run.head_branch}.`)
    else missing.push(check)
  }
  if (missing.length)
    log(
      `${missing.join(', ')} didn't pass on ${sha} in a run of ${ciWorkflow} for a push to ${branches.join(' or ')}.`
    )
  return missing.length === 0
}

export async function receiptPassed(read, { repository, repositoryId, suite, tree, log }) {
  const name = `passed-${suite}-${tree}`
  try {
    const listed = await read(
      `/repos/${repository}/actions/artifacts?name=${encodeURIComponent(name)}&per_page=100`
    )
    for (const artifact of listed.artifacts ?? []) {
      if (artifact.name !== name || artifact.expired) continue
      if (String(artifact.workflow_run?.head_repository_id) !== String(repositoryId)) continue
      const run = await read(`/repos/${repository}/actions/runs/${artifact.workflow_run.id}`)
      if (isCiRun(run, { events: ['push', 'pull_request'] })) {
        log(`${suite} passed on tree ${tree} in CI's ${run.event} run ${run.id}.`)
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

async function main([what, ...given]) {
  const environment = process.env
  const read = gitHubReader({
    token: environment.GITHUB_TOKEN ?? '',
    api: environment.GITHUB_API_URL
  })
  const repository = environment.GITHUB_REPOSITORY ?? ''
  const log = line => console.log(line)
  let passed
  const [sha, branches, ...names] = given
  const checks = names
    .join(' ')
    .split(/[\s,]+/)
    .filter(Boolean)
  if (what === 'checks' && sha && branches && checks.length) {
    passed = await checksPassed(read, {
      repository,
      sha,
      checks,
      branches: branches.split(',').filter(Boolean),
      server: environment.GITHUB_SERVER_URL,
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
