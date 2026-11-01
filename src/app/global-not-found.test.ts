import { describe, expect, it, vi } from 'vitest'
import { generateMetadata } from '@/app/global-not-found'
import { getDictionary } from '@/lib/i18n/dictionaries'

vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: 'font-inter' }),
  Playfair_Display: () => ({ variable: 'font-playfair' })
}))

describe('global not-found page', () => {
  it('takes its title from the dictionary and leaves the single noindex tag to Next.js', async () => {
    const metadata = await generateMetadata()

    expect(metadata.title).toBe(getDictionary('en').notFound.metaTitle)
    expect(metadata.icons).toBeDefined()
    expect(metadata).not.toHaveProperty('robots')
  })
})
