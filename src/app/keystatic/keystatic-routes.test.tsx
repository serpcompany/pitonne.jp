import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import KeystaticPage, { generateStaticParams } from '@/app/keystatic/[[...params]]/page'
import KeystaticApp from '@/app/keystatic/keystatic-app'
import KeystaticLayout, { metadata } from '@/app/keystatic/layout'

type Element = ReactElement<{ lang?: string; children?: Element }>

describe('the CMS at /keystatic', () => {
  it('is one English document whose body is the Keystatic app, for every CMS path', () => {
    const html = KeystaticLayout() as Element
    const body = html.props.children as Element

    expect(html.type).toBe('html')
    expect(html.props.lang).toBe('en')
    expect(body.type).toBe('body')
    expect((body.props.children as Element).type).toBe(KeystaticApp)
    expect(generateStaticParams()).toEqual([{ params: [] }])
    expect(KeystaticPage()).toBeNull()
  })

  it('is kept out of search engines', () => {
    expect(metadata).toEqual({ title: 'Pitonne CMS', robots: { index: false, follow: false } })
  })
})
