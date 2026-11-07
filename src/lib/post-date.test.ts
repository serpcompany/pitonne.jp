import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { formatPostDate } from '@/lib/post-date'

describe('formatPostDate', () => {
  const buildTimeZone = process.env.TZ

  beforeEach(() => {
    process.env.TZ = 'America/Denver'
  })

  afterEach(() => {
    if (buildTimeZone === undefined) {
      delete process.env.TZ
    } else {
      process.env.TZ = buildTimeZone
    }
  })

  it('shows the published day on a build machine west of UTC', () => {
    expect(new Date('2026-03-01').getDate()).toBe(28)
    expect(formatPostDate('2026-03-01', 'en')).toBe('March 1, 2026')
    expect(formatPostDate('2026-03-01', 'en', 'short')).toBe('Mar 1, 2026')
    expect(formatPostDate('2026-03-01', 'ja')).toBe('2026年3月1日')
    expect(formatPostDate('2026-03-01', 'ja', 'short')).toBe('2026年3月1日')
  })
})
