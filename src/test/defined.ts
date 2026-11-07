import { expect } from 'vitest'

export function defined<T>(value: T | null | undefined): T {
  expect(value).toBeDefined()
  expect(value).not.toBeNull()
  return value as T
}
