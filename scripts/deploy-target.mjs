#!/usr/bin/env node
// Decides what a Staging or Production deploy uploads, so an older deploy never overwrites a newer one (issue #78).
//
// Deploys of one environment run one at a time (the deploy-pages-<environment> concurrency group), but they can be
// queued out of commit order: a CMS save deploys at once, while a code commit waits for its test job. This runs inside
// that group, before the build, so nothing else can deploy the environment while the job decides and uploads.
//
// 1. Start from the branch tip, not only the commit that triggered the run: when every commit since then that changed
//    code has passed `test` (or only CMS content changed), deploy the tip. A queued deploy of an older commit then
//    still publishes every newer CMS save.
// 2. Skip when the chosen commit is already live, or is an ancestor of the live commit (an older deploy).
// The live commit is the newest successful GitHub deployment of the environment (wrangler-action records one per
// Staging and Production deploy). If it can't be read, the deploy goes ahead: publishing beats a missed guard.
//
// Usage: node scripts/deploy-target.mjs <branch> <sha>   (needs full history, origin/<branch> fetched, GH_TOKEN)
//   writes sha=<commit to deploy> and skip=true|false to $GITHUB_OUTPUT
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import { pathToFileURL } from "node:url"

// The files Keystatic edits; anything else is code (same list as scripts/draft-only-change.mjs)
export const CMS_PATHSPECS = [":(exclude)content/blog", ":(exclude)content/blog-categories", ":(exclude)public/images/content/blog"]
// wrangler-action names GitHub deployments after the Pages environment: production for main, preview for branches
export const DEPLOYMENT_ENVIRONMENT = { main: "production", staging: "preview" }

/**
 * The pure decision. `relation(a, b)` is "equal", "ancestor" (a is older than b), "descendant" or "unrelated".
 * - sha: the commit this run was started for; tip: origin/<branch> now
 * - latestCode: the newest commit at the tip that changed anything outside the CMS paths
 * - latestCodeTested: whether that commit has a successful `test` check run
 * - live: the commit currently deployed, or null when unknown
 */
export function chooseDeploy({ sha, tip, latestCode, latestCodeTested, live, manual, relation }) {
  let target = sha
  let reason = `deploying ${sha}`
  if (tip && tip !== sha && relation(sha, tip) === "ancestor") {
    const onlyContentSince = latestCode && ["equal", "ancestor"].includes(relation(latestCode, sha))
    if (onlyContentSince || latestCodeTested) {
      target = tip
      reason = `deploying the branch tip ${tip} instead of ${sha}: ${onlyContentSince ? "only CMS content changed since" : "its code passed test"}`
    }
  }
  if (live) {
    const vsLive = relation(target, live)
    if (vsLive === "ancestor") return { skip: true, sha: target, reason: `${target} is older than the live ${live}; skipping` }
    if (vsLive === "equal" && !manual) return { skip: true, sha: target, reason: `${target} is already live; skipping` }
  }
  return { skip: false, sha: target, reason }
}

const git = (...args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()

function relation(a, b) {
  if (a === b) return "equal"
  const isAncestor = (x, y) => {
    try {
      execFileSync("git", ["merge-base", "--is-ancestor", x, y], { stdio: "ignore" })
      return true
    } catch {
      return false
    }
  }
  if (isAncestor(a, b)) return "ancestor"
  if (isAncestor(b, a)) return "descendant"
  return "unrelated"
}

async function github(path) {
  const response = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/${path}`, {
    headers: { authorization: `Bearer ${process.env.GH_TOKEN}`, accept: "application/vnd.github+json" },
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error(`GitHub API ${path}: ${response.status}`)
  return response.json()
}

async function testPassed(sha) {
  try {
    const { check_runs: runs } = await github(`commits/${sha}/check-runs?check_name=test`)
    return runs.some((run) => run.conclusion === "success")
  } catch (error) {
    console.log(`::warning::Couldn't read test results for ${sha} (${error.message}); treating them as not passed.`)
    return false
  }
}

async function liveCommit(branch) {
  try {
    const environment = DEPLOYMENT_ENVIRONMENT[branch]
    const deployments = await github(`deployments?ref=${branch}&environment=${environment}&per_page=20`)
    for (const deployment of deployments) {
      const statuses = await github(`deployments/${deployment.id}/statuses?per_page=1`)
      if (statuses[0]?.state === "success") return deployment.sha
    }
    return null
  } catch (error) {
    console.log(`::warning::Couldn't read the live deployment (${error.message}); deploying without the stale-deploy guard.`)
    return null
  }
}

async function main([branch, sha]) {
  if (!DEPLOYMENT_ENVIRONMENT[branch] || !sha) {
    console.error("Usage: node scripts/deploy-target.mjs <main|staging> <sha>")
    process.exit(2)
  }
  let tip = null
  let latestCode = null
  try {
    tip = git("rev-parse", `origin/${branch}`)
    latestCode = git("log", "-1", "--format=%H", tip, "--", ".", ...CMS_PATHSPECS) || null
  } catch {
    console.log(`::warning::Couldn't read origin/${branch}; deploying ${sha}.`)
  }
  const latestCodeTested = tip && tip !== sha && latestCode ? await testPassed(latestCode) : false
  const live = await liveCommit(branch)
  const manual = process.env.GITHUB_EVENT_NAME === "workflow_dispatch"
  const decision = chooseDeploy({ sha, tip, latestCode, latestCodeTested, live, manual, relation })
  console.log(`${decision.skip ? "::notice::" : ""}${decision.reason}`)
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `sha=${decision.sha}\nskip=${decision.skip}\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main(process.argv.slice(2))
}
