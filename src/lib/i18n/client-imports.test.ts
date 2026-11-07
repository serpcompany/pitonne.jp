import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import {
  importBase,
  parseSource,
  resolveSourceFile,
  sourceExists,
  sourceFiles
} from '@/test/source-files'

type Sources = Record<string, string>

const isDictionary = (file: string) =>
  file === 'src/lib/i18n/dictionaries.ts' || file.startsWith('src/lib/i18n/dictionaries/')

const isAreaCopy = (file: string) =>
  file === 'src/lib/data/areas.ts' || file.startsWith('src/lib/data/wards/')

function reader(fixtures: Sources = {}) {
  return {
    parse: (file: string) => parseSource(file, fixtures[file]),
    exists: (file: string) => file in fixtures || sourceExists(file)
  }
}

function isClientComponent(file: string, read = reader()): boolean {
  const [first] = read.parse(file).statements
  return (
    first !== undefined &&
    ts.isExpressionStatement(first) &&
    ts.isStringLiteral(first.expression) &&
    first.expression.text === 'use client'
  )
}

function runtimeImports(file: string, read: ReturnType<typeof reader>): string[] {
  if (file.endsWith('.json')) return []
  return read.parse(file).statements.flatMap(statement => {
    if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) return []
    const typeOnly = ts.isImportDeclaration(statement)
      ? statement.importClause?.isTypeOnly
      : statement.isTypeOnly
    const specifier = statement.moduleSpecifier
    if (typeOnly || !specifier || !ts.isStringLiteral(specifier)) return []
    const base = importBase(file, specifier.text)
    const resolved = base && resolveSourceFile(base, read.exists)
    return resolved ? [resolved] : []
  })
}

function bundledWith(entry: string, read = reader()): string[] {
  const seen = new Set([entry])
  const queue = [entry]
  for (let file = queue.shift(); file; file = queue.shift()) {
    for (const imported of runtimeImports(file, read)) {
      if (seen.has(imported)) continue
      seen.add(imported)
      queue.push(imported)
    }
  }
  return [...seen]
}

describe('client components', () => {
  const clientComponents = sourceFiles('src').filter(file => isClientComponent(file))

  it('are found by their use client directive', () => {
    expect(clientComponents).toContain('src/components/header.tsx')
  })

  it.each(clientComponents)('%s bundles no dictionary', file => {
    expect(bundledWith(file).filter(isDictionary)).toEqual([])
  })

  it.each(clientComponents)('%s bundles no area descriptions, only area names', file => {
    expect(bundledWith(file).filter(isAreaCopy)).toEqual([])
  })

  it.each([
    [
      'a dictionary file it imports directly',
      isDictionary,
      {
        'src/components/fixture.tsx': `'use client'\nimport en from '@/lib/i18n/dictionaries/en.json'\nexport const text = en`
      }
    ],
    [
      'a dictionary file a .mts module imports',
      isDictionary,
      {
        'src/components/fixture.tsx': `'use client'\nimport { text } from './fixture-text.mts'\nexport const shown = text`,
        'src/components/fixture-text.mts': `import ja from '@/lib/i18n/dictionaries/ja.json'\nexport const text = ja`
      }
    ],
    [
      'the dictionaries through a .mjs module',
      isDictionary,
      {
        'src/components/fixture.tsx': `'use client'\nimport { text } from './fixture-text.mjs'\nexport const shown = text`,
        'src/components/fixture-text.mjs': `export { getDictionary as text } from '@/lib/i18n/dictionaries'`
      }
    ],
    [
      'the area descriptions through the routes',
      isAreaCopy,
      {
        'src/components/fixture.tsx': `'use client'\nimport { getAreaNavigation } from '@/lib/data/routes'\nexport const shown = getAreaNavigation`,
        'src/lib/data/routes.ts': `import { wards } from './areas'\nexport const getAreaNavigation = () => wards`
      }
    ]
  ])('are caught bundling %s', (_, isServerOnly: (file: string) => boolean, fixtures: Sources) => {
    const read = reader(fixtures)
    expect(isClientComponent('src/components/fixture.tsx', read)).toBe(true)
    expect(bundledWith('src/components/fixture.tsx', read).filter(isServerOnly)).not.toEqual([])
  })
})
