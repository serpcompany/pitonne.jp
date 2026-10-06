import { describe, expect, it } from "vitest"
import { chooseDeploy } from "../../scripts/deploy-target.mjs"

// A linear history: S (code, promoted) <- C1 (CMS save) <- C2 (CMS save) <- D (code) <- C3 (CMS save)
const ORDER = ["S", "C1", "C2", "D", "C3"]
const relation = (a, b) => {
  const [i, j] = [ORDER.indexOf(a), ORDER.indexOf(b)]
  if (i === j) return "equal"
  return i < j ? "ancestor" : "descendant"
}
const decide = (overrides) =>
  chooseDeploy({ sha: "S", tip: "S", latestCode: "S", latestCodeTested: true, live: null, manual: false, relation, ...overrides })

describe("deploy target", () => {
  it("deploys the commit when it is the tip and newer than the live one", () => {
    expect(decide({ live: null })).toMatchObject({ skip: false, sha: "S" })
    expect(decide({ sha: "C1", tip: "C1", live: "S" })).toMatchObject({ skip: false, sha: "C1" })
  })

  it("never overwrites a newer live deploy (promotion race: S's deploy runs after C1 went live)", () => {
    expect(decide({ sha: "S", tip: "C1", latestCode: "S", live: "C1" })).toMatchObject({ skip: true })
    expect(decide({ sha: "S", tip: "S", live: "C2" })).toMatchObject({ skip: true, sha: "S" })
  })

  it("deploys the tip when only CMS content came after the commit, so a queued older deploy still publishes", () => {
    expect(decide({ sha: "S", tip: "C2", latestCode: "S", latestCodeTested: false, live: null })).toMatchObject({
      skip: false,
      sha: "C2",
    })
  })

  it("deploys the tip when newer code passed test, and stays on the commit when it hasn't", () => {
    expect(decide({ sha: "C1", tip: "C3", latestCode: "D", latestCodeTested: true, live: "S" })).toMatchObject({ sha: "C3" })
    expect(decide({ sha: "C1", tip: "C3", latestCode: "D", latestCodeTested: false, live: "S" })).toMatchObject({
      skip: false,
      sha: "C1",
    })
  })

  it("skips a commit that is already live, unless the run is a manual redeploy", () => {
    expect(decide({ sha: "C2", tip: "C2", live: "C2" })).toMatchObject({ skip: true })
    expect(decide({ sha: "C2", tip: "C2", live: "C2", manual: true })).toMatchObject({ skip: false, sha: "C2" })
  })

  it("deploys when the live commit or the tip is unknown, because publishing beats a missed guard", () => {
    expect(decide({ sha: "C1", tip: null, latestCode: null, live: null })).toMatchObject({ skip: false, sha: "C1" })
  })

  it("leaves unrelated history alone (deploys the commit itself)", () => {
    const unrelated = () => "unrelated"
    expect(chooseDeploy({ sha: "X", tip: "Y", latestCode: "Y", latestCodeTested: true, live: "Z", relation: unrelated })).toMatchObject({
      skip: false,
      sha: "X",
    })
  })
})
