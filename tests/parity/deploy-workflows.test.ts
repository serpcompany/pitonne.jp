import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

// The Staging -> Production flow (issue #78): what CI deploys where, and the guards that keep it safe.
const read = (file: string) => fs.readFileSync(path.join(process.cwd(), ".github", "workflows", file), "utf8")

/** The text of one top-level job, from its `  <id>:` line to the next job. */
function job(workflow: string, id: string): string {
  const start = workflow.indexOf(`\n  ${id}:\n`)
  expect(start, `job ${id}`).toBeGreaterThan(-1)
  const rest = workflow.slice(start + 1)
  const next = rest.slice(1).search(/\n {2}[a-z][\w-]*:\n/)
  return next === -1 ? rest : rest.slice(0, next + 1)
}

describe("CI and deploy workflows", () => {
  const ci = read("ci.yml")
  const deploy = read("deploy.yml")

  it("tests and deploys pushes to staging and main", () => {
    expect(ci).toMatch(/push:\n\s+branches:\n\s+- staging\n\s+- main/)
    expect(job(ci, "deploy")).toContain("environment: ${{ github.ref_name == 'main' && 'production' || 'staging' }}")
  })

  it("deploys code changes only after the test job passes", () => {
    const gated = job(ci, "deploy")
    expect(gated).toContain("needs: [changes, test]")
    expect(gated).toContain("needs.changes.outputs.fast != 'true'")
    expect(gated).not.toContain("always()")
  })

  it("deploys CMS content as soon as it builds, whatever any test result says", () => {
    const content = job(ci, "deploy-content")
    expect(content).toContain("needs: changes")
    expect(content).not.toMatch(/needs:.*test/)
    expect(content).toContain("needs.changes.outputs.fast == 'true'")
    const changes = job(ci, "changes")
    expect(changes).toContain("node scripts/draft-only-change.mjs")
    // Content only is fast on its own, with no test lookup in that branch
    expect(changes).toMatch(/if \[ "\$CONTENT_ONLY" = true \]; then\n\s+fast=true\n/)
    expect(changes).not.toContain("BEFORE")
  })

  it("deploys a commit that already passed test (a promotion) without retesting it", () => {
    const changes = job(ci, "changes")
    expect(changes).toContain("commits/$GITHUB_SHA/check-runs?check_name=test")
    expect(changes).toContain('select(.conclusion == "success")')
    // An API error waits for test instead of failing the job, which would skip every deploy
    expect(changes).toContain("|| passed=0")
  })

  it("alerts the owner when test or a Production deploy fails on main instead of blocking publishing", () => {
    const alert = job(ci, "alert")
    expect(alert).toContain("needs: [test, deploy-content, deploy]")
    expect(alert).toContain("always() && github.event_name == 'push' && github.ref_name == 'main'")
    for (const id of ["test", "deploy-content", "deploy"]) expect(alert).toContain(`needs.${id}.result == 'failure'`)
    expect(alert).toContain("group: alert-red-main")
    expect(alert).toContain("issues: write")
    expect(alert).toContain("@devinschumacher")
    expect(alert).toContain("gh issue create")
    expect(alert).toContain("gh issue comment")
  })

  it("keeps the draft-only skip out of the deploy concurrency group", () => {
    for (const id of ["deploy", "deploy-content"]) expect(job(ci, id)).toContain("needs.changes.outputs.skip != 'true'")
    expect(job(ci, "changes")).not.toContain("concurrency")
  })

  it("previews same-repository PRs into staging or main after validation", () => {
    const preview = job(ci, "preview")
    expect(preview).toContain("needs: test")
    expect(preview).toContain(`contains(fromJSON('["staging", "main"]'), github.event.pull_request.base.ref)`)
    expect(preview).toContain("github.event.pull_request.head.repo.full_name == github.repository")
    expect(preview).toContain("environment: preview")
    expect(preview).toContain("pr: ${{ github.event.pull_request.number }}")
    expect(preview).toContain("ref: ${{ github.event.pull_request.head.sha }}")
  })

  it("cancels superseded PR runs but never a push run", () => {
    expect(ci).toContain("group: ${{ github.workflow }}-${{ github.event_name == 'pull_request' && github.ref || github.run_id }}")
    expect(ci).toContain("cancel-in-progress: ${{ github.event_name == 'pull_request' }}")
  })

  it("never uploads an older commit over a newer live one", () => {
    expect(deploy).toContain('node scripts/deploy-target.mjs "$PAGES_BRANCH" "$DEPLOY_SHA"')
    expect(deploy).toContain("if: env.DEPLOY_ENV != 'preview'")
    // Every step after the decision honours a skip
    const afterGuard = deploy.slice(deploy.indexOf("- name: Check out the chosen commit"))
    const steps = afterGuard.split("\n      - ").slice(1)
    for (const step of steps) expect(step).toMatch(/if: steps\.target\.outputs\.skip/)
  })

  it("serializes deploys per target and environment without cancelling a running one", () => {
    expect(deploy).toContain(
      "group: deploy-pages-${{ inputs.environment == 'preview' && format('pr-{0}', inputs.pr) || inputs.environment || (github.ref_name == 'main' && 'production') || github.ref_name }}",
    )
    expect(deploy).toMatch(/group: deploy-pages-.*\n\s+cancel-in-progress: false/)
  })

  it("deploys Production only from main, Staging only from staging, and previews only to pr-<n>", () => {
    expect(deploy).toContain('production) [ "$GITHUB_REF" = refs/heads/main ]')
    expect(deploy).toContain('staging) [ "$GITHUB_REF" = refs/heads/staging ]')
    expect(deploy).toContain('branch="pr-$PR_NUMBER"')
    expect(deploy).toContain("--branch=${{ env.PAGES_BRANCH }}")
    expect(deploy).toContain('echo "DEPLOY_ENV=$TARGET"')
    expect(deploy).not.toMatch(/--branch[= ]main/)
  })

  it("checks that each environment is indexable only in production, before and after deploying", () => {
    expect(deploy).toContain('grep -Fxq "Disallow: /" out/robots.txt')
    expect(deploy).toContain('grep -Fq "X-Robots-Tag: noindex" out/_headers')
    // Never the hash deployment URL: Cloudflare sends X-Robots-Tag: noindex on every hash URL, Production's included
    expect(deploy).toContain("node scripts/smoke-environment.mjs production https://pitonne-jp.pages.dev https://pitonne.jp")
    expect(deploy).not.toMatch(/smoke-environment\.mjs production[^\n]*DEPLOYMENT_URL/)
    expect(deploy).toContain("node scripts/smoke-environment.mjs staging")
    expect(deploy).toContain("https://staging.pitonne.jp")
    expect(deploy).toContain("node scripts/smoke-environment.mjs preview")
  })

  it("keeps workflow tokens minimal and leaves the PR preview comment to Cloudflare Pages", () => {
    const ciWithoutAlert = ci.replace(job(ci, "alert"), "")
    for (const workflow of [ciWithoutAlert, deploy]) {
      expect(workflow).not.toContain("pull-requests: write")
      expect(workflow).not.toContain("issues: write")
      expect(workflow).not.toContain("contents: write")
      expect(workflow).not.toContain("actions/github-script")
    }
    // Deploys and previews get only the Cloudflare token, never the release deploy key
    expect(ci).not.toContain("secrets: inherit")
    expect(ci).not.toContain("RELEASE_DEPLOY_KEY")
    expect(ci.match(/CLOUDFLARE_API_TOKEN: \$\{\{ secrets\.CLOUDFLARE_API_TOKEN \}\}/g)).toHaveLength(3)
    expect(deploy).toContain("gitHubToken: ${{ env.DEPLOY_ENV != 'preview' && github.token || '' }}")
  })
})

