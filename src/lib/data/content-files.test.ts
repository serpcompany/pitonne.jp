import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const contentDirectory = path.join(process.cwd(), 'content')
const migrationArtifacts = [
  'localhost:10013',
  'wp-content/uploads',
  'controls_data',
  'SubmitResponseMarkup',
  'This draft should be finalized'
]

function contentFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return contentFiles(fullPath)
    return entry.isFile() ? [fullPath] : []
  })
}

describe('content files', () => {
  it('carry no WordPress or drafting leftovers from the migration', () => {
    const found = contentFiles(contentDirectory).flatMap(file => {
      const text = fs.readFileSync(file, 'utf8')
      return migrationArtifacts
        .filter(artifact => text.includes(artifact))
        .map(artifact => `${path.relative(process.cwd(), file)}: ${artifact}`)
    })

    expect(found).toEqual([])
  })
})
