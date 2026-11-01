import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { describe, expect, it } from 'vitest'
import { wards } from '@/lib/data/areas'
import { canonicalRoutes, localizedRoute } from '@/lib/data/routes'
import { getAllServiceSlugs, getService } from '@/lib/data/services'
import { pitonneVideos } from '@/lib/data/videos'
import { type Locale, locales } from '@/lib/i18n/config'
import { defined } from '@/test/defined'

type Params = Record<string, string | string[] | undefined>
type PageModule = { generateStaticParams?: () => Params[] | Promise<Params[]> }
type RedirectRule = { source: string; destination: string; status: string }

const root = process.cwd()
const appDirectory = path.join(root, 'src', 'app')
const pageFileName = /^page\.(?:tsx|ts|jsx|js)$/

const staticPages = [
  '/',
  '/about/',
  '/areas-served/',
  '/blog/',
  '/contact/',
  '/legal/',
  '/legal/disclaimer/',
  '/legal/privacy-policy/',
  '/legal/terms-conditions/',
  '/services/'
]
const retiredLegalPaths = [
  '/privacy-policy/',
  '/terms-of-use/',
  '/medical-disclaimer/',
  '/legal/terms-and-conditions/'
]
const tokyoStation = '/areas-served/chiyoda/tokyo-station/'

function pageFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return pageFiles(fullPath)
    return pageFileName.test(entry.name) ? [fullPath] : []
  })
}

function routeSegments(file: string): string[] {
  return path
    .relative(appDirectory, path.dirname(file))
    .split(path.sep)
    .filter(segment => segment !== '' && !/^\(.+\)$/.test(segment))
}

function fillSegment(segment: string, params: Params, file: string): string[] {
  const dynamic = segment.match(/^\[(\[)?(\.\.\.)?([^\]]+)\]\]?$/)
  if (!dynamic) return [segment]
  const [, optional, , name] = dynamic
  const value = params[name]
  if (value === undefined && optional) return []
  if (value === undefined) throw new Error(`${file} generates no value for [${name}]`)
  return [value].flat()
}

async function staticParams(file: string): Promise<Params[]> {
  const page = (await import(file)) as PageModule
  if (!page.generateStaticParams) {
    throw new Error(`${path.relative(root, file)} has dynamic segments but no generateStaticParams`)
  }
  return page.generateStaticParams()
}

async function builtRoutes(): Promise<Set<string>> {
  const routes = new Set<string>()
  for (const file of pageFiles(appDirectory)) {
    const segments = routeSegments(file)
    const dynamic = segments.some(segment => segment.startsWith('['))
    for (const params of dynamic ? await staticParams(file) : [{}]) {
      const parts = segments.flatMap(segment => fillSegment(segment, params, file))
      routes.add(parts.length === 0 ? '/' : `/${parts.join('/')}/`)
    }
  }
  return routes
}

function readPublishedPosts(locale: Locale) {
  const directory = path.join(root, 'content', 'blog', locale === 'en' ? '' : locale)
  return fs
    .readdirSync(directory)
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => ({
      slug: fileName.replace(/\.md$/, ''),
      data: matter(fs.readFileSync(path.join(directory, fileName), 'utf8')).data
    }))
    .filter(post => post.data.draft !== true)
}

const publishedPosts = new Map(locales.map(locale => [locale, readPublishedPosts(locale)]))

function blogRoutes(locale: Locale): string[] {
  return (publishedPosts.get(locale) ?? []).map(post => `/blog/${post.slug}/`)
}

function categoryRoutes(locale: Locale): string[] {
  return [
    ...new Set(
      (publishedPosts.get(locale) ?? []).map(post => `/blog/category/${post.data.categorySlug}/`)
    )
  ]
}

function areaRoutes(): string[] {
  return wards.flatMap(ward => [
    `/areas-served/${ward.slug}/`,
    ...ward.areas.map(area => `/areas-served/${ward.slug}/${area.slug}/`)
  ])
}

function serviceRoutes(locale: Locale): string[] {
  return getAllServiceSlugs(locale).map(slug => defined(getService(slug, locale)).canonicalPath)
}

function canonicalPaths(locale: Locale): string[] {
  return [
    ...new Set([
      ...staticPages,
      ...Object.values(canonicalRoutes),
      ...serviceRoutes(locale),
      ...areaRoutes(),
      ...pitonneVideos.map(video => video.watchPath),
      ...blogRoutes(locale),
      ...categoryRoutes(locale)
    ])
  ]
}

function localized(paths: string[], locale: Locale): string[] {
  return paths.map(routePath => localizedRoute(routePath, locale))
}

function redirectRules(): RedirectRule[] {
  return fs
    .readFileSync(path.join(root, 'public', '_redirects'), 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '' && !line.startsWith('#'))
    .map(line => {
      const [source, destination, status] = line.split(/\s+/)
      return { source, destination, status }
    })
}

function withAndWithoutSlash(routePath: string): string[] {
  const bare = routePath.replace(/\/$/, '')
  return [bare, `${bare}/`]
}

describe('routes', async () => {
  const built = await builtRoutes()

  it.each(locales)('builds a page for every canonical route (%s)', locale => {
    const missing = localized(canonicalPaths(locale), locale).filter(route => !built.has(route))
    expect(missing).toEqual([])
  })

  it.each(locales)('serves every service at its canonical path (%s)', locale => {
    for (const slug of getAllServiceSlugs(locale)) {
      expect(defined(getService(slug, locale)).canonicalPath).toBe(`/services/${slug}/`)
    }
  })

  it('builds blog post and category pages only for published posts, in their own locale', () => {
    const blogPostRoute = /^(?:\/[a-z]{2})?\/blog\/(?!category\/)[^/]+\/$/
    const categoryRoute = /^(?:\/[a-z]{2})?\/blog\/category\/[^/]+\/$/
    const builtOf = (pattern: RegExp) => [...built].filter(route => pattern.test(route)).sort()

    expect(builtOf(blogPostRoute)).toEqual(
      locales.flatMap(locale => localized(blogRoutes(locale), locale)).sort()
    )
    expect(builtOf(categoryRoute)).toEqual(
      locales.flatMap(locale => localized(categoryRoutes(locale), locale)).sort()
    )
  })

  it('redirects the old medications URL to the medication service', () => {
    const rules = redirectRules()

    for (const locale of locales) {
      const destination = localizedRoute('/services/medication/', locale)
      expect(built.has(destination)).toBe(true)
      for (const source of withAndWithoutSlash(localizedRoute('/services/medications/', locale))) {
        expect(rules).toContainEqual({ source, destination, status: '301' })
      }
    }
  })

  it('has no page or redirect for the retired legal URLs', () => {
    const retired = locales.flatMap(locale =>
      localized(retiredLegalPaths, locale).flatMap(withAndWithoutSlash)
    )
    const redirected = redirectRules().flatMap(rule => [rule.source, rule.destination])

    expect(retired.filter(route => built.has(route))).toEqual([])
    expect(retired.filter(route => redirected.includes(route))).toEqual([])
  })

  it('does not treat Tokyo Station as an area', () => {
    expect(areaRoutes()).not.toContain(tokyoStation)
    for (const locale of locales) {
      expect(built.has(localizedRoute(tokyoStation, locale))).toBe(false)
    }
  })
})
