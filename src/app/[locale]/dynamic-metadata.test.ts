import { describe, expect, it } from 'vitest'
import { generateMetadata as areaMetadata } from '@/app/[locale]/areas-served/[ward]/[area]/page'
import { generateMetadata as serviceMetadata } from '@/app/[locale]/services/[service]/page'
import { generateMetadata as watchMetadata } from '@/app/[locale]/watch/[video]/page'
import { getAllAreas } from '@/lib/data/areas'
import { getAllServiceSlugs, getService } from '@/lib/data/services'
import { pitonneVideos } from '@/lib/data/videos'
import { locales } from '@/lib/i18n/config'
import { fitsTitleLimit } from '@/lib/seo'
import { defined } from '@/test/defined'

const params = <T extends object>(values: T) => ({ params: Promise.resolve(values) })

describe.each(locales)('page titles and descriptions (%s)', locale => {
  it('keeps every area page title within the title limit', async () => {
    for (const { ward, area } of getAllAreas()) {
      const { title } = await areaMetadata(params({ locale, ward: ward.slug, area: area.slug }))
      expect(fitsTitleLimit(String(title)), String(title)).toBe(true)
    }
  })

  it('describes a service by its meta description, or by its short description when it has none', async () => {
    const services = getAllServiceSlugs(locale).map(slug => defined(getService(slug, locale)))
    const described = services.filter(service => service.metaDescription)
    const undescribed = services.filter(service => !service.metaDescription)

    expect(described.length).toBeGreaterThan(0)
    expect(undescribed.length).toBeGreaterThan(0)
    for (const service of services) {
      const metadata = await serviceMetadata(params({ locale, service: service.slug }))
      expect(metadata.description).toBe(service.metaDescription ?? service.shortDescription)
    }
  })
})

describe('area page titles', () => {
  it.each([
    ['en', 'minato', 'roppongi', 'IV Therapy, Stem Cells & Blood Tests in Roppongi, Minato'],
    ['ja', 'minato', 'roppongi', '六本木（港区）の点滴療法・幹細胞・血液検査'],
    ['en', 'shibuya', 'yoyogi-uehara', 'IV Therapy, Stem Cells & Blood Tests in Yoyogi Uehara']
  ])('titles %s %s/%s as %j, leaving the ward out only when it would run too long', async (locale, ward, area, title) => {
    expect((await areaMetadata(params({ locale, ward, area }))).title).toBe(title)
  })
})

describe('watch page titles and descriptions', () => {
  it('uses a video’s English SEO title where it has one, and its English meta description', async () => {
    for (const video of pitonneVideos) {
      expect(await watchMetadata(params({ locale: 'en', video: video.slug }))).toMatchObject({
        title: video.metaTitle ?? video.title,
        description: video.metaDescription
      })
    }
  })

  it('uses a video’s Japanese title and meta description on its Japanese page', async () => {
    for (const video of pitonneVideos) {
      expect(await watchMetadata(params({ locale: 'ja', video: video.slug }))).toMatchObject({
        title: video.titleJa,
        description: video.metaDescriptionJa
      })
    }
  })

  it('falls back to the English title on the Japanese page of a video with no Japanese title', async () => {
    const { titleJa: _title, ...english } = pitonneVideos[0]
    const englishOnly = { ...english, slug: 'a-video-with-no-japanese-title' }
    pitonneVideos.push(englishOnly)
    try {
      expect(await watchMetadata(params({ locale: 'ja', video: englishOnly.slug }))).toMatchObject({
        title: englishOnly.title,
        description: englishOnly.metaDescriptionJa
      })
    } finally {
      pitonneVideos.pop()
    }
  })
})
