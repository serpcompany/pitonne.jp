import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { BlogPostTemplate } from "@/components/blog/blog-post-template"
import { ServiceDetailTemplate } from "@/components/services/service-detail-template"
import { getBlogPostBySlug, getBlogPostsByCategory, getAllBlogPosts } from "@/lib/data/blog-posts"
import { businessHours, isOpenBusinessHours } from "@/lib/data/site"
import { getService, getServicesFromSlugs } from "@/lib/data/services"

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "font-inter" }),
  Playfair_Display: () => ({ variable: "font-playfair" }),
}))

function jsonLdFrom(markup: string) {
  return [...markup.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) =>
    JSON.parse(match[1]),
  )
}

describe("structured data parity", () => {
  it("renders organization and website JSON-LD in the root layout", async () => {
    const { default: LocaleLayout } = await import("@/app/[locale]/layout")
    const markup = renderToStaticMarkup(
      await LocaleLayout({
        children: <div>Body</div>,
        params: Promise.resolve({ locale: "en" }),
      }),
    )
    const schemas = jsonLdFrom(markup)

    expect(schemas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "@type": "MedicalBusiness",
          "@id": "https://pitonne.jp/#business",
          name: "Pitonne",
          url: "https://pitonne.jp/",
          telephone: "03-6821-8285",
        }),
        expect.objectContaining({
          "@type": "WebSite",
          "@id": "https://pitonne.jp/#website",
          url: "https://pitonne.jp/",
        }),
      ]),
    )

    const businessSchema = schemas.find((schema) => schema["@id"] === "https://pitonne.jp/#business")
    expect(businessSchema).toBeDefined()
    expect(businessSchema.openingHoursSpecification).toEqual(
      businessHours.filter(isOpenBusinessHours).map((item) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: item.day,
        opens: item.opens,
        closes: item.closes,
      })),
    )
    expect(businessSchema.openingHoursSpecification).not.toContainEqual(
      expect.objectContaining({
        dayOfWeek: "Sunday",
      }),
    )
  })

  it("renders Service JSON-LD on service detail pages", () => {
    const service = getService("exosome-iv-drip")
    expect(service).toBeDefined()

    const markup = renderToStaticMarkup(
      <ServiceDetailTemplate
        service={service!}
        parentService={getService(service!.parentSlug!)}
        relatedServices={getServicesFromSlugs(service!.relatedServices)}
        relatedPosts={[]}
        locale="en"
      />,
    )
    const schemas = jsonLdFrom(markup)

    expect(schemas).toContainEqual(
      expect.objectContaining({
        "@type": "Service",
        "@id": "https://pitonne.jp/services/exosome-iv-drip/#service",
        name: "Exosome IV Drip",
        provider: { "@id": "https://pitonne.jp/#business" },
      }),
    )
  })

  it("renders BlogPosting JSON-LD on blog post pages", () => {
    const post = getBlogPostBySlug("iv-therapy-for-hangover")
    expect(post).toBeDefined()

    const markup = renderToStaticMarkup(
      <BlogPostTemplate
        post={{
          title: post!.title,
          slug: post!.slug,
          date: new Date(post!.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          content: post!.content,
          excerpt: post!.excerpt,
          readingTime: post!.readingTime,
          category: post!.category,
          categorySlug: post!.categorySlug,
          author: post!.author,
          featureImage: post!.featureImage,
          relatedServiceSlugs: post!.relatedServiceSlugs,
          tags: post!.tags,
        }}
        relatedPosts={getBlogPostsByCategory(post!.categorySlug).filter((candidate) => candidate.slug !== post!.slug)}
        relatedServices={getServicesFromSlugs(post!.relatedServiceSlugs || [])}
        latestPosts={getAllBlogPosts().filter((candidate) => candidate.slug !== post!.slug)}
        locale="en"
      />,
    )
    const schemas = jsonLdFrom(markup)

    expect(schemas).toContainEqual(
      expect.objectContaining({
        "@type": "BlogPosting",
        "@id": "https://pitonne.jp/blog/iv-therapy-for-hangover/#blog-posting",
        headline: post!.title,
        author: expect.objectContaining({ name: post!.author.name }),
      }),
    )
  })
})
