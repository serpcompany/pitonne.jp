import { describe, expect, it } from "vitest"
import {
  allText,
  branches,
  job,
  needs,
  readWorkflow,
  scripts,
  step,
  stepIndex,
  stepsAfter,
  textValues,
  type Workflow,
  workflowScripts,
} from "./workflows"

const ci = readWorkflow("ci.yml")
const deploy = readWorkflow("deploy.yml")
const sync = readWorkflow("sync-staging.yml")
const promote = readWorkflow("promote.yml")
const pagesDeploy = job(deploy, "deploy")
const cloudflareTokenOnly = { CLOUDFLARE_API_TOKEN: "${{ secrets.CLOUDFLARE_API_TOKEN }}" }

function permissionGrants(workflow: Workflow, exceptJobs: string[] = []): Record<string, string>[] {
  const jobGrants = Object.entries(workflow.jobs)
    .filter(([id]) => !exceptJobs.includes(id))
    .map(([, owner]) => owner.permissions)
  return [workflow.permissions, ...jobGrants].filter((grant): grant is Record<string, string> => grant !== undefined)
}

describe("CI and deploy workflows", () => {
  it("tests and deploys pushes to staging and main", () => {
    expect(ci.on.push?.branches).toEqual(expect.arrayContaining(["staging", "main"]))
    expect(job(ci, "deploy").with?.environment).toBe("${{ github.ref_name == 'main' && 'production' || 'staging' }}")
  })

  it("deploys code changes only after the test job passes", () => {
    const gated = job(ci, "deploy")
    expect(needs(gated)).toEqual(["changes", "test"])
    expect(gated.if).toContain("needs.changes.outputs.fast != 'true'")
    expect(allText(gated)).not.toContain("always()")
  })

  it("deploys CMS content as soon as it builds, whatever any test result says", () => {
    const content = job(ci, "deploy-content")
    expect(needs(content)).toEqual(["changes"])
    expect(content.if).toContain("needs.changes.outputs.fast == 'true'")
    const changes = job(ci, "changes")
    expect(scripts(changes)).toContain("node scripts/draft-only-change.mjs")
    expect(scripts(changes)).toMatch(/if \[ "\$CONTENT_ONLY" = true \]; then\n\s+fast=true\n/)
    expect(allText(changes)).not.toContain("BEFORE")
  })

  it("deploys a commit that already passed test (a promotion) without retesting it", () => {
    const changes = scripts(job(ci, "changes"))
    expect(changes).toContain("commits/$GITHUB_SHA/check-runs?check_name=test")
    expect(changes).toContain('select(.conclusion == "success")')
    expect(changes).toContain("|| passed=0")
  })

  it("alerts the owner when test or a Production deploy fails on main instead of blocking publishing", () => {
    const alert = job(ci, "alert")
    expect(needs(alert)).toEqual(["test", "changes", "deploy-content", "deploy"])
    expect(alert.if).toContain("always() && github.event_name == 'push' && github.ref_name == 'main'")
    for (const id of ["test", "changes", "deploy-content", "deploy"]) {
      expect(alert.if).toContain(`needs.${id}.result == 'failure'`)
    }
    expect(alert.concurrency?.group).toBe("alert-red-main")
    expect(alert.permissions).toMatchObject({ issues: "write" })
    expect(scripts(alert)).toContain("@devinschumacher")
    expect(scripts(alert)).toContain("gh issue create")
    expect(scripts(alert)).toContain("gh issue comment")
  })

  it("keeps the draft-only skip out of the deploy concurrency group", () => {
    for (const id of ["deploy", "deploy-content"]) expect(job(ci, id).if).toContain("needs.changes.outputs.skip != 'true'")
    expect(allText(job(ci, "changes"))).not.toContain("concurrency")
  })

  it("previews same-repository PRs into staging or main after validation", () => {
    const preview = job(ci, "preview")
    expect(needs(preview)).toEqual(["test"])
    expect(preview.if).toContain(`contains(fromJSON('["staging", "main"]'), github.event.pull_request.base.ref)`)
    expect(preview.if).toContain("github.event.pull_request.head.repo.full_name == github.repository")
    expect(preview.with).toMatchObject({
      environment: "preview",
      pr: "${{ github.event.pull_request.number }}",
      ref: "${{ github.event.pull_request.head.sha }}",
    })
  })

  it("cancels superseded PR runs but never a push run", () => {
    expect(ci.concurrency).toEqual({
      group: "${{ github.workflow }}-${{ github.event_name == 'pull_request' && github.ref || github.run_id }}",
      "cancel-in-progress": "${{ github.event_name == 'pull_request' }}",
    })
  })

  it("never uploads an older commit over a newer live one", () => {
    const target = step(pagesDeploy, "target")
    expect(target.run).toContain('node scripts/deploy-target.mjs "$PAGES_BRANCH" "$DEPLOY_SHA"')
    expect(target.if).toBe("env.DEPLOY_ENV != 'preview'")
    const guarded = stepsAfter(pagesDeploy, "target")
    expect(guarded.length).toBeGreaterThan(0)
    for (const later of guarded) expect(later.if).toMatch(/steps\.target\.outputs\.skip/)
  })

  it("serializes deploys per target and environment without cancelling a running one", () => {
    expect(pagesDeploy.concurrency).toEqual({
      group:
        "deploy-pages-${{ inputs.environment == 'preview' && format('pr-{0}', inputs.pr) || inputs.environment || (github.ref_name == 'main' && 'production') || github.ref_name }}",
      "cancel-in-progress": false,
    })
  })

  it("deploys Production only from main, Staging only from staging, and previews only to pr-<n>", () => {
    const resolve = step(pagesDeploy, "Resolve environment").run
    expect(resolve).toContain('production) [ "$GITHUB_REF" = refs/heads/main ]')
    expect(resolve).toContain('staging) [ "$GITHUB_REF" = refs/heads/staging ]')
    expect(resolve).toContain('branch="pr-$PR_NUMBER"')
    expect(resolve).toContain('echo "DEPLOY_ENV=$TARGET"')
    expect(step(pagesDeploy, "deploy").with?.command).toContain("--branch=${{ env.PAGES_BRANCH }}")
    expect(allText(deploy)).not.toMatch(/--branch[= ]main/)
  })

  it("checks that each environment is indexable only in production, before and after deploying", () => {
    const verify = step(pagesDeploy, "Verify static output").run
    expect(verify).toContain('grep -Fxq "Disallow: /" out/robots.txt')
    expect(verify).toContain('grep -Fq "X-Robots-Tag: noindex" out/_headers')
    const smoke = step(pagesDeploy, "Smoke-test environment behaviour").run
    expect(smoke).toContain("node scripts/smoke-environment.mjs production https://pitonne-jp.pages.dev https://pitonne.jp")
    expect(allText(deploy)).not.toMatch(/smoke-environment\.mjs production[^\n]*DEPLOYMENT_URL/)
    expect(smoke).toContain("node scripts/smoke-environment.mjs staging")
    expect(smoke).toContain("https://staging.pitonne.jp")
    expect(smoke).toContain("node scripts/smoke-environment.mjs preview")
    expect(stepIndex(pagesDeploy, "Verify static output")).toBeLessThan(stepIndex(pagesDeploy, "deploy"))
    expect(stepIndex(pagesDeploy, "Smoke-test environment behaviour")).toBeGreaterThan(stepIndex(pagesDeploy, "deploy"))
  })

  it("keeps workflow tokens minimal and leaves the PR preview comment to Cloudflare Pages", () => {
    for (const grant of [...permissionGrants(ci, ["alert"]), ...permissionGrants(deploy)]) {
      for (const scope of ["pull-requests", "issues", "contents"]) expect(grant[scope]).not.toBe("write")
    }
    for (const workflow of [ci, deploy]) expect(allText(workflow)).not.toContain("actions/github-script")
    const secretGrants = Object.values(ci.jobs).flatMap((owner) => (owner.secrets ? [owner.secrets] : []))
    expect(secretGrants).toEqual([cloudflareTokenOnly, cloudflareTokenOnly, cloudflareTokenOnly])
    expect(textValues(ci).filter((value) => value.includes("secrets.CLOUDFLARE_API_TOKEN"))).toHaveLength(3)
    expect(allText(ci)).not.toContain("RELEASE_DEPLOY_KEY")
    expect(step(pagesDeploy, "deploy").with?.gitHubToken).toBe("${{ env.DEPLOY_ENV != 'preview' && github.token || '' }}")
  })
})

