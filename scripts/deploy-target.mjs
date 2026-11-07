#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { runMain } from './run-main.mjs'

export const DEPLOY_BRANCHES = ['main', 'staging']

export function chooseDeploy({ sha, tip }) {
  if (!tip) throw new Error('There is no branch tip to deploy.')
  if (tip === sha) return { sha, reason: `deploying ${sha}, the branch tip` }
  return { sha: tip, reason: `deploying the branch tip ${tip} (this run was started for ${sha})` }
}

const git = args =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()

export function readTip(branch, run = git) {
  try {
    run(['fetch', '--quiet', 'origin', `+refs/heads/${branch}:refs/remotes/origin/${branch}`])
  } catch {
    console.log(
      `::warning::Couldn't fetch origin/${branch}; deploying the tip the checkout fetched, which is no older than any deploy before this one.`
    )
  }
  try {
    return run(['rev-parse', '--verify', '--quiet', `refs/remotes/origin/${branch}^{commit}`])
  } catch {
    return null
  }
}

export function main([branch, sha]) {
  if (!DEPLOY_BRANCHES.includes(branch) || !sha) {
    console.error('Usage: node scripts/deploy-target.mjs <main|staging> <sha>')
    process.exitCode = 2
    return
  }
  const tip = readTip(branch)
  if (!tip) {
    console.log(
      `::error::Couldn't read the tip of origin/${branch}, so nothing deploys: only the branch tip may replace a deploy. Run the deploy again.`
    )
    process.exitCode = 1
    return
  }
  const decision = chooseDeploy({ sha, tip })
  console.log(decision.reason)
  if (process.env.GITHUB_OUTPUT)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `sha=${decision.sha}\n`)
}

await runMain(import.meta.url, main)
