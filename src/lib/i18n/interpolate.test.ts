import { describe, expect, it } from 'vitest'
import { interpolate } from '@/lib/i18n/interpolate'

describe('interpolate', () => {
  it('replaces every {name} placeholder with its value', () => {
    expect(interpolate('{area}, {ward}, Tokyo map', { area: 'Hiroo', ward: 'Minato' })).toBe(
      'Hiroo, Minato, Tokyo map'
    )
    expect(interpolate('{ward}の地図（{ward}）', { ward: '港区' })).toBe('港区の地図（港区）')
  })

  it('returns text without placeholders unchanged and ignores unused values', () => {
    expect(interpolate('Areas Served', { ward: 'Minato' })).toBe('Areas Served')
  })

  it('inserts values literally, without replacement patterns', () => {
    expect(interpolate('{name}', { name: "$& and $' and {other}" })).toBe("$& and $' and {other}")
  })

  it('fails on a placeholder without a value', () => {
    expect(() => interpolate('{area}, Tokyo', { ward: 'Minato' })).toThrow('{area}')
  })
})
