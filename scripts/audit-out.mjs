import fs from 'node:fs'
import path from 'node:path'

const OUT = path.join(process.cwd(), 'out')
const SITEMAP_INDEX = 'sitemap-index.xml'
const NOT_FOUND_PAGE = '404.html'
const required = [
  'index.html',
  'ja/index.html',
  NOT_FOUND_PAGE,
  'robots.txt',
  '_headers',
  '_redirects',
  '_routes.json',
  SITEMAP_INDEX,
  'sitemap.xml'
]
const defaultLocaleFolders = ['en']

const indexPath = path.join(OUT, SITEMAP_INDEX)
const childSitemaps = fs.existsSync(indexPath)
  ? [
      ...fs.readFileSync(indexPath, 'utf8').matchAll(/<loc>[^<]*\/(sitemap-[^/<]+\.xml)<\/loc>/g)
    ].map(([, file]) => file)
  : []

function htmlUnder(relative) {
  const full = path.join(OUT, relative)
  if (!fs.existsSync(full)) return []
  if (!fs.statSync(full).isDirectory()) return relative.endsWith('.html') ? [relative] : []
  return fs
    .readdirSync(full, { recursive: true })
    .map(String)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join(relative, file))
}
const routesPath = path.join(OUT, '_routes.json')
const excludedRoutes = fs.existsSync(routesPath)
  ? (JSON.parse(fs.readFileSync(routesPath, 'utf8')).exclude ?? [])
  : []
const htmlInExcludedRoutes = excludedRoutes.flatMap(rule =>
  htmlUnder(rule.replace(/^\//, '').replace(/\*$/, ''))
)

const read = file =>
  fs.existsSync(path.join(OUT, file)) ? fs.readFileSync(path.join(OUT, file), 'utf8') : null
const robots = read('robots.txt')
const headers = read('_headers')
const indexMismatch = []
if (robots !== null && headers !== null) {
  const disallowsAll = /^Disallow:\s*\/\s*$/m.test(robots)
  const sendsNoindex = /^\s*X-Robots-Tag:.*\bnoindex\b/im.test(headers)
  if (disallowsAll && !sendsNoindex)
    indexMismatch.push(
      'out/robots.txt disallows crawling but out/_headers sends no X-Robots-Tag: noindex'
    )
  if (!disallowsAll && sendsNoindex)
    indexMismatch.push(
      'out/_headers sends X-Robots-Tag: noindex but out/robots.txt allows crawling'
    )
}

function notFoundPageProblems(file, lang, home) {
  const html = read(file)
  if (html === null) return []
  const htmlTag = html.match(/<html\s[^>]*>/)?.[0] ?? ''
  const robotsTags = html.match(/<meta\s[^>]*name="robots"[^>]*>/g) ?? []
  const links = html.match(/<a\s[^>]*>/g) ?? []
  return [
    [htmlTag.includes(` lang="${lang}"`), `has no <html lang="${lang}">`],
    [
      robotsTags.length === 1 && /\scontent="[^"]*\bnoindex\b/.test(robotsTags[0]),
      `has ${robotsTags.length} robots meta tags, expected one with noindex`
    ],
    [links.some(link => link.includes(` href="${home}"`)), `has no link to ${home}`]
  ]
    .filter(([passed]) => !passed)
    .map(([, problem]) => `out/${file} ${problem}`)
}

const failures = [
  ...[...required, ...childSitemaps]
    .filter(file => !fs.existsSync(path.join(OUT, file)))
    .map(file => `missing out/${file}`),
  ...defaultLocaleFolders
    .filter(file => fs.existsSync(path.join(OUT, file)))
    .map(file => `unexpected out/${file}`),
  ...htmlInExcludedRoutes.map(
    file => `out/${file} is a page under a path _routes.json keeps off the Function`
  ),
  ...indexMismatch,
  ...notFoundPageProblems(NOT_FOUND_PAGE, 'en', '/'),
  ...(fs.existsSync(indexPath) && childSitemaps.length === 0
    ? [`out/${SITEMAP_INDEX} lists no sitemaps`]
    : [])
]

if (failures.length > 0) {
  console.error(
    `Export audit failed (run \`pnpm build\` first):\n${failures.map(f => `- ${f}`).join('\n')}`
  )
  process.exit(1)
}

console.log(`Export audit passed (${childSitemaps.length} child sitemaps).`)
