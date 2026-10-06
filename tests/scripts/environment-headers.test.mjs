import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { NOINDEX_BLOCK, environmentHeaders, isProductionEnv } from "../../scripts/environment-headers.mjs"

const committed = fs.readFileSync(path.join(process.cwd(), "public", "_headers"), "utf8")

describe("environment headers", () => {
  it("is production only when explicitly marked, like isProductionDeployment()", () => {
    expect(isProductionEnv({ DEPLOY_ENV: "production" })).toBe(true)
    expect(isProductionEnv({ NEXT_PUBLIC_DEPLOY_ENV: "production" })).toBe(true)
    expect(isProductionEnv({ DEPLOY_ENV: "staging" })).toBe(false)
    expect(isProductionEnv({ DEPLOY_ENV: "preview" })).toBe(false)
    expect(isProductionEnv({})).toBe(false)
  })

  it("sends X-Robots-Tag: noindex on every path outside production", () => {
    const headers = environmentHeaders(committed, false)
    expect(headers.startsWith(committed.trimEnd())).toBe(true)
    expect(headers).toContain("/*\n  X-Robots-Tag: noindex, nofollow\n")
  })

  it("leaves the committed headers unchanged in production", () => {
    expect(committed).not.toMatch(/X-Robots-Tag/i)
    expect(environmentHeaders(committed, true)).toBe(committed.replace(/\s*$/, "\n"))
  })

  it("is idempotent and can switch a reused out/ back to production", () => {
    const once = environmentHeaders(committed, false)
    expect(environmentHeaders(once, false)).toBe(once)
    expect(once.split(NOINDEX_BLOCK)).toHaveLength(2)
    expect(environmentHeaders(once, true)).not.toMatch(/X-Robots-Tag/i)
  })
})
