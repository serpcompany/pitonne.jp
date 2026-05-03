import fs from "node:fs"
import path from "node:path"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PageHero } from "@/components/shared/page-hero"

describe("shared page hero", () => {
  it("renders the reusable left-aligned hero contract", () => {
    render(
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services/" },
          { label: "IV Therapy" },
        ]}
        eyebrow="Category"
        title="IV Therapy"
        description="Targeted hydration and nutrient support in Tokyo."
        meta={<span>Updated January 2026</span>}
        actions={<a href="/contact">Contact Us</a>}
      />,
    )

    expect(screen.getByLabelText("Breadcrumb")).toHaveTextContent("Home>Services>IV Therapy")
    expect(screen.getByText("Category")).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1, name: "IV Therapy" })).toBeInTheDocument()
    expect(screen.getByText("Targeted hydration and nutrient support in Tokyo.")).toBeInTheDocument()
    expect(screen.getByText("Updated January 2026")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveAttribute("href", "/contact")
    expect(document.querySelector("section")).toHaveClass("bg-[#faf9f7]")
    expect(document.querySelector("section > div > div")).toHaveClass("max-w-6xl")
  })

  it("keeps non-home routes from owning local hero markup", () => {
    const files = [
      "app/about/page.tsx",
      "app/contact/page.tsx",
      "app/blog/page.tsx",
      "app/areas-served/page.tsx",
      "app/blog/category/[category]/page.tsx",
      "app/areas-served/[ward]/page.tsx",
      "app/legal/page.tsx",
      "app/legal/privacy-policy/page.tsx",
      "app/legal/terms-conditions/page.tsx",
      "app/legal/disclaimer/page.tsx",
      "components/services/services-index-template.tsx",
      "components/services/service-parent-template.tsx",
      "components/services/service-detail-template.tsx",
      "components/area-detail-page.tsx",
      "components/blog/blog-post-template.tsx",
    ]

    const offenders = files.filter((file) => {
      const source = fs.readFileSync(path.join(process.cwd(), file), "utf8")
      return source.includes("Hero Section") || source.includes("<nav className=\"text-sm text-muted-foreground mb-8\"")
    })

    expect(offenders).toEqual([])
  })
})