describe("staging sync and promotion workflows", () => {
  const sync = read("sync-staging.yml")
  const promote = read("promote.yml")

  it("merges main into staging after every push to main, and only ever pushes staging", () => {
    expect(sync).toMatch(/push:\n\s+branches:\n\s+- main\n/)
    expect(sync).not.toMatch(/branches:\n(\s+- .*\n)*\s+- staging/)
    expect(sync).toContain("git push origin origin/main:refs/heads/staging")
    expect(sync).toContain("git push origin staging")
    expect(sync).not.toMatch(/git push[^\n]*:refs\/heads\/main|git push origin main/)
    expect(sync).toContain('git merge --no-ff --no-edit -m "chore: merge main into staging" origin/main')
  })

  it("promotes by fast-forwarding main to a tested staging commit", () => {
    expect(promote).toContain("workflow_dispatch")
    expect(promote).not.toContain("push:")
    expect(promote).toContain("git merge-base --is-ancestor origin/main origin/staging")
    expect(promote).toContain("check-runs?check_name=test")
    expect(promote).toContain('git push origin "$STAGING_SHA:refs/heads/main"')
    expect(promote).not.toMatch(/--force|\+refs|-f /)
  })

  it("pushes with the deploy key from the release environment, so the pushed branch runs CI and deploys", () => {
    for (const workflow of [sync, promote]) {
      expect(workflow).toContain("ssh-key: ${{ secrets.RELEASE_DEPLOY_KEY }}")
      expect(workflow).toContain("environment: release")
      expect(workflow).toMatch(/concurrency:\n\s+group: [\w-]+\n\s+cancel-in-progress: false/)
    }
  })
})
