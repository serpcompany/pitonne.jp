import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'
import type { Locale } from '@/lib/i18n/config'

function pageContentPath(relativePath: string) {
  return path.join(process.cwd(), 'content', 'pages', relativePath)
}

const pageFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1)
})

export interface MarkdownPage {
  title: string
  slug: string
  content: string
  sourcePath: string
}

export type LegalPageKey = 'privacyPolicy' | 'termsConditions' | 'medicalDisclaimer'

const legalPagePaths: Record<LegalPageKey, string> = {
  privacyPolicy: 'legal/privacy-policy.md',
  termsConditions: 'legal/terms-conditions.md',
  medicalDisclaimer: 'legal/disclaimer.md'
}

function normalizePageContent(content: string) {
  return content
    .trim()
    .replace(/^(Legal|法的情報)[ \t]*\n+/i, '')
    .replace(/^# .+\n+/, '')
    .trim()
}

function localizedPagePath(relativePath: string, locale: Locale): string {
  if (locale === 'en') return relativePath
  return path.posix.join(
    path.posix.dirname(relativePath),
    locale,
    path.posix.basename(relativePath)
  )
}

export function getLegalPage(key: LegalPageKey, locale: Locale = 'en'): MarkdownPage {
  const relativePath = localizedPagePath(legalPagePaths[key], locale)
  const parsed = matter(fs.readFileSync(pageContentPath(relativePath), 'utf8'))
  const frontmatter = pageFrontmatterSchema.parse(parsed.data)

  return {
    title: frontmatter.title,
    slug: frontmatter.slug,
    content: normalizePageContent(parsed.content),
    sourcePath: `content/pages/${relativePath}`
  }
}
