import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => {
    const relative = `${directory}/${entry.name}`
    if (entry.isDirectory()) return sourceFiles(relative)
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [relative] : []
  })
}

function parse(file: string): ts.SourceFile {
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
}

function isClientComponent(file: string): boolean {
  const [first] = parse(file).statements
  return (
    first !== undefined &&
    ts.isExpressionStatement(first) &&
    ts.isStringLiteral(first.expression) &&
    first.expression.text === 'use client'
  )
}

function resolveImport(from: string, specifier: string): string | undefined {
  const base = specifier.startsWith('@/')
    ? `src/${specifier.slice(2)}`
    : specifier.startsWith('.')
      ? path.posix.join(path.posix.dirname(from), specifier)
      : undefined
  if (!base) return undefined
  return [`${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`, base].find(file =>
    fs.existsSync(path.join(root, file))
  )
}

function runtimeImports(file: string): string[] {
  return parse(file).statements.flatMap(statement => {
    if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) return []
    const typeOnly = ts.isImportDeclaration(statement)
      ? statement.importClause?.isTypeOnly
      : statement.isTypeOnly
    const specifier = statement.moduleSpecifier
    if (typeOnly || !specifier || !ts.isStringLiteral(specifier)) return []
    const resolved = resolveImport(file, specifier.text)
    return resolved ? [resolved] : []
  })
}

function bundledWith(entry: string): string[] {
  const seen = new Set([entry])
  const queue = [entry]
  for (let file = queue.shift(); file; file = queue.shift()) {
    if (!/\.tsx?$/.test(file)) continue
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
    expect(
      bundledWith(file).filter(imported => imported.startsWith('src/lib/i18n/dictionaries'))
    ).toEqual([])
  })
})
