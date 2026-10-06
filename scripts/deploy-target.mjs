#!/usr/bin/env node
// Decides what a Staging or Production deploy uploads: always the branch tip (issues #78, #102).
//
// Deploys of one environment run one at a time (the deploy-pages-<environment> concurrency group), but they can be
// queued out of commit order: a CMS save deploys at once, while a code commit waits for its test job. Uploading the
// tip at the moment the job runs makes every deploy publish everything committed so far, so a queued older deploy can
// never put back an older site, and rapid CMS saves all go live. `main` and `staging` only move forward (force pushes
// are blocked), so the tip is always the newest state.
//
// Code reaching the tip has already passed `test` on its PR (or on `staging`, for a promotion). The post-merge test
// on `main` alerts but doesn't hold back content (owner rule: content saves always deploy).
//
// There is deliberately no "already live, skip" check: GitHub deployment records name the branch, not the uploaded
// commit, so they can't say what is live, and redeploying the same tree is harmless.
//
// Usage: node scripts/deploy-target.mjs <branch> <sha>   (needs origin/<branch> fetched)
//   writes sha=<commit to deploy> and skip=false to $GITHUB_OUTPUT
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import { pathToFileURL } from "node:url"

export const DEPLOY_BRANCHES = ["main", "staging"]

/**
 * The pure decision. `relation(a, b)` is "equal", "ancestor" (a is older than b), "descendant" or "unrelated".
 * - sha: the commit this run was started for; tip: origin/<branch> now, or null when it couldn't be read
 */
export function chooseDeploy({ sha, tip, relation }) {
  if (tip && tip !== sha && relation(sha, tip) === "ancestor") {
    return { skip: false, sha: tip, reason: `deploying the branch tip ${tip} (this run was started for ${sha})` }
  }
  return { skip: false, sha, reason: `deploying ${sha}` }
}

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

function main([branch, sha]) {
  if (!DEPLOY_BRANCHES.includes(branch) || !sha) {
    console.error("Usage: node scripts/deploy-target.mjs <main|staging> <sha>")
    process.exit(2)
  }
  let tip = null
  try {
    tip = execFileSync("git", ["rev-parse", `origin/${branch}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
  } catch {
    console.log(`::warning::Couldn't read origin/${branch}; deploying ${sha}.`)
  }
  const decision = chooseDeploy({ sha, tip, relation })
  console.log(decision.reason)
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `sha=${decision.sha}\nskip=false\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2))
}
