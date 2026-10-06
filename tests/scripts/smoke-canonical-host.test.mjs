import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import {
  SMOKE_HEADERS,
  evaluate,
  passThroughChecks,
  redirectChecks,
  run,
  smokeChecks,
} from "../../scripts/smoke-canonical-host.mjs"

const deploymentUrl = "https://d49a67b6.pitonne-jp.pages.dev"

describe("canonical-host smoke test", () => {
  const checks = smokeChecks({ deploymentUrl, marker: "abc1234" })
  const redirects = checks.filter((check) => check.expect.status === 308)

  it("redirects pages.dev, the deployment URL and www to the same path and query on pitonne.jp", () => {
    for (const origin of ["https://pitonne-jp.pages.dev", deploymentUrl]) {
      expect(redirects).toEqual(expect.arrayContaining(redirectChecks(origin, "abc1234")))
    }
    expect(redirects.map(({ url, expect }) => [url, expect.location])).toEqual(
      expect.arrayContaining([
        ["https://pitonne-jp.pages.dev/ja/services/?smoke=abc1234", "https://pitonne.jp/ja/services/?smoke=abc1234"],
        ["https://pitonne-jp.pages.dev/contact", "https://pitonne.jp/contact/"],
        ["https://pitonne-jp.pages.dev/en/", "https://pitonne.jp/"],
        ["https://www.pitonne.jp/ja/services/?smoke=abc1234", "https://pitonne.jp/ja/services/?smoke=abc1234"],
        [`${deploymentUrl}/ja/services/?smoke=abc1234`, "https://pitonne.jp/ja/services/?smoke=abc1234"],
      ]),
    )
    for (const check of redirects) expect(check.headers).toBeUndefined()
  })

  it("checks _redirects, _headers and 404s behind the Function with the smoke-test header", () => {
    for (const origin of ["https://pitonne-jp.pages.dev", deploymentUrl]) {
      expect(checks).toEqual(expect.arrayContaining(passThroughChecks(origin)))
    }
    const byPath = Object.fromEntries(
      passThroughChecks("https://x.test").map((check) => [new URL(check.url).pathname, check]),
    )
    expect(byPath["/keystatic/branch/main"].expect).toEqual({ status: 200, contentType: "text/html" })
    expect(byPath["/en/"].expect).toEqual({ status: 301, location: "/" })
    expect(byPath["/sitemap.xml"].expect).toEqual({ status: 200, contentType: "application/xml" })
    expect(byPath["/no-such-page-smoke-test/"].expect).toEqual({ status: 404 })
    for (const check of Object.values(byPath)) expect(check.headers).toEqual(SMOKE_HEADERS)
  })

  it("skips the deployment URL checks when there is none", () => {
    const withoutDeployment = smokeChecks({ marker: "abc1234" })
    expect(withoutDeployment.some((check) => new URL(check.url).origin === deploymentUrl)).toBe(false)
    expect(withoutDeployment.length).toBeLessThan(checks.length)
  })

  it("requires exactly one 308 to the canonical URL", () => {
    const [pages] = redirects
    const { location } = pages.expect
    expect(evaluate(pages, { status: 308, location }).ok).toBe(true)
    expect(evaluate(pages, { status: 200, location: null }).ok).toBe(false)
    expect(evaluate(pages, { status: 301, location }).ok).toBe(false)
    expect(evaluate(pages, { status: 308, location: "https://pitonne.jp/" }).ok).toBe(false)
  })

  it("matches status, location and content type for pass-through checks", () => {
    const [, keystatic, legacy, sitemap, missing] = passThroughChecks("https://x.test")
    expect(evaluate(keystatic, { status: 200, contentType: "text/html; charset=utf-8" }).ok).toBe(true)
    expect(evaluate(keystatic, { status: 404, contentType: "text/html; charset=utf-8" }).ok).toBe(false)
    expect(evaluate(legacy, { status: 301, location: "/" }).ok).toBe(true)
    expect(evaluate(legacy, { status: 308, location: "https://pitonne.jp/" }).ok).toBe(false)
    expect(evaluate(sitemap, { status: 200, contentType: "application/xml; charset=utf-8" }).ok).toBe(true)
    expect(evaluate(sitemap, { status: 200, contentType: "text/html" }).ok).toBe(false)
    expect(evaluate(missing, { status: 404 }).ok).toBe(true)
    expect(evaluate(missing, { status: 200 }).ok).toBe(false)
  })

  it("only warns while the www zone rule still answers 301 or challenges the runner", () => {
    const www = checks.find((check) => check.zone)
    const { location } = www.expect
    expect(evaluate(www, { status: 308, location })).toMatchObject({ ok: true })
    expect(evaluate(www, { status: 301, location })).toMatchObject({ ok: true, warning: true })
    expect(evaluate(www, { status: 403, location: null, mitigated: true })).toMatchObject({ ok: true, warning: true })
    expect(evaluate(www, { status: 301, location: "https://pitonne.jp/" }).ok).toBe(false)
  })

  it("retries until a check passes, and reports the last failure otherwise", async () => {
    const [pages] = redirects
    const responses = [new Error("timeout"), { status: 200 }, { status: 308, location: pages.expect.location }]
    let calls = 0
    const probeFn = async () => {
      const next = responses[calls++]
      if (next instanceof Error) throw next
      return next
    }
    expect(await run(pages, { attempts: 5, delayMs: 0, probeFn })).toMatchObject({ ok: true })
    expect(calls).toBe(3)

    calls = 0
    const failing = await run(pages, { attempts: 3, delayMs: 0, probeFn: async () => ({ status: 200 }) })
    expect(failing.ok).toBe(false)
    expect(failing.message).toContain("expected 308")
    const timedOut = await run(pages, {
      attempts: 2,
      delayMs: 0,
      probeFn: async () => {
        throw new Error("The operation was aborted due to timeout")
      },
    })
    expect(timedOut).toMatchObject({ ok: false })
    expect(timedOut.message).toContain("timeout")
  })

  it("runs after every production deploy", () => {
    const workflow = fs.readFileSync(path.join(process.cwd(), ".github", "workflows", "deploy.yml"), "utf8")
    expect(workflow).toContain('node scripts/smoke-canonical-host.mjs "$DEPLOYMENT_URL"')
    expect(workflow).toContain("steps.deploy.outputs.deployment-url")
  })
})
