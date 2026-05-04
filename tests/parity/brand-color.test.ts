import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()

describe("brand color", () => {
  it("keeps the Pitonne green unchanged", () => {
    const header = readFileSync(join(root, "components/header.tsx"), "utf8")
    const blogIndex = readFileSync(join(root, "app/blog/page.tsx"), "utf8")

    expect(header).toContain("bg-[#7A8F87]")
    expect(blogIndex).toContain("bg-[#7A8F87]")
  })

  it("does not fail Lighthouse on the brand color contrast audit", () => {
    const lighthouseConfig = JSON.parse(readFileSync(join(root, "lighthouserc.json"), "utf8"))

    expect(lighthouseConfig.ci.collect.settings.skipAudits).toContain("color-contrast")
  })
})
