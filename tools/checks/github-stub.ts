import fs from 'node:fs'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import os from 'node:os'
import path from 'node:path'

type Sent = { method: string; path: string; body: string }
type Answer = { status: number; body: unknown }
export type Route = (sent: Sent) => Answer | undefined

export type Main = (argv: string[]) => unknown
export type ScriptRun = { status: number; output: string }
type Environment = Record<string, string | undefined>

export async function runScript(
  main: Main,
  args: string[],
  { env = {}, cwd = process.cwd() }: { env?: Environment; cwd?: string } = {}
): Promise<ScriptRun> {
  const saved = { ...process.env }
  const folder = process.cwd()
  const { log, error } = console
  let output = ''
  const write = (...parts: unknown[]) => {
    output += `${parts.join(' ')}\n`
  }
  for (const [name, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[name]
    else process.env[name] = value
  }
  process.chdir(cwd)
  console.log = write
  console.error = write
  process.exitCode = undefined
  try {
    await main(args)
    return { status: Number(process.exitCode ?? 0), output }
  } finally {
    process.exitCode = undefined
    console.log = log
    console.error = error
    process.chdir(folder)
    for (const name of Object.keys(process.env)) if (!(name in saved)) delete process.env[name]
    Object.assign(process.env, saved)
  }
}

export async function runAgainstGitHub(
  main: Main,
  args: string[],
  { event, route, env = {}, cwd }: { event: unknown; route: Route; env?: Environment; cwd?: string }
): Promise<ScriptRun & { requests: Sent[] }> {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'github-stub-'))
  const eventFile = path.join(folder, 'event.json')
  fs.writeFileSync(eventFile, JSON.stringify(event))
  const requests: Sent[] = []
  const server = createServer((request, response) => {
    let body = ''
    request.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })
    request.on('end', () => {
      const sent = { method: String(request.method), path: String(request.url), body }
      requests.push(sent)
      const answer = route(sent) ?? { status: 404, body: { message: 'Not Found' } }
      response.writeHead(answer.status, { 'content-type': 'application/json' })
      response.end(JSON.stringify(answer.body))
    })
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const { port } = server.address() as AddressInfo
    const run = await runScript(main, args, {
      cwd,
      env: {
        GITHUB_API_URL: `http://127.0.0.1:${port}`,
        GITHUB_EVENT_PATH: eventFile,
        GITHUB_REPOSITORY: 'serpcompany/pitonne.jp',
        GITHUB_TOKEN: 'test-token',
        ...env
      }
    })
    return { ...run, requests }
  } finally {
    server.closeAllConnections()
    await new Promise<void>(resolve => server.close(() => resolve()))
    fs.rmSync(folder, { recursive: true, force: true })
  }
}
