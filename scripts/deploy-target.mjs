#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { runMain } from './run-main.mjs'

export const DEPLOY_BRANCHES = ['main', 'staging']

export function chooseDeploy({ sha, tip, relation }) {
  if (tip && tip !== sha && relation(sha, tip) === 'ancestor') {
    return {
      skip: false,
      sha: tip,
      reason: `deploying the branch tip ${tip} (this run was started for ${sha})`
    }
  }
  return { skip: false, sha, reason: `deploying ${sha}` }
}

function relation(a, b) {
  if (a === b) return 'equal'
  const isAncestor = (x, y) => {
    try {
      execFileSync('git', ['merge-base', '--is-ancestor', x, y], { stdio: 'ignore' })
      return true
    } catch {
      return false
    }
  }
  if (isAncestor(a, b)) return 'ancestor'
  if (isAncestor(b, a)) return 'descendant'
  return 'unrelated'
}

function main([branch, sha]) {
  if (!DEPLOY_BRANCHES.includes(branch) || !sha) {
    console.error('Usage: node scripts/deploy-target.mjs <main|staging> <sha>')
    process.exit(2)
  }
  let tip = null
  try {
    tip = execFileSync('git', ['rev-parse', `origin/${branch}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()
  } catch {
    console.log(`::warning::Couldn't read origin/${branch}; deploying ${sha}.`)
  }
  const decision = chooseDeploy({ sha, tip, relation })
  console.log(decision.reason)
  if (process.env.GITHUB_OUTPUT)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `sha=${decision.sha}\nskip=false\n`)
}

await runMain(import.meta.url, main)
