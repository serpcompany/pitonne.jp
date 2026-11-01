import { expect } from 'vitest'

export function routeHref(path: string) {
  return expect.stringMatching(new RegExp(`^${path.replace(/\/$/, '')}/?$`))
}
