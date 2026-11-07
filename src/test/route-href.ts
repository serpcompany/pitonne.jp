import { expect } from 'vitest'

const escaped = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function routeHref(path: string) {
  const bare = path.replace(/\/$/, '')
  return bare === '' ? '/' : expect.stringMatching(new RegExp(`^${escaped(bare)}/?$`))
}
