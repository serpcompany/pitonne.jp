import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { main } from './audit-sheet-images.mjs'

const recordedText = fs.readFileSync(
  path.resolve('docs/image-audit/sheet-image-manifest.json'),
  'utf8'
)
const recorded = JSON.parse(recordedText)
const firstRowNames = recorded.entries.filter(
  entry => !entry.blogSlug && entry.sheetName !== 'blog'
)
const rowNames = recorded.entries.filter(entry => entry.blogSlug || entry.sheetName === 'blog')
const driveUrl = id => `https://drive.google.com/file/d/${id}/view?usp=drive_link`
const quoted = text => `"${text.replaceAll('"', '""')}"`

let root
let log

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-sheet-images-'))
  vi.spyOn(process, 'cwd').mockReturnValue(root)
  log = vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  fs.rmSync(root, { recursive: true, force: true })
})

function sheetCsv({ firstRowIds, rows = rowNames, ending = '\r\n' } = {}) {
  const ids = firstRowIds ?? firstRowNames.map(entry => entry.driveId).filter(Boolean)
  const firstRow = [
    'Page',
    quoted('Title, with "quotes"'),
    '',
    '',
    quoted(ids.map(driveUrl).join('\n'))
  ].join(',')
  const lines = rows.map(entry =>
    [entry.sheetName, '', '', '', entry.driveId ? driveUrl(entry.driveId) : ''].join(',')
  )
  return [firstRow, ...lines].join('\r\n') + ending
}

function google({ csv = sheetCsv(), sheet = {}, drive = id => recordedDrive(id) } = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, init) => {
      const address = new URL(url)
      if (address.hostname === 'docs.google.com') {
        expect(String(url)).toBe(recorded.sourceSheetCsvUrl)
        return new Response(csv, { status: 200, ...sheet })
      }
      expect(init).toEqual({ method: 'HEAD', redirect: 'follow' })
      expect(address.pathname).toBe('/uc')
      expect(address.searchParams.get('export')).toBe('download')
      return drive(address.searchParams.get('id'))
    })
  )
}

function recordedDrive(id) {
  const entry = recorded.entries.find(candidate => candidate.driveId === id)
  return new Response(null, {
    headers: { 'content-disposition': `attachment; filename="${entry.driveFilename}"` }
  })
}

const manifestPath = () => path.join(root, 'docs', 'image-audit', 'sheet-image-manifest.json')
const written = () => JSON.parse(fs.readFileSync(manifestPath(), 'utf8'))

describe('pnpm audit:sheet-images', () => {
  it('rebuilds the recorded manifest from a sheet that still matches it, all but its time', async () => {
    google()

    await main()

    const { generatedAt } = written()
    expect(new Date(generatedAt).toISOString()).toBe(generatedAt)
    expect(fs.readFileSync(manifestPath(), 'utf8')).toBe(
      recordedText.replace(recorded.generatedAt, generatedAt)
    )
    const count = status => recorded.entries.filter(entry => entry.status === status).length
    expect(log.mock.calls.map(call => call[0])).toEqual([
      `Wrote ${manifestPath()}`,
      `Used: ${count('used')}`,
      `Unmapped: ${count('unmapped')}`
    ])
  })

  it.each([
    ['ends without a line break', ''],
    ['ends its last blog row with an empty cell', ',']
  ])('reads a sheet export that %s', async (_name, ending) => {
    google({ csv: sheetCsv({ ending }) })

    await main()

    expect(written().entries).toEqual(recorded.entries)
  })

  it('records a Drive filename given without quotes, or none when Drive sends none', async () => {
    const [unquoted, missing] = firstRowNames.filter(entry => entry.driveId)
    google({
      drive: id => {
        if (id === unquoted.driveId) {
          return new Response(null, {
            headers: { 'content-disposition': 'attachment; filename=Plain Name.jpg; size=1' }
          })
        }
        return id === missing.driveId ? new Response(null) : recordedDrive(id)
      }
    })

    await main()

    const byName = name => written().entries.find(entry => entry.sheetName === name)
    expect(byName(unquoted.sheetName).driveFilename).toBe('Plain Name.jpg')
    expect(byName(missing.sheetName).driveFilename).toBeNull()
  })

  it('fails and writes nothing when the sheet cannot be downloaded', async () => {
    google({ sheet: { status: 500, statusText: 'Internal Server Error' } })

    await expect(main()).rejects.toThrow(
      `Failed to fetch ${recorded.sourceSheetCsvUrl}: 500 Internal Server Error`
    )
    expect(fs.existsSync(manifestPath())).toBe(false)
  })

  it('fails when Drive will not describe an image', async () => {
    const [first] = recorded.entries.filter(entry => entry.driveId)
    google({ drive: () => new Response(null, { status: 404, statusText: 'Not Found' }) })

    await expect(main()).rejects.toThrow(
      `Failed to fetch Drive metadata for ${first.driveId}: 404 Not Found`
    )
    expect(fs.existsSync(manifestPath())).toBe(false)
  })

  it('fails when the first row has lost an image the manifest maps', async () => {
    const ids = firstRowNames.map(entry => entry.driveId).filter(Boolean)
    google({ csv: sheetCsv({ firstRowIds: ids.slice(1) }) })

    await expect(main()).rejects.toThrow(`Expected Sheet first row to include Drive ID ${ids[0]}`)
  })

  it('fails when a blog row is gone from the sheet', async () => {
    const [gone, ...kept] = rowNames
    google({ csv: sheetCsv({ rows: kept }) })

    await expect(main()).rejects.toThrow(`Expected Sheet to include row "${gone.sheetName}"`)
  })

  it('fails when a blog row points at another image, or at none', async () => {
    const [changed, ...kept] = rowNames
    google({ csv: sheetCsv({ rows: [{ ...changed, driveId: 'another-image' }, ...kept] }) })
    await expect(main()).rejects.toThrow(
      `Expected ${changed.sheetName} Drive ID ${changed.driveId}, received another-image`
    )

    google({ csv: `${sheetCsv({ rows: kept })}${changed.sheetName}\r\n` })
    await expect(main()).rejects.toThrow(
      `Expected ${changed.sheetName} Drive ID ${changed.driveId}, received null`
    )
  })
})
