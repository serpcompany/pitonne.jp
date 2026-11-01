import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { importBase, parseSource, resolveSourceFile, sourceFiles } from '@/test/source-files'

function isClientComponent(file: string): boolean {
  const [first] = parseSource(file).statements
  return (
    first !== undefined &&
    ts.isExpressionStatement(first) &&
    ts.isStringLiteral(first.expression) &&
    first.expression.text === 'use client'
  )
}

function runtimeImports(file: string): string[] {
  return parseSource(file).statements.flatMap(statement => {
    if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) return []
    const typeOnly = ts.isImportDeclaration(statement)
      ? statement.importClause?.isTypeOnly
      : statement.isTypeOnly
    const specifier = statement.moduleSpecifier
    if (typeOnly || !specifier || !ts.isStringLiteral(specifier)) return []
    const base = importBase(file, specifier.text)
    const resolved = base && resolveSourceFile(base)
    return resolved ? [resolved] : []
  })
}

function bundledWith(entry: string): string[] {
  const seen = new Set([entry])
  const queue = [entry]
  for (let file = queue.shift(); file; file = queue.shift()) {
    for (const imported of runtimeImports(file)) {
      if (seen.has(imported)) continue
      seen.add(imported)
      queue.push(imported)
    }
  }
  return [...seen]
}

describe('client components', () => {
  const clientComponents = sourceFiles('src').filter(isClientComponent)

  it('are found by their use client directive', () => {
    expect(clientComponents).toContain('src/components/header.tsx')
  })

  it.each(clientComponents)('%s bundles no dictionary', file => {
    expect(bundledWith(file)).not.toContain('src/lib/i18n/dictionaries.ts')
  })
})
