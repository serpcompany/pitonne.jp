import { describe, expect, it } from 'vitest'
import { getService, serviceSlugForCmsValue } from '@/lib/data/services'

describe('related services a post names', () => {
  it('resolves a CMS file name to the service slug it differs from', () => {
    expect(serviceSlugForCmsValue('androgenetic-alopecia')).toBe('androgenetic-alopecia-medicine')
  })

  it('keeps a service slug written by hand in the frontmatter', () => {
    expect(serviceSlugForCmsValue('androgenetic-alopecia-medicine')).toBe(
      'androgenetic-alopecia-medicine'
    )
    expect(getService(serviceSlugForCmsValue('androgenetic-alopecia-medicine'))).toBeDefined()
  })
})
