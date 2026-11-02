import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const root = process.cwd()

export function sourceExists(file: string): boolean {
  return fs.existsSync(path.join(root, file))
}

export function sourceFiles(directory: string): string[] {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => {
    const relative = `${directory}/${entry.name}`
    if (entry.isDirectory()) return sourceFiles(relative)
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [relative] : []
  })
}

export function parseSource(
  file: string,
  source = fs.readFileSync(path.join(root, file), 'utf8')
): ts.SourceFile {
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind)
}

export function importBase(from: string, specifier: string): string | undefined {
  if (specifier.startsWith('@/')) return `src/${specifier.slice(2)}`
  if (specifier.startsWith('.')) return path.posix.join(path.posix.dirname(from), specifier)
  return undefined
}

const NAMED_EXTENSION = /\.(?:tsx?|mts|mjs|json)$/

export function resolveSourceFile(
  base: string,
  exists: (file: string) => boolean = sourceExists
): string | undefined {
  const named = NAMED_EXTENSION.test(base) ? [base] : []
  return [...named, `${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`].find(
    exists
  )
}
