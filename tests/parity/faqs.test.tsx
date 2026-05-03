import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import FaqsPage, { metadata } from "@/app/faqs/page"

const SITE_URL = "https://pitonne.jp"

describe("FAQs page", () => {
  it("renders the requested FAQ content", () => {
    render(<FaqsPage />)

    expect(screen.getByRole("heading", { name: "FAQs", level: 1 })).toBeInTheDocument()
    expect(
      screen.getByRole("heading", {
        name: "Are both mobile visits and in clinic appointments available?",
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Pitonne primarily offers mobile visits to your home, hotel, or office/i)).toBeInTheDocument()
    expect(
      screen.getByRole("heading", {
        name: "Are same day appointments available?",
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Same day appointments may be available depending on schedule and location/i)).toBeInTheDocument()
  })

  it("exposes FAQ metadata and sitemap entry", async () => {
    const sitemap = (await import("@/app/sitemap")).default()
    const urls = sitemap.map((entry) => entry.url)

    expect(metadata).toMatchObject({
      title: "FAQs",
      alternates: { canonical: `${SITE_URL}/faqs/` },
    })
    expect(urls).toContain(`${SITE_URL}/faqs/`)
  })
})
