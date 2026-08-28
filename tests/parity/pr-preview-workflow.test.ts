import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

describe("pull request preview workflow", () => {
  const workflow = fs.readFileSync(
    path.join(process.cwd(), ".github", "workflows", "ci.yml"),
    "utf8",
  )

  it("deploys only same-repository pull requests targeting staging after validation", () => {
    expect(workflow).toContain("needs: test")
    expect(workflow).toContain("github.event.pull_request.base.ref == 'staging'")
    expect(workflow).toContain(
      "github.event.pull_request.head.repo.full_name == github.repository",
    )
    expect(workflow).toContain("DEPLOY_ENV: preview")
    expect(workflow).toContain("NEXT_PUBLIC_DEPLOY_ENV: preview")
  })

  it("uses an isolated per-PR alias and cancels obsolete deployments", () => {
    expect(workflow).toContain("PREVIEW_BRANCH: pr-${{ github.event.pull_request.number }}")
    expect(workflow).toContain("group: cloudflare-pages-pr-${{ github.event.pull_request.number }}")
    expect(workflow).toContain("cancel-in-progress: true")
    expect(workflow).toContain("--branch=${{ env.PREVIEW_BRANCH }}")
    expect(workflow).toContain("--commit-hash=${{ github.event.pull_request.head.sha }}")
  })

  it("keeps preview permissions narrow and updates one marked PR comment", () => {
    expect(workflow).toContain("pull-requests: write")
    expect(workflow).not.toContain("issues: write")
    expect(workflow).toContain("<!-- pitonne-cloudflare-pr-preview -->")
    expect(workflow).toContain("pages-deployment-alias-url")
    expect(workflow).toContain("steps.deploy.outputs.deployment-url")
    expect(workflow).toContain("issues.updateComment")
  })

  it("checks that local and deployed previews remain non-indexable", () => {
    expect(workflow.match(/grep -Fq "Disallow: \/"/g)).toHaveLength(2)
    expect(workflow).toContain('$STABLE_PREVIEW_URL/ja/')
    expect(workflow).toContain('$STABLE_PREVIEW_URL/robots.txt')
  })
})
