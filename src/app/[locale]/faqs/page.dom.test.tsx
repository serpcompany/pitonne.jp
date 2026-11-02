import { render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import FaqsPage, { generateMetadata } from '@/app/[locale]/faqs/page'
import { locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { sitemapEntries } from '@/lib/sitemaps'
import { jsonLdFrom } from '@/test/json-ld'

const SITE_URL = 'https://pitonne.jp'
const dict = getDictionary('en')

describe('FAQs page', () => {
  it.each(
    locales
  )('gives search engines its questions and answers as FAQPage data (%s)', async locale => {
    const markup = renderToStaticMarkup(await FaqsPage({ params: Promise.resolve({ locale }) }))
    const faq = jsonLdFrom(markup).find(schema => schema['@type'] === 'FAQPage')

    expect(faq.mainEntity).toEqual(
      getDictionary(locale).faqs.items.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer }
      }))
    )
  })

  it('renders the requested FAQ content', async () => {
    render(await FaqsPage({ params: Promise.resolve({ locale: 'en' }) }))

    expect(
      screen.getByRole('heading', { name: dict.faqs.frequentlyAskedQuestions, level: 1 })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'Are both mobile visits and in clinic appointments available?'
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Pitonne primarily offers mobile visits to your home, hotel, or office/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'Are same day appointments available?'
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Same day appointments may be available depending on schedule and location/i)
    ).toBeInTheDocument()
  })

  it('exposes FAQ metadata and sitemap entry', async () => {
    const urls = sitemapEntries('pages').map(entry => entry.url)

    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) })
    expect(metadata).toMatchObject({
      title: dict.faqs.frequentlyAskedQuestions,
      alternates: expect.objectContaining({ canonical: `${SITE_URL}/faqs/` })
    })
    expect(urls).toContain(`${SITE_URL}/faqs/`)
  })
})
