import assert from "node:assert/strict"

process.env.PAYLOAD_PUBLIC_WEB_URL = "https://www.pitonne.example"

const { getBlogPostPreviewUrl, getPagePreviewUrl } = await import("../src/lib/adminPreviewUrls.ts")

assert.equal(
  getBlogPostPreviewUrl("iv-therapy-for-fatigue", "en"),
  "https://www.pitonne.example/blog/iv-therapy-for-fatigue/",
)
assert.equal(
  getBlogPostPreviewUrl("iv-therapy-for-fatigue", "ja"),
  "https://www.pitonne.example/ja/blog/iv-therapy-for-fatigue/",
)
assert.equal(getPagePreviewUrl("home", "en"), "https://www.pitonne.example/")
assert.equal(getPagePreviewUrl("about", "ja"), "https://www.pitonne.example/ja/about/")
assert.equal(getPagePreviewUrl("contact", "en"), "https://www.pitonne.example/contact/")

console.log("adminPreviewUrls tests passed")
