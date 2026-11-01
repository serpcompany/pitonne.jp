import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import os from 'node:os'
import path from 'node:path'

type Sent = { method: string; path: string; body: string }
type Answer = { status: number; body?: unknown }
export type Route = (sent: Sent) => Answer | undefined

export type ScriptRun = { status: number | null; output: string; requests: Sent[] }

export async function runAgainstGitHub(
  script: string,
  args: string[],
  { event, route, env = {} }: { event: unknown; route: Route; env?: Record<string, string> }
): Promise<ScriptRun> {
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
      const sent = { method: request.method ?? 'GET', path: request.url ?? '/', body }
      requests.push(sent)
      const answer = route(sent) ?? { status: 404, body: { message: 'Not Found' } }
      response.writeHead(answer.status, { 'content-type': 'application/json' })
      response.end(JSON.stringify(answer.body ?? {}))
    })
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const { port } = server.address() as AddressInfo
    const child = spawn(process.execPath, [path.resolve(script), ...args], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        GITHUB_API_URL: `http://127.0.0.1:${port}`,
        GITHUB_EVENT_PATH: eventFile,
        GITHUB_REPOSITORY: 'serpcompany/pitonne.jp',
        GITHUB_TOKEN: 'test-token',
        ...env
      }
    })
    let output = ''
    child.stdout.on('data', (chunk: Buffer) => {
      output += chunk.toString()
    })
    child.stderr.on('data', (chunk: Buffer) => {
      output += chunk.toString()
    })
    const status = await new Promise<number | null>(resolve => child.on('close', resolve))
    return { status, output, requests }
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()))
    fs.rmSync(folder, { recursive: true, force: true })
  }
}
