import { describe, expect, it } from 'vitest'
import { blocksEverything } from './robots-txt.mjs'

const gated = [
  'User-Agent: *',
  'Disallow: /',
  '',
  'User-Agent: AhrefsSiteAudit',
  'Allow: /',
  'Disallow: /keystatic/',
  '',
  'Sitemap: https://staging.pitonne.jp/sitemap-index.xml'
].join('\n')

describe('robots.txt groups', () => {
  it('applies the group naming a user agent, or else the * group', () => {
    expect(blocksEverything(gated)).toBe(true)
    expect(blocksEverything(gated, 'AhrefsSiteAudit')).toBe(false)
    expect(blocksEverything(gated, 'ahrefssiteaudit')).toBe(false)
    expect(blocksEverything(gated, 'Googlebot')).toBe(true)
  })

  it('reads production rules as open and a preview disallow as closed for everyone', () => {
    const production = 'User-Agent: *\nAllow: /\nDisallow: /keystatic/\n'
    expect(blocksEverything(production, 'AhrefsSiteAudit')).toBe(false)
    expect(blocksEverything('User-Agent: *\r\nDisallow: /\r\n', 'AhrefsSiteAudit')).toBe(true)
    expect(blocksEverything('User-agent: *\ndisallow: /   # everything\n')).toBe(true)
    expect(blocksEverything('')).toBe(false)
  })

  it('shares rules between consecutive user agents and starts a new group after rules', () => {
    const shared = 'User-Agent: a\nUser-Agent: b\nDisallow: /\nUser-Agent: c\nAllow: /\n'
    expect(blocksEverything(shared, 'a')).toBe(true)
    expect(blocksEverything(shared, 'b')).toBe(true)
    expect(blocksEverything(shared, 'c')).toBe(false)
    const separate = 'User-Agent: a\nAllow: /\nUser-Agent: b\nDisallow: /\n'
    expect(blocksEverything(separate, 'a')).toBe(false)
    expect(blocksEverything(separate, 'b')).toBe(true)
  })

  it('merges the rules of every group that names the same user agent', () => {
    const repeated =
      'User-Agent: a\nDisallow: /\n\nUser-Agent: b\nAllow: /\n\nUser-Agent: a\nDisallow: /keystatic/\n'
    expect(blocksEverything(repeated, 'a')).toBe(true)
    expect(blocksEverything(repeated, 'b')).toBe(false)
  })
})
