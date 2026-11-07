import { describe, expect, it } from 'vitest'
import { getArea, wards } from '@/lib/data/areas'

describe('getArea', () => {
  it('finds a neighborhood only under its own ward', () => {
    const [ward, otherWard] = wards
    const area = ward.areas[0]
    expect(getArea(ward.slug, area.slug)).toEqual({ ward, area })
    expect(getArea(otherWard.slug, area.slug)).toBeUndefined()
  })

  it('finds nothing under a ward the site does not serve', () => {
    expect(getArea('nerima', wards[0].areas[0].slug)).toBeUndefined()
  })
})
