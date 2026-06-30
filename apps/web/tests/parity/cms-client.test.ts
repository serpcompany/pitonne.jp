import { afterEach, describe, expect, it, vi } from "vitest"
import { getAllBlogPosts, getAllBlogPostsWithCms, getAllCategoriesWithCms, getBlogPostsForServiceWithCms } from "@/lib/data/blog-posts"
import { getCorePageContent } from "@/lib/data/cms-pages"
import { resetCmsClientCacheForTests } from "@/lib/cms/payload"

const previousEnv = {
  CMS_API_TOKEN: process.env.CMS_API_TOKEN,
  CMS_API_URL: process.env.CMS_API_URL,
  CMS_AUTH_TOKEN: process.env.CMS_AUTH_TOKEN,
  PAYLOAD_API_URL: process.env.PAYLOAD_API_URL,
  PAYLOAD_PUBLIC_SERVER_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
}

afterEach(() => {
  resetCmsClientCacheForTests()
  vi.unstubAllGlobals()

  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
})

function responseJson(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  })
}

describe("CMS data integration", () => {
  it("falls back to markdown posts when CMS env vars are missing", async () => {
    delete process.env.CMS_API_URL
    delete process.env.PAYLOAD_API_URL
    delete process.env.PAYLOAD_PUBLIC_SERVER_URL

    await expect(getAllBlogPostsWithCms("en")).resolves.toEqual(getAllBlogPosts("en"))
  })

  it("does not fall back to markdown posts when configured CMS has no published posts", async () => {
    process.env.CMS_API_URL = "https://cms.example.com"
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        responseJson({
          docs: [],
        }),
      ),
    )

    await expect(getAllBlogPostsWithCms("en")).resolves.toEqual([])
  })

  it("normalizes CMS blog posts, localized requests, media URLs, and arrays", async () => {
    process.env.CMS_API_URL = "https://cms.example.com"
    process.env.CMS_API_TOKEN = "must-not-be-sent"
    process.env.CMS_AUTH_TOKEN = "must-not-be-sent"
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input))
      expect(url.pathname).toBe("/api/blog-posts")
      expect(url.searchParams.get("locale")).toBe("ja")
      expect(url.searchParams.get("where[_status][equals]")).toBe("published")
      expect(new Headers(init?.headers).has("Authorization")).toBe(false)

      return responseJson({
        docs: [
          {
            slug: "cms-post",
            title: "CMS Post",
            excerpt: "CMS excerpt",
            body: "Body from CMS",
            publishedAt: "2026-06-01T00:00:00.000Z",
            category: "IV Therapy",
            categorySlug: "iv-therapy",
            author: { name: "Author", role: "Role" },
            featured: true,
            featuredImage: { url: "/api/media/file/cms.jpg" },
            relatedServiceSlugs: [{ slug: "iv-therapy" }],
            tags: [{ tag: "hydration" }],
          },
        ],
      })
    })
    vi.stubGlobal("fetch", fetchMock)

    const posts = await getAllBlogPostsWithCms("ja")

    expect(posts).toHaveLength(1)
    expect(posts[0]).toMatchObject({
      slug: "cms-post",
      content: "Body from CMS",
      featureImage: "https://cms.example.com/api/media/file/cms.jpg",
      publishedAt: "2026-06-01",
      readingTime: 1,
      relatedServiceSlugs: ["iv-therapy"],
      sourcePath: "cms:blog-posts",
      tags: ["hydration"],
    })
  })

  it("builds category counts and related service posts from CMS posts", async () => {
    process.env.CMS_API_URL = "https://cms.example.com"
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        responseJson({
          docs: [
            {
              slug: "first",
              title: "First",
              excerpt: "First excerpt",
              body: "First body",
              publishedAt: "2026-06-01",
              category: "IV Therapy",
              categorySlug: "iv-therapy",
              author: { name: "Author", role: "Role" },
              relatedServiceSlugs: [{ slug: "iv-therapy" }],
            },
            {
              slug: "second",
              title: "Second",
              excerpt: "Second excerpt",
              body: "Second body",
              publishedAt: "2026-06-02",
              category: "IV Therapy",
              categorySlug: "iv-therapy",
              author: { name: "Author", role: "Role" },
              relatedServiceSlugs: [{ slug: "iv-therapy" }],
            },
          ],
        }),
      ),
    )

    await expect(getAllCategoriesWithCms("en")).resolves.toEqual([{ name: "IV Therapy", slug: "iv-therapy", count: 2 }])
    await expect(getBlogPostsForServiceWithCms("iv-therapy", 1, "en")).resolves.toMatchObject([{ slug: "second" }])
  })

  it("reads selected page copy from CMS", async () => {
    process.env.CMS_API_URL = "https://cms.example.com"
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = new URL(String(input))
        expect(url.pathname).toBe("/api/pages")
        expect(url.searchParams.get("where[key][equals]")).toBe("home")

        return responseJson({
          docs: [
            {
              key: "home",
              title: "CMS Home",
              heroDescription: "CMS hero",
              metaTitle: "CMS meta title",
              metaDescription: "CMS meta description",
            },
          ],
        })
      }),
    )

    await expect(getCorePageContent("home", "en")).resolves.toMatchObject({
      heroDescription: "CMS hero",
      metaDescription: "CMS meta description",
      metaTitle: "CMS meta title",
      title: "CMS Home",
    })
  })

  it("uses CMS-published posts in sitemap generation", async () => {
    process.env.CMS_API_URL = "https://cms.example.com"
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        responseJson({
          docs: [
            {
              slug: "published-cms-post",
              title: "Published CMS Post",
              excerpt: "Excerpt",
              body: "Body",
              publishedAt: "2026-06-03",
              category: "Wellness",
              categorySlug: "wellness",
              author: { name: "Author", role: "Role" },
            },
          ],
        }),
      ),
    )

    const { buildEntriesWithCms } = await import("@/app/sitemap.xml/route")
    const urls = (await buildEntriesWithCms()).map((entry) => entry.url)

    expect(urls).toContain("https://pitonne.jp/blog/published-cms-post/")
    expect(urls).toContain("https://pitonne.jp/blog/category/wellness/")
  })
})
