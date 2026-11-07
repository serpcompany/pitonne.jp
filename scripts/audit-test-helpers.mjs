import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, vi } from 'vitest'

export const robots = {
  production: [
    'User-Agent: *',
    'Allow: /',
    'Disallow: /keystatic/',
    '',
    'Sitemap: https://pitonne.jp/sitemap-index.xml'
  ],
  staging: [
    'User-Agent: *',
    'Disallow: /',
    '',
    'User-Agent: AhrefsSiteAudit',
    'Allow: /',
    'Disallow: /keystatic/',
    '',
    'Sitemap: https://staging.pitonne.jp/sitemap-index.xml'
  ],
  preview: ['User-Agent: *', 'Disallow: /', '', 'Sitemap: https://pitonne.jp/sitemap-index.xml']
}

export function runAudit(main, argv, options) {
  const output = { stdout: [], stderr: [] }
  const log = vi.spyOn(console, 'log').mockImplementation(line => output.stdout.push(line))
  const error = vi.spyOn(console, 'error').mockImplementation(line => output.stderr.push(line))
  const exitCode = process.exitCode
  try {
    main(argv, options)
    return {
      status: process.exitCode,
      stdout: output.stdout.join('\n'),
      stderr: output.stderr.join('\n')
    }
  } finally {
    process.exitCode = exitCode
    log.mockRestore()
    error.mockRestore()
  }
}

export function tempTrees() {
  const folders = []
  afterEach(() => {
    for (const folder of folders.splice(0)) fs.rmSync(folder, { recursive: true, force: true })
  })
  return (prefix, files, under = '') => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix))
    folders.push(root)
    for (const [file, content] of Object.entries(files)) {
      if (content === null) continue
      const target = path.join(root, under, file)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, content)
    }
    return root
  }
}
