import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ServicesIndexTemplate } from "@/components/services/services-index-template"
import { ServiceDetailTemplate } from "@/components/services/service-detail-template"
import { ServiceParentTemplate } from "@/components/services/service-parent-template"
import {
  getChildServices,
  getService,
  getServiceCategorySections,
  getServicesFromSlugs,
} from "@/lib/data/services"
import { getBlogPostsForService } from "@/lib/data/blog-posts"
import { businessInfo } from "@/lib/data/site"

describe("service page parity", () => {
  it("renders leaf services with breadcrumbs, sidebar, and the live booking URL", () => {
    const service = getService("stem-cell-nasal-spray")
    expect(service).toBeDefined()

    render(
      <ServiceDetailTemplate
        service={service!}
        parentService={getService(service!.parentSlug!)}
        relatedServices={getServicesFromSlugs(service!.relatedServices)}
        relatedPosts={getBlogPostsForService(service!.slug)}
      />,
    )

    expect(screen.getByLabelText("Breadcrumb")).toHaveTextContent("Home>Services>Stem Cell Therapy>Stem Cell Nasal Spray")
    expect(screen.getByRole("heading", { name: "Related Services" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Related Posts" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Book Consultation" })).toHaveAttribute("href", businessInfo.bookingUrl)
    expect(screen.queryByText("Ready to Get Started?")).not.toBeInTheDocument()
    expect(document.querySelector("[style*='background-image']")).not.toBeInTheDocument()
  })

  it("renders parent services as category pages with available treatments only", () => {
    const service = getService("iv-therapy")
    expect(service).toBeDefined()

    render(<ServiceParentTemplate service={service!} childServices={getChildServices(service!.slug)} />)

    expect(screen.getByRole("heading", { name: "Available Treatments" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Exosome IV Drip" })).toHaveAttribute("href", "/services/exosome-iv-drip")
    expect(screen.queryByRole("heading", { name: "Treatment Overview" })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Book Consultation" })).not.toBeInTheDocument()
  })

  it("matches live service index grouping and card order", () => {
    render(<ServicesIndexTemplate sections={getServiceCategorySections()} />)

    const ivSection = screen.getByTestId("service-section-iv-therapy")
    const ivCards = within(ivSection).getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)
    expect(ivCards).toEqual([
      "Exosome IV Drip",
      "Hangover IV Drip",
      "Energy & Fatigue Recovery IV",
      "Skin Brightening IV Drip",
      "Immune Boost IV Therapy",
      "IV Vitamin Therapy",
    ])

    const stemCellSection = screen.getByTestId("service-section-stem-cell-therapy")
    expect(within(stemCellSection).getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual([
      "Stem Cell Nasal Spray",
    ])
    expect(screen.queryByRole("heading", { name: "Ready to Start Your Wellness Journey?" })).not.toBeInTheDocument()
  })
})
