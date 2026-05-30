import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AreaDetailPage } from "@/components/area-detail-page"
import { getArea } from "@/lib/data/areas"

function renderHirooAreaDetail() {
  const area = getArea("minato", "hiroo")
  expect(area).toBeDefined()

  render(
    <AreaDetailPage
      areaName={area!.area.name}
      areaNameJa={area!.area.nameJa}
      wardName={area!.ward.name}
      wardSlug={area!.ward.slug}
      description={area!.area.description}
      highlights={area!.area.highlights}
      landmarks={area!.area.landmarks}
      otherAreas={[]}
    />,
  )
}

function expectLink(name: string, href: string, root: HTMLElement | Document = document) {
  expect(within(root as HTMLElement).getByRole("link", { name })).toHaveAttribute(
    "href",
    expect.stringMatching(new RegExp(`^${href.replaceAll("/", "\\/")}\\/?$`)),
  )
}

describe("area detail parity", () => {
  it("does not treat Tokyo Station as a Chiyoda area", () => {
    expect(getArea("chiyoda", "tokyo-station")).toBeUndefined()
  })

  it("renders the live-style area template with map, local access, and contact actions", () => {
    renderHirooAreaDetail()

    expect(
      screen.getByRole("heading", { level: 1, name: "Stem Cell & IV Therapy in Hiroo, Minato, Tokyo" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Care Available" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "How To Get Started" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Local Access" })).toBeInTheDocument()
    expect(screen.getByTitle("Hiroo, Minato, Tokyo map")).toHaveAttribute("src", expect.stringContaining("output=embed"))
    expect(screen.getByRole("heading", { name: "Contact Pitonne" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveAttribute("href", "/contact")
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveAttribute("target", "_blank")
    expect(screen.getByRole("link", { name: "View Services" })).toHaveAttribute("href", "/services")
    expect(screen.queryByRole("link", { name: /Call:/ })).not.toBeInTheDocument()
  })

  it("links every care available category and real service page", () => {
    renderHirooAreaDetail()

    const expectedCategories = [
      ["IV Therapy", "/services/iv-therapy"],
      ["Stem Cell Therapy", "/services/stem-cell-therapy"],
      ["Medications", "/services/medication"],
      ["Blood Tests", "/services/blood-tests"],
    ] as const

    for (const [name, href] of expectedCategories) {
      const heading = screen.getByRole("heading", { level: 3, name })
      expectLink(name, href, heading)
    }

    const expectedServices = [
      ["Exosome IV Drip", "/services/exosome-iv-drip"],
      ["Hangover IV Drip", "/services/hangover-iv-drip"],
      ["Energy & Fatigue Recovery IV", "/services/energy-fatigue-recovery-iv"],
      ["Skin Brightening IV Drip", "/services/skin-brightening-iv-drip"],
      ["Immune Boost IV Therapy", "/services/immune-boost-iv-therapy"],
      ["IV Vitamin Therapy", "/services/iv-vitamin-therapy"],
      ["Stem Cell Nasal Spray", "/services/stem-cell-nasal-spray"],
      ["ED Medication", "/services/ed-medication"],
      ["AGA Medication", "/services/androgenetic-alopecia-medicine"],
      ["Blood Tests", "/services/blood-tests"],
    ] as const

    for (const [name, href] of expectedServices) {
      expect(screen.getAllByRole("link", { name }).some((link) => link.getAttribute("href")?.match(`^${href}/?$`))).toBe(
        true,
      )
    }

    expect(screen.queryByText("Regenerative wellness planning")).not.toBeInTheDocument()
    expect(screen.queryByText("Discreet consultation")).not.toBeInTheDocument()
    expect(screen.queryByText("Prescription guidance")).not.toBeInTheDocument()
  })
})
