import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AboutPage from '@/app/[locale]/about/page'
import { getBusinessInfo } from '@/lib/data/site'
import { locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { defined } from '@/test/defined'

const team = ['Kanako', 'Saori', 'Akira'] as const
const flat = (text: string | null) => (text ?? '').replace(/\s+/g, ' ').trim()

describe.each(locales)('about page (%s)', locale => {
  const { about, common } = getDictionary(locale)

  it('introduces the three members of the team with their roles and bios, and offers booking', async () => {
    render(await AboutPage({ params: Promise.resolve({ locale }) }))

    for (const member of team) {
      const name = screen.getByRole('heading', { level: 3, name: about[`team${member}Name`] })
      const card = defined(name.parentElement)
      expect(within(card).getByText(about[`team${member}Role`])).toBeInTheDocument()
      expect(flat(card.textContent)).toContain(flat(about[`team${member}Bio`]))
    }
    expect(screen.getByRole('link', { name: common.bookConsultation })).toHaveAttribute(
      'href',
      getBusinessInfo(locale).bookingUrl
    )
  })
})
