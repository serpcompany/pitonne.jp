import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { runMain } from './run-main.mjs'

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.xsl', 'application/xml; charset=utf-8']
])

function decodePath(pathname) {
  try {
    return decodeURIComponent(pathname)
  } catch {
    return null
  }
}

function resolveRequestPath(root, port, requestUrl) {
  const url = new URL(requestUrl, `http://localhost:${port}`)
  const decodedPath = decodePath(url.pathname)
  if (decodedPath === null) {
    return null
  }

  const normalizedPath = decodedPath.endsWith('/') ? `${decodedPath}index.html` : decodedPath
  const candidate = path.normalize(path.join(root, normalizedPath))

  if (!`${candidate}${path.sep}`.startsWith(`${root}${path.sep}`)) {
    return null
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate
  }

  const htmlCandidate = path.join(candidate, 'index.html')
  if (fs.existsSync(htmlCandidate) && fs.statSync(htmlCandidate).isFile()) {
    return htmlCandidate
  }

  return path.join(root, '404.html')
}

export function main() {
  const root = path.join(process.cwd(), 'out')
  const port = Number(process.env.PORT ?? 3000)

  const server = http.createServer((request, response) => {
    const filePath = resolveRequestPath(root, port, request.url)

    if (!filePath || !fs.existsSync(filePath)) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Not found')
      return
    }

    const status = path.basename(filePath) === '404.html' ? 404 : 200
    const contentType = contentTypes.get(path.extname(filePath)) ?? 'application/octet-stream'
    response.writeHead(status, { 'Content-Type': contentType })
    fs.createReadStream(filePath).pipe(response)
  })

  server.listen(port, () => {
    console.log(`Ready on http://localhost:${port}`)
  })

  return server
}

await runMain(import.meta.url, main)
