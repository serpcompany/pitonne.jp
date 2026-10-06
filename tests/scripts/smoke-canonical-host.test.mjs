import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { evaluate, smokeChecks, SMOKE_TEST_HEADER } from "../../scripts/smoke-canonical-host.mjs"

describe("canonical-host smoke test", () => {
  const checks = smokeChecks({ deploymentUrl: "https://d49a67b6.pitonne-jp.pages.dev", marker: "abc1234" })

  it("checks pages.dev, the deployment URL and www, keeping path and query", () => {
    const redirects = checks.filter((check) => check.kind === "redirect")
    expect(redirects.map(({ url, location }) => [url, location])).toEqual([
      ["https://pitonne-jp.pages.dev/ja/services/?smoke=abc1234", "https://pitonne.jp/ja/services/?smoke=abc1234"],
      ["https://pitonne-jp.pages.dev/contact", "https://pitonne.jp/contact/"],
      ["https://pitonne-jp.pages.dev/robots.txt", "https://pitonne.jp/robots.txt"],
      ["https://www.pitonne.jp/ja/services/?smoke=abc1234", "https://pitonne.jp/ja/services/?smoke=abc1234"],
      ["https://d49a67b6.pitonne-jp.pages.dev/ja/?smoke=abc1234", "https://pitonne.jp/ja/?smoke=abc1234"],
    ])
  })

  it("reaches the deployment with the smoke-test header", () => {
    const served = checks.filter((check) => check.kind === "serve")
    expect(served.map((check) => check.url)).toEqual([
      "https://pitonne-jp.pages.dev/",
      "https://d49a67b6.pitonne-jp.pages.dev/ja/",
    ])
    for (const check of served) expect(check.headers).toEqual({ [SMOKE_TEST_HEADER]: "1" })
  })

  it("requires exactly one 308 to the canonical URL", () => {
    const [pages] = checks
    expect(evaluate(pages, { status: 308, location: pages.location }).ok).toBe(true)
    expect(evaluate(pages, { status: 200, location: null }).ok).toBe(false)
    expect(evaluate(pages, { status: 301, location: pages.location }).ok).toBe(false)
    expect(evaluate(pages, { status: 308, location: "https://pitonne.jp/" }).ok).toBe(false)
  })

  it("only warns while the www zone rule still answers 301 or challenges the runner", () => {
    const www = checks.find((check) => check.zone)
    expect(evaluate(www, { status: 308, location: www.location })).toMatchObject({ ok: true })
    expect(evaluate(www, { status: 301, location: www.location })).toMatchObject({ ok: true, warning: true })
    expect(evaluate(www, { status: 403, location: null, mitigated: true })).toMatchObject({ ok: true, warning: true })
    expect(evaluate(www, { status: 301, location: "https://pitonne.jp/" }).ok).toBe(false)
  })

  it("runs after every production deploy", () => {
    const workflow = fs.readFileSync(path.join(process.cwd(), ".github", "workflows", "deploy.yml"), "utf8")
    expect(workflow).toContain('node scripts/smoke-canonical-host.mjs "$DEPLOYMENT_URL"')
    expect(workflow).toContain("steps.deploy.outputs.deployment-url")
  })
})
