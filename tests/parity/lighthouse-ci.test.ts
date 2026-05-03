import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

describe("Lighthouse CI setup", () => {
  it("adds Lighthouse CI to package scripts and CI workflow", () => {
    const root = process.cwd()
    const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    const workflow = fs.readFileSync(path.join(root, ".github/workflows/ci.yml"), "utf8")
    const lighthouserc = fs.readFileSync(path.join(root, "lighthouserc.json"), "utf8")

    expect(packageJson.scripts?.["test:lighthouse"]).toContain("lhci autorun")
    expect(packageJson.devDependencies).toHaveProperty("@lhci/cli")
    expect(workflow).toContain("pnpm test:lighthouse")
    expect(lighthouserc).toContain("http://localhost:3000/")
    expect(lighthouserc).toContain("http://localhost:3000/blog/")
  })
})
