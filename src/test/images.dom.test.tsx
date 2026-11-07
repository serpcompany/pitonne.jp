import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderedImageUrls } from '@/test/images'

const drive = `https://${['drive', 'google', 'com'].join('.')}`
const photos = `https://${['lh3', 'googleusercontent', 'com'].join('.')}`

describe('the images a page renders', () => {
  it('include image sources, srcset candidates, picture sources and style background URLs', () => {
    const { container } = render(
      <div>
        <img
          src="/_next/image?url=%2Fimages%2Fhero.jpg&w=640"
          srcSet="/a.jpg 1x, /b.jpg 2x"
          alt=""
        />
        <picture>
          <source srcSet={`${drive}/c.webp 1x, /d.webp 2x`} />
          <img src="/e.jpg" alt="" />
        </picture>
        <section style={{ backgroundImage: `url('${photos}/f')` }} />
        <section style={{ backgroundImage: 'url(/g.png), url("/h.png")' }} />
        <p style={{ color: 'red' }} />
      </div>
    )

    expect(renderedImageUrls(container)).toEqual([
      '/images/hero.jpg',
      '/a.jpg',
      '/b.jpg',
      '/e.jpg',
      `${drive}/c.webp`,
      '/d.webp',
      `${photos}/f`,
      '/g.png',
      '/h.png'
    ])
  })
})
