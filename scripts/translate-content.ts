import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const DEEPL_API_KEY = process.env.DEEPL_API_KEY
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate'
const DELAY_BETWEEN_FILES_MS = 200

if (!DEEPL_API_KEY) {
  console.error('Error: DEEPL_API_KEY environment variable is required')
  process.exit(1)
}

const args = process.argv.slice(2)
const force = args.includes('--force')
const dryRun = args.includes('--dry-run')
const fileArgIndex = args.indexOf('--file')
const singleFile = fileArgIndex !== -1 ? args[fileArgIndex + 1] : null

const contentDirs = [
  { dir: 'content/services', type: 'service' },
  { dir: 'content/blog', type: 'blog' }
]

const translatableFields: Record<string, string[]> = {
  service: ['title', 'shortDescription', 'fullDescription'],
  blog: ['title', 'excerpt']
}

const translatableArrayFields: Record<string, string[]> = {
  service: ['benefits', 'keyPoints'],
  blog: ['tags']
}

const faqFields: Record<string, string> = {
  service: 'faqs'
}

async function translateBatch(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return []

  const response = await fetch(DEEPL_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: texts,
      source_lang: 'EN',
      target_lang: 'JA'
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeepL API error ${response.status}: ${error}`)
  }

  const data = await response.json()
  return data.translations.map((t: { text: string }) => t.text)
}

async function translateMarkdownFile(filePath: string, contentType: string): Promise<void> {
  const absolutePath = path.join(process.cwd(), filePath)
  const dir = path.dirname(absolutePath)
  const fileName = path.basename(absolutePath)
  const jaDir = path.join(dir, 'ja')
  const jaPath = path.join(jaDir, fileName)

  if (!force && fs.existsSync(jaPath)) {
    console.log(`  SKIP ${filePath} (translation exists, use --force to overwrite)`)
    return
  }

  const raw = fs.readFileSync(absolutePath, 'utf8')
  const parsed = matter(raw)
  const frontmatter = { ...parsed.data }
  const bodyContent = parsed.content.trim()

  const textsToTranslate: string[] = []
  const textKeys: string[] = []

  const simpleFields = translatableFields[contentType] || []
  for (const field of simpleFields) {
    if (frontmatter[field] && typeof frontmatter[field] === 'string') {
      textsToTranslate.push(frontmatter[field])
      textKeys.push(`field:${field}`)
    }
  }

  const arrayFields = translatableArrayFields[contentType] || []
  for (const field of arrayFields) {
    if (Array.isArray(frontmatter[field])) {
      for (let i = 0; i < frontmatter[field].length; i++) {
        if (typeof frontmatter[field][i] === 'string') {
          textsToTranslate.push(frontmatter[field][i])
          textKeys.push(`array:${field}:${i}`)
        }
      }
    }
  }

  const faqField = faqFields[contentType]
  if (faqField && Array.isArray(frontmatter[faqField])) {
    for (let i = 0; i < frontmatter[faqField].length; i++) {
      const faq = frontmatter[faqField][i]
      if (faq.question) {
        textsToTranslate.push(faq.question)
        textKeys.push(`faq:${faqField}:${i}:question`)
      }
      if (faq.answer) {
        textsToTranslate.push(faq.answer)
        textKeys.push(`faq:${faqField}:${i}:answer`)
      }
    }
  }

  if (contentType === 'blog' && frontmatter.author) {
    if (frontmatter.author.name) {
      textsToTranslate.push(frontmatter.author.name)
      textKeys.push('author:name')
    }
    if (frontmatter.author.role) {
      textsToTranslate.push(frontmatter.author.role)
      textKeys.push('author:role')
    }
  }

  if (bodyContent) {
    textsToTranslate.push(bodyContent)
    textKeys.push('body')
  }

  if (dryRun) {
    console.log(`  DRY RUN ${filePath} -> ja/${fileName}`)
    console.log(`    ${textsToTranslate.length} text segments to translate`)
    return
  }

  console.log(`  Translating ${filePath} (${textsToTranslate.length} segments)...`)
  const translated = await translateBatch(textsToTranslate)

  const jaFrontmatter = { ...frontmatter }
  let jaBody = bodyContent

  for (let i = 0; i < textKeys.length; i++) {
    const key = textKeys[i]
    const value = translated[i]

    if (key.startsWith('field:')) {
      const field = key.split(':')[1]
      jaFrontmatter[field] = value
    } else if (key.startsWith('array:')) {
      const [, field, index] = key.split(':')
      if (!jaFrontmatter[field]) jaFrontmatter[field] = [...frontmatter[field]]
      jaFrontmatter[field][parseInt(index, 10)] = value
    } else if (key.startsWith('faq:')) {
      const [, field, index, subField] = key.split(':')
      if (!jaFrontmatter[field])
        jaFrontmatter[field] = frontmatter[field].map((f: Record<string, string>) => ({ ...f }))
      jaFrontmatter[field][parseInt(index, 10)][subField] = value
    } else if (key === 'author:name') {
      if (!jaFrontmatter.author) jaFrontmatter.author = { ...frontmatter.author }
      jaFrontmatter.author.name = value
    } else if (key === 'author:role') {
      if (!jaFrontmatter.author) jaFrontmatter.author = { ...frontmatter.author }
      jaFrontmatter.author.role = value
    } else if (key === 'body') {
      jaBody = value
    }
  }

  if (!fs.existsSync(jaDir)) {
    fs.mkdirSync(jaDir, { recursive: true })
  }

  const jaContent = matter.stringify(jaBody, jaFrontmatter)
  fs.writeFileSync(jaPath, jaContent, 'utf8')
  console.log(`  DONE ${filePath} -> ja/${fileName}`)
}

async function main() {
  console.log('DeepL Content Translation')
  console.log(`Mode: ${dryRun ? 'DRY RUN' : force ? 'FORCE' : 'NORMAL'}`)
  console.log('')

  if (singleFile) {
    const type = singleFile.includes('/blog/')
      ? 'blog'
      : singleFile.includes('/services/')
        ? 'service'
        : 'unknown'
    if (type === 'unknown') {
      console.error('Cannot determine content type for:', singleFile)
      process.exit(1)
    }
    await translateMarkdownFile(singleFile, type)
    return
  }

  for (const { dir, type } of contentDirs) {
    const absoluteDir = path.join(process.cwd(), dir)
    if (!fs.existsSync(absoluteDir)) {
      console.log(`Skipping ${dir} (not found)`)
      continue
    }

    console.log(`\nProcessing ${dir}/`)
    const files = fs.readdirSync(absoluteDir).filter(f => f.endsWith('.md'))

    for (const file of files) {
      const filePath = `${dir}/${file}`
      await translateMarkdownFile(filePath, type)
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_FILES_MS))
    }
  }

  console.log('\nDone!')
}

main().catch(err => {
  console.error('Translation failed:', err)
  process.exit(1)
})