describe("staging sync and promotion workflows", () => {
  it("merges main into staging after every push to main, and only ever pushes staging", () => {
    expect(sync.on.push?.branches).toContain("main")
    expect(branches(sync)).not.toContain("staging")
    const script = workflowScripts(sync)
    expect(script).toContain("git push origin origin/main:refs/heads/staging")
    expect(script).toContain("git push origin staging")
    expect(allText(sync)).not.toMatch(/git push[^\n]*:refs\/heads\/main|git push origin main/)
    expect(script).toContain('git merge --no-ff --no-edit -m "chore: merge main into staging" origin/main')
  })

  it("promotes by fast-forwarding main to a tested staging commit", () => {
    expect(promote.on).toHaveProperty("workflow_dispatch")
    expect(promote.on).not.toHaveProperty("push")
    const script = workflowScripts(promote)
    expect(script).toContain("git merge-base --is-ancestor origin/main origin/staging")
    expect(script).toContain("check-runs?check_name=test")
    expect(script).toContain('git push origin "$STAGING_SHA:refs/heads/main"')
    expect(allText(promote)).not.toMatch(/--force|\+refs|-f /)
  })

  it("pushes with the deploy key from the release environment, so the pushed branch runs CI and deploys", () => {
    for (const workflow of [sync, promote]) {
      const pushers = Object.values(workflow.jobs).filter((owner) =>
        owner.steps?.some((candidate) => candidate.with?.["ssh-key"] === "${{ secrets.RELEASE_DEPLOY_KEY }}"),
      )
      expect(pushers.length).toBeGreaterThan(0)
      for (const pusher of pushers) expect(pusher.environment).toBe("release")
      expect(workflow.concurrency?.group).toMatch(/^[\w-]+$/)
      expect(workflow.concurrency?.["cancel-in-progress"]).toBe(false)
    }
  })
})
