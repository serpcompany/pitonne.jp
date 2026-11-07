import { once } from 'node:events'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { main } from './serve-static.mjs'

const folders = []
const servers = []

afterEach(async () => {
  for (const server of servers.splice(0)) {
    server.close()
    await once(server, 'close')
  }
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  for (const folder of folders.splice(0)) fs.rmSync(folder, { recursive: true, force: true })
})

function project(files) {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'serve-static-'))
  folders.push(folder)
  for (const [name, text] of Object.entries(files)) {
    const file = path.join(folder, name)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, text)
  }
  vi.spyOn(process, 'cwd').mockReturnValue(folder)
  return folder
}

async function serve(files) {
  project(files)
  vi.stubEnv('PORT', '0')
  const log = vi.spyOn(console, 'log').mockImplementation(() => {})
  const server = main()
  servers.push(server)
  await once(server, 'listening')
  const { port } = server.address()
  const get = async requestPath => {
    const response = await fetch(`http://localhost:${port}${requestPath}`)
    return {
      status: response.status,
      type: response.headers.get('content-type'),
      body: await response.text()
    }
  }
  return { get, log }
}

const site = {
  'out/index.html': 'home page',
  'out/blog/index.html': 'blog page',
  'out/404.html': 'missing page',
  'out/robots.txt': 'robots',
  'out/styles/site.css': 'body{}',
  'out/data/file.bin': 'binary',
  'out/empty/note.txt': 'note',
  'out-private/secret.txt': 'secret'
}

describe('pnpm start', () => {
  it('listens on port 3000 when PORT is unset and says it is ready, which Lighthouse waits for', async () => {
    project(site)
    vi.stubEnv('PORT', undefined)
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const listen = http.Server.prototype.listen
    const requested = []
    vi.spyOn(http.Server.prototype, 'listen').mockImplementation(function (port, ready) {
      requested.push(port)
      return listen.call(this, 0, ready)
    })
    const server = main()
    servers.push(server)
    await once(server, 'listening')

    expect(requested).toEqual([3000])
    expect(log).toHaveBeenCalledWith('Ready on http://localhost:3000')
  })

  it('listens on the PORT it is given', async () => {
    const { log } = await serve(site)

    expect(log).toHaveBeenCalledWith('Ready on http://localhost:0')
  })

  it('serves the index of a folder with or without its trailing slash', async () => {
    const { get } = await serve(site)

    expect(await get('/')).toEqual({
      status: 200,
      type: 'text/html; charset=utf-8',
      body: 'home page'
    })
    expect(await get('/blog/')).toMatchObject({ status: 200, body: 'blog page' })
    expect(await get('/blog')).toMatchObject({ status: 200, body: 'blog page' })
  })

  it('serves files with the content type of their extension', async () => {
    const { get } = await serve(site)

    expect(await get('/robots.txt')).toEqual({
      status: 200,
      type: 'text/plain; charset=utf-8',
      body: 'robots'
    })
    expect(await get('/styles/site.css')).toMatchObject({ type: 'text/css; charset=utf-8' })
    expect(await get('/data/file.bin')).toEqual({
      status: 200,
      type: 'application/octet-stream',
      body: 'binary'
    })
  })

  it('answers a missing page, or a folder with no index, with the 404 page and status 404', async () => {
    const { get } = await serve(site)

    expect(await get('/nowhere/')).toEqual({
      status: 404,
      type: 'text/html; charset=utf-8',
      body: 'missing page'
    })
    expect(await get('/empty')).toMatchObject({ status: 404, body: 'missing page' })
  })

  it('answers a missing page with plain text when the export has no 404 page', async () => {
    const { get } = await serve({ 'out/index.html': 'home page' })

    expect(await get('/nowhere/')).toEqual({
      status: 404,
      type: 'text/plain; charset=utf-8',
      body: 'Not found'
    })
  })

  it('serves nothing outside the export, even from a folder whose name starts with it', async () => {
    const { get } = await serve(site)

    expect(await get('/..%2F..%2Fsecret.txt')).toMatchObject({ status: 404, body: 'Not found' })
    expect(await get('/..%2Fout-private%2Fsecret.txt')).toMatchObject({
      status: 404,
      body: 'Not found'
    })
  })

  it('answers a path with a broken escape with 404 and keeps serving', async () => {
    const { get } = await serve(site)

    expect(await get('/%E0%A4%A')).toMatchObject({ status: 404, body: 'Not found' })
    expect(await get('/')).toMatchObject({ status: 200, body: 'home page' })
  })
})
