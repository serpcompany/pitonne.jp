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
    expect(screen.getByRole("link", { name: "Book Consultation" })).toHaveAttribute("target", "_blank")
    expect(screen.getByRole("img", { name: "Stem Cell Nasal Spray" })).toHaveClass("max-h-[420px]", "object-cover")
    expect(screen.queryByText("Ready to Get Started?")).not.toBeInTheDocument()
    expect(document.querySelector("[style*='background-image']")).not.toBeInTheDocument()
  })

  it("renders parent services as category pages with available treatments only", () => {
    const service = getService("iv-therapy")
    expect(service).toBeDefined()

    render(<ServiceParentTemplate service={service!} childServices={getChildServices(service!.slug)} />)

    const hero = screen.getByRole("heading", { level: 1, name: service!.name }).closest("section")
    expect(hero).not.toBeNull()
    expect(within(hero as HTMLElement).getByText(service!.fullDescription)).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Overview" })).not.toBeInTheDocument()
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

  it("loads service page copy from the shared service content docs", () => {
    const service = getService("exosome-iv-drip")
    expect(service).toBeDefined()
    expect(service?.sourcePath).toBe("content/services/exosome-iv-drip.md")
    expect(service?.content).toContain("## Treatment Overview")
    expect(service?.content).toContain("## Physician-Guided Wellness Care")

    expect(service?.content).toContain("## How It Works")
    expect(service?.content).toContain("derived from stem cell supernatants")
    expect(service?.content).toContain("support recovery from physical stress or injury")
    expect(service?.content).not.toContain("localhost:10013")
    expect(service?.content).not.toContain("wp-content/uploads")
    expect(service?.content).not.toContain("controls_data")
    expect(service?.fullDescription).toContain("derived from stem cell supernatants")
    expect(service?.benefits).toContain("Supports recovery from injuries or physical strain")

    expect(getService("iv-therapy")?.fullDescription).toContain("online medical consultation with a partner physician")
    expect(getService("energy-fatigue-recovery-iv")?.content).toContain("mental clarity, and overall recovery")
    expect(getService("immune-boost-iv-therapy")?.faqs).toContainEqual(
      expect.objectContaining({
        question: "Is this a substitute for regular medical care?",
      }),
    )
    expect(getService("skin-brightening-iv-drip")?.content).toContain("before vacations, after outdoor activities")
    expect(getService("medication")?.fullDescription).toContain("clinic pickup or local delivery")
    expect(getService("ed-medication")?.content).toContain("re-examination fees may be waived")
    expect(getService("stem-cell-nasal-spray")?.content).toContain("Bike courier fees apply separately")
    expect(getService("stem-cell-therapy")?.content).toContain("autologous adipose-derived stem cell therapy")
    expect(getService("stem-cell-therapy")?.faqs).toContainEqual(
      expect.objectContaining({
        question: "How long does the process take?",
      }),
    )
  })
})
