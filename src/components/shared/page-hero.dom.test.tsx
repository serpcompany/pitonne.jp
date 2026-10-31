import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageHero } from '@/components/shared/page-hero'
import { heroPageCases } from '@/test/pages'

describe('shared page hero', () => {
  it('renders the reusable left-aligned hero contract', () => {
    render(
      <PageHero
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Services', href: '/services/' },
          { label: 'IV Therapy' }
        ]}
        eyebrow="Category"
        title="IV Therapy"
        description="Targeted hydration and nutrient support in Tokyo."
        meta={<span>Updated January 2026</span>}
        actions={<a href="/contact">Contact Us</a>}
      />
    )

    expect(screen.getByLabelText('Breadcrumb')).toHaveTextContent('Home>Services>IV Therapy')
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'IV Therapy' })).toBeInTheDocument()
    expect(
      screen.getByText('Targeted hydration and nutrient support in Tokyo.')
    ).toBeInTheDocument()
    expect(screen.getByText('Updated January 2026')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contact Us' })).toHaveAttribute('href', '/contact')
    expect(document.querySelector('section')).toHaveClass('bg-[#faf9f7]')
    expect(document.querySelector('section > div > div')).toHaveClass('max-w-6xl')
  })

  it.each(
    heroPageCases
  )('renders the %s page (%s) through the shared hero', async (_name, _locale, page) => {
    const { container } = render(await page())
    const headings = container.querySelectorAll('h1')
    const breadcrumbs = container.querySelectorAll('nav[aria-label="Breadcrumb"]')

    expect(headings).toHaveLength(1)
    expect(breadcrumbs).toHaveLength(1)

    const hero = headings[0].closest('section')
    expect(hero).toHaveClass('bg-[#faf9f7]')
    expect(headings[0].parentElement).toHaveClass('max-w-6xl')
    expect(headings[0].parentElement?.parentElement).toHaveClass('container')
    expect(headings[0].parentElement?.parentElement?.parentElement).toBe(hero)
    expect(breadcrumbs[0].parentElement).toBe(headings[0].parentElement)
  })
})
