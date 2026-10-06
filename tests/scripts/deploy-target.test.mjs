import { describe, expect, it } from "vitest"
import { chooseDeploy } from "../../scripts/deploy-target.mjs"

// A linear history: S (code, promoted) <- C1 (CMS save) <- C2 (CMS save) <- D (code) <- C3 (CMS save)
const ORDER = ["S", "C1", "C2", "D", "C3"]
const relation = (a, b) => {
  const [i, j] = [ORDER.indexOf(a), ORDER.indexOf(b)]
  if (i === j) return "equal"
  return i < j ? "ancestor" : "descendant"
}

describe("deploy target", () => {
  it("deploys the commit when it is the tip", () => {
    expect(chooseDeploy({ sha: "C2", tip: "C2", relation })).toEqual(expect.objectContaining({ skip: false, sha: "C2" }))
  })

  it("deploys the tip for every queued older run, so rapid CMS saves all go live and nothing older overwrites newer", () => {
    for (const sha of ["S", "C1", "C2", "D"]) {
      expect(chooseDeploy({ sha, tip: "C3", relation })).toEqual(expect.objectContaining({ skip: false, sha: "C3" }))
    }
  })

  it("never skips, even when the same commit was deployed before", () => {
    expect(chooseDeploy({ sha: "C3", tip: "C3", relation }).skip).toBe(false)
  })

  it("deploys the commit itself when the tip is unknown or unrelated", () => {
    expect(chooseDeploy({ sha: "C1", tip: null, relation }).sha).toBe("C1")
    expect(chooseDeploy({ sha: "X", tip: "Y", relation: () => "unrelated" }).sha).toBe("X")
  })
})
