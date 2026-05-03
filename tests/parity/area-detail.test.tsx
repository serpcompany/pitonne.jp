import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AreaDetailPage } from "@/components/area-detail-page"
import { getArea } from "@/lib/data/areas"

describe("area detail parity", () => {
  it("does not treat Tokyo Station as a Chiyoda area", () => {
    expect(getArea("chiyoda", "tokyo-station")).toBeUndefined()
  })

  it("renders the live-style area template with map, local access, and contact actions", () => {
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
})
