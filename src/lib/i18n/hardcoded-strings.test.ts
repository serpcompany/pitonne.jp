import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

type Mode = 'text' | 'prose' | 'metadata'
type Finding = { file: string; line: number; text: string }
type Scan = {
  files: Map<string, ts.SourceFile>
  findings: Map<string, Finding & { start: number }>
  seen: Set<string>
}

const root = process.cwd()
const scannedDirectories = ['src/app', 'src/components']
const cmsDirectories = ['src/app/keystatic', 'src/app/api/keystatic']

const brandNames =
  /\b(?:Pitonne|SERP|Google Maps|Google Tag Manager|YouTube|Instagram|Facebook|Threads|LinkedIn|TikTok|X|Twitter|Pinterest|Spotify|Apple Podcasts|Amazon Music|Castbox|LINE)\b/g
const htmlEntity = /&(?:[a-z]+|#\d+|#x[\da-f]+);/gi
const formatPlaceholder = /%[sd]/g
const address = /^(?:https?:\/\/|mailto:|tel:|\/|#)\S*$/
const nonAsciiLetter = /[^\P{L}a-zA-Z]/u
const capitalizedWord = /\b[A-Z][a-z]+\b/
const wordPair = /\b[A-Za-z]{2,} [A-Za-z]{2,}\b/

const textAttributes = new Set([
  'alt',
  'title',
  'placeholder',
  'label',
  'aria-label',
  'aria-description',
  'aria-roledescription',
  'aria-valuetext',
  'aria-placeholder',
  'aria-braillelabel',
  'aria-brailleroledescription'
])
const proseAttributes = new Set(['content', 'value'])
const textProps = new Set([
  ...textAttributes,
  'absolute',
  'caption',
  'children',
  'default',
  'description',
  'heading',
  'subheading',
  'subtitle',
  'template',
  'text',
  'tooltip'
])
const metadataText = new Set(['title', 'description', 'siteName', 'alt', 'abstract'])
const technicalName =
  /^(?:as|asChild|align|allow|action|className|crossOrigin|dangerouslySetInnerHTML|decoding|dir|fetchPriority|height|href|hrefLang|htmlFor|icon|id|image|key|lang|loading|locale|media|method|path|priority|ref|referrerPolicy|rel|role|sandbox|side|size|sizes|slug|src|srcSet|strategy|style|target|type|url|variant|width)$|^(?:aria|data)-|^on[A-Z]|^@|(?:ClassName|Href|Id|Locale|Path|Slug|Src|Url)$/

function isUserText(raw: string, mode: 'text' | 'prose'): boolean {
  const trimmed = raw.trim()
  if (address.test(trimmed)) return false
  const words = trimmed
    .replace(htmlEntity, ' ')
    .replace(formatPlaceholder, ' ')
    .replace(brandNames, ' ')
  if (!/\p{L}/u.test(words)) return false
  if (mode === 'text') return true
  return nonAsciiLetter.test(words) || capitalizedWord.test(words) || wordPair.test(words)
}

function parse(fileName: string, source: string): ts.SourceFile {
  const kind = fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  return ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, kind)
}

function load(scan: Scan, file: string): ts.SourceFile {
  const cached = scan.files.get(file)
  if (cached) return cached
  const sourceFile = parse(file, fs.readFileSync(path.join(root, file), 'utf8'))
  scan.files.set(file, sourceFile)
  return sourceFile
}

function report(scan: Scan, node: ts.Node) {
  const sourceFile = node.getSourceFile()
  const start = node.getStart(sourceFile)
  const text = node.getText(sourceFile).replace(/\s+/g, ' ').trim()
  scan.findings.set(`${sourceFile.fileName}:${start}`, {
    file: sourceFile.fileName,
    line: sourceFile.getLineAndCharacterOfPosition(start).line + 1,
    start,
    text: text.length > 120 ? `${text.slice(0, 117)}...` : text
  })
}

function propertyName(name: ts.PropertyName): string {
  return ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isPrivateIdentifier(name)
    ? name.text
    : name.getText()
}

function propertyMode(name: string, mode: Mode): Mode | undefined {
  if (mode === 'metadata') return metadataText.has(name) ? 'text' : 'metadata'
  if (technicalName.test(name)) return undefined
  return textProps.has(name) ? 'text' : 'prose'
}

function bindingValues(
  binding: ts.BindingName,
  name: string,
  source: ts.Expression | undefined,
  includeSource: boolean
): ts.Node[] | undefined {
  if (ts.isIdentifier(binding)) return binding.text === name ? (source ? [source] : []) : undefined
  for (const element of binding.elements) {
    if (ts.isOmittedExpression(element)) continue
    if (bindingValues(element.name, name, undefined, false)) {
      return [
        ...(element.initializer ? [element.initializer] : []),
        ...(includeSource && source ? [source] : [])
      ]
    }
  }
  return undefined
}

function scopeStatements(scope: ts.Node): readonly ts.Statement[] {
  if (ts.isSourceFile(scope) || ts.isBlock(scope) || ts.isModuleBlock(scope)) {
    return scope.statements
  }
  if (ts.isCaseClause(scope) || ts.isDefaultClause(scope)) return scope.statements
  return []
}

function declaredValues(scope: ts.Node, name: string): ts.Node[] | undefined {
  if (ts.isFunctionLike(scope)) {
    for (const parameter of scope.parameters) {
      const values = bindingValues(parameter.name, name, parameter.initializer, false)
      if (values) return values
    }
  }
  for (const statement of scopeStatements(scope)) {
    if (ts.isFunctionDeclaration(statement) && statement.name?.text === name) return [statement]
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      const values = bindingValues(declaration.name, name, declaration.initializer, true)
      if (values) return values
    }
  }
  return undefined
}

function hasModifier(statement: ts.Statement, kind: ts.SyntaxKind): boolean {
  return (
    ts.canHaveModifiers(statement) &&
    (ts.getModifiers(statement) ?? []).some(modifier => modifier.kind === kind)
  )
}

function exportedValues(sourceFile: ts.SourceFile, name: string): ts.Node[] {
  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement) && name === 'default') return [statement.expression]
    if (!hasModifier(statement, ts.SyntaxKind.ExportKeyword)) continue
    const isDefault = hasModifier(statement, ts.SyntaxKind.DefaultKeyword)
    if (
      ts.isFunctionDeclaration(statement) &&
      (name === 'default' ? isDefault : statement.name?.text === name)
    ) {
      return [statement]
    }
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === name) {
        return declaration.initializer ? [declaration.initializer] : []
      }
    }
  }
  return []
}

function resolveModule(scan: Scan, from: string, specifier: string): string | undefined {
  const base = specifier.startsWith('@/')
    ? `src/${specifier.slice(2)}`
    : specifier.startsWith('.')
      ? path.posix.join(path.posix.dirname(from), specifier)
      : undefined
  if (!base || !isScanned(base)) return undefined
  return [`${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`].find(
    file => scan.files.has(file) || fs.existsSync(path.join(root, file))
  )
}

function importedValues(scan: Scan, identifier: ts.Identifier): ts.Node[] {
  for (const statement of identifier.getSourceFile().statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause) continue
    const { name, namedBindings } = statement.importClause
    const named =
      namedBindings && ts.isNamedImports(namedBindings)
        ? namedBindings.elements.find(element => element.name.text === identifier.text)
        : undefined
    const exported =
      name?.text === identifier.text ? 'default' : (named?.propertyName ?? named?.name)?.text
    if (!exported || !ts.isStringLiteral(statement.moduleSpecifier)) continue
    const file = resolveModule(
      scan,
      identifier.getSourceFile().fileName,
      statement.moduleSpecifier.text
    )
    return file ? exportedValues(load(scan, file), exported) : []
  }
  return []
}

function valuesOf(scan: Scan, identifier: ts.Identifier): ts.Node[] {
  for (let scope: ts.Node | undefined = identifier.parent; scope; scope = scope.parent) {
    const values = declaredValues(scope, identifier.text)
    if (values) return values
  }
  return importedValues(scan, identifier)
}

function returnedValues(
  fn: ts.ArrowFunction | ts.FunctionExpression | ts.FunctionDeclaration
): ts.Node[] {
  if (!fn.body) return []
  if (!ts.isBlock(fn.body)) return [fn.body]
  const values: ts.Node[] = []
  const collect = (node: ts.Node) => {
    if (ts.isReturnStatement(node) && node.expression) values.push(node.expression)
    if (!ts.isFunctionLike(node)) ts.forEachChild(node, collect)
  }
  ts.forEachChild(fn.body, collect)
  return values
}

function analyze(scan: Scan, node: ts.Node, mode: Mode): void {
  const key = `${node.getSourceFile().fileName}:${node.pos}:${node.end}:${mode}`
  if (scan.seen.has(key)) return
  scan.seen.add(key)

  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    if (mode !== 'metadata' && isUserText(node.text, mode)) report(scan, node)
  } else if (ts.isTemplateExpression(node)) {
    const literal = [node.head.text, ...node.templateSpans.map(span => span.literal.text)].join('')
    if (mode !== 'metadata' && isUserText(literal, mode)) report(scan, node)
    for (const span of node.templateSpans) analyze(scan, span.expression, mode)
  } else if (ts.isConditionalExpression(node)) {
    analyze(scan, node.whenTrue, mode)
    analyze(scan, node.whenFalse, mode)
  } else if (ts.isBinaryExpression(node)) {
    const operator = node.operatorToken.kind
    if (operator === ts.SyntaxKind.AmpersandAmpersandToken) analyze(scan, node.right, mode)
    if (
      operator === ts.SyntaxKind.BarBarToken ||
      operator === ts.SyntaxKind.QuestionQuestionToken ||
      operator === ts.SyntaxKind.PlusToken
    ) {
      analyze(scan, node.left, mode)
      analyze(scan, node.right, mode)
    }
  } else if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isNonNullExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isAwaitExpression(node) ||
    ts.isSpreadElement(node) ||
    ts.isSpreadAssignment(node) ||
    ts.isPropertyAccessExpression(node) ||
    ts.isElementAccessExpression(node)
  ) {
    analyze(scan, node.expression, mode)
  } else if (ts.isArrayLiteralExpression(node)) {
    for (const element of node.elements) analyze(scan, element, mode)
  } else if (ts.isObjectLiteralExpression(node)) {
    for (const property of node.properties) {
      if (ts.isSpreadAssignment(property)) analyze(scan, property, mode)
      if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) {
        continue
      }
      const propertyValueMode = propertyMode(propertyName(property.name), mode)
      if (!propertyValueMode) continue
      analyze(
        scan,
        ts.isPropertyAssignment(property) ? property.initializer : property.name,
        propertyValueMode
      )
    }
  } else if (ts.isIdentifier(node)) {
    for (const value of valuesOf(scan, node)) analyze(scan, value, mode)
  } else if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
    for (const argument of node.arguments ?? []) {
      analyze(scan, argument, mode === 'metadata' ? 'metadata' : 'prose')
    }
    if (ts.isCallExpression(node)) analyze(scan, node.expression, mode)
  } else if (
    ts.isArrowFunction(node) ||
    ts.isFunctionExpression(node) ||
    ts.isFunctionDeclaration(node)
  ) {
    for (const value of returnedValues(node)) analyze(scan, value, mode)
  }
}

function tagName(element: ts.JsxOpeningLikeElement): string {
  return element.tagName.getText()
}

function isIntrinsic(element: ts.JsxOpeningLikeElement): boolean {
  return /^[a-z][\w-]*$/.test(tagName(element))
}

function isTrue(initializer: ts.JsxAttributeValue | undefined): boolean {
  if (!initializer) return true
  const value = ts.isJsxExpression(initializer) ? initializer.expression : initializer
  if (!value) return false
  return (
    value.kind === ts.SyntaxKind.TrueKeyword || (ts.isStringLiteral(value) && value.text === 'true')
  )
}

function isAriaHidden(element: ts.JsxOpeningLikeElement): boolean {
  return element.attributes.properties.some(
    attribute =>
      ts.isJsxAttribute(attribute) &&
      attribute.name.getText() === 'aria-hidden' &&
      isTrue(attribute.initializer)
  )
}

function isCode(node: ts.Node): boolean {
  return (
    ts.isJsxElement(node.parent) && /^(?:script|style)$/.test(tagName(node.parent.openingElement))
  )
}

function attributeMode(attribute: ts.JsxAttribute): Mode | undefined {
  const name = attribute.name.getText()
  if (isIntrinsic(attribute.parent.parent)) {
    if (textAttributes.has(name)) return 'text'
    return proseAttributes.has(name) ? 'prose' : undefined
  }
  return propertyMode(name, 'prose')
}

function analyzeJsx(scan: Scan, node: ts.Node): void {
  if (ts.isJsxElement(node) && isAriaHidden(node.openingElement)) return
  if (ts.isJsxSelfClosingElement(node) && isAriaHidden(node)) return

  if (ts.isJsxText(node)) {
    if (!node.containsOnlyTriviaWhiteSpaces && !isCode(node) && isUserText(node.text, 'text')) {
      report(scan, node)
    }
  } else if (
    ts.isJsxExpression(node) &&
    node.expression &&
    (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent)) &&
    !isCode(node)
  ) {
    analyze(scan, node.expression, 'text')
  } else if (ts.isJsxAttribute(node) && node.initializer) {
    const mode = attributeMode(node)
    const value = ts.isJsxExpression(node.initializer)
      ? node.initializer.expression
      : node.initializer
    if (mode && value) analyze(scan, value, mode)
  } else if (ts.isJsxSpreadAttribute(node)) {
    analyze(scan, node.expression, 'prose')
  }

  ts.forEachChild(node, child => analyzeJsx(scan, child))
}

function analyzeMetadata(scan: Scan, sourceFile: ts.SourceFile) {
  for (const name of ['metadata', 'generateMetadata']) {
    for (const value of exportedValues(sourceFile, name)) analyze(scan, value, 'metadata')
  }
}

function scanFiles(scan: Scan, files: string[]): Finding[] {
  for (const file of files) {
    const sourceFile = load(scan, file)
    analyzeJsx(scan, sourceFile)
    analyzeMetadata(scan, sourceFile)
  }
  return [...scan.findings.values()]
    .sort((a, b) => a.file.localeCompare(b.file) || a.start - b.start)
    .map(({ file, line, text }) => ({ file, line, text }))
}

function newScan(sources: Record<string, string> = {}): Scan {
  const files = new Map(
    Object.entries(sources).map(([file, source]) => [file, parse(file, source)])
  )
  return { files, findings: new Map(), seen: new Set() }
}

function isScanned(file: string): boolean {
  const within = (directories: string[]) =>
    directories.some(directory => file.startsWith(`${directory}/`))
  return within(scannedDirectories) && !within(cmsDirectories)
}

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => {
    const relative = `${directory}/${entry.name}`
    if (entry.isDirectory()) return sourceFiles(relative)
    const isSource = /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)
    return isSource && isScanned(relative) ? [relative] : []
  })
}

function texts(source: string): string[] {
  const file = 'src/components/fixture.tsx'
  return scanFiles(newScan({ [file]: source }), [file]).map(finding => finding.text)
}

describe('user-visible strings', () => {
  it('flags hardcoded JSX text in any script, including screen-reader-only text', () => {
    expect(
      texts(`export function A() {
        return (
          <section>
            <h2>Book a consultation</h2>
            <p>ご予約はこちら</p>
            <span className="sr-only">Close</span>
            <Card>
              <b>Hours</b>
            </Card>
            <p>/ month</p>
          </section>
        )
      }`)
    ).toEqual(['Book a consultation', 'ご予約はこちら', 'Close', 'Hours', '/ month'])
  })

  it('flags literals rendered as children, including conditional branches and template literals', () => {
    expect(
      texts(`export function A({ locale, city }) {
        return (
          <p>
            {'Call us'}
            {locale === 'ja' ? 'はい' : 'Yes'}
            {\`Welcome to \${city}\`}
            {open && 'Menu'}
            {name ?? 'Guest'}
            {format('Starting at', price)}
          </p>
        )
      }`)
    ).toEqual([
      "'Call us'",
      "'はい'",
      "'Yes'",
      `\`Welcome to \${city}\``,
      "'Menu'",
      "'Guest'",
      "'Starting at'"
    ])
  })

  it('flags literals in user-visible attributes and in text props of components', () => {
    expect(
      texts(`export function A({ locale, area }) {
        return (
          <div>
            <img src="/a.jpg" alt="Clinic reception" />
            <iframe src={url} title={\`\${area}, Tokyo map\`} />
            <button type="button" aria-label={locale === 'ja' ? '閉じる' : 'Close'} />
            <input placeholder="Email" name="email" />
            <PageHero eyebrow="Our team" title={locale === 'ja' ? title : 'Areas'} />
            <Breadcrumbs items={[{ label: 'Home', href: '/' }]} />
            <Hero heading="Results" />
          </div>
        )
      }`)
    ).toEqual([
      '"Clinic reception"',
      `\`\${area}, Tokyo map\``,
      "'閉じる'",
      "'Close'",
      '"Email"',
      '"Our team"',
      "'Areas'",
      "'Home'",
      '"Results"'
    ])
  })

  it('follows local constants, data lists and helper functions into what is rendered', () => {
    expect(
      texts(`const heading = 'Our services'
      const areas = [{ name: locale === 'ja' ? '六本木' : 'Roppongi', href: '/areas/roppongi/' }]
      const labels = { en: 'Open', ja: '営業中' }
      function faqs(area) {
        return [{ question: \`What is available in \${area}?\`, answer: dict.answer }]
      }
      export function A({ area, locale, title = 'Welcome' }) {
        const items = faqs(area)
        const [status] = useState('Loading')
        return (
          <div>
            <h2>{heading}</h2>
            <ul>{areas.map(item => <li key={item.href}>{item.name}</li>)}</ul>
            {items.map(item => <p key={item.question}>{item.question}</p>)}
            <span>{labels[locale]}</span>
            <h3>{title}</h3>
            <p>{status}</p>
          </div>
        )
      }`)
    ).toEqual([
      "'Our services'",
      "'六本木'",
      "'Roppongi'",
      "'Open'",
      "'営業中'",
      `\`What is available in \${area}?\``,
      "'Welcome'",
      "'Loading'"
    ])
  })

  it('follows imports from other files under src/app and src/components', () => {
    const scan = newScan({
      'src/components/menu/labels.ts': `export const menuLabels = ['Treatments', 'Prices']
        export default function caption() { return 'Our menu' }`,
      'src/components/menu/menu.tsx': `import caption, { menuLabels as labels } from './labels'
        import { SITE_NAME } from '@/lib/seo'
        export function Menu() {
          return <nav>{labels.map(label => <a key={label}>{label}</a>)}<p>{caption()}</p><h2>{SITE_NAME}</h2></nav>
        }`
    })

    expect(scanFiles(scan, ['src/components/menu/menu.tsx'])).toEqual([
      { file: 'src/components/menu/labels.ts', line: 1, text: "'Treatments'" },
      { file: 'src/components/menu/labels.ts', line: 1, text: "'Prices'" },
      { file: 'src/components/menu/labels.ts', line: 2, text: "'Our menu'" }
    ])
  })

  it('flags literal titles, descriptions and Open Graph text in metadata', () => {
    expect(
      texts(`export const metadata = {
        title: 'Pitonne CMS',
        openGraph: { description: 'About the clinic', type: 'website', images: [{ url: '/a.jpg', alt: 'Clinic' }] }
      }
      export async function generateMetadata({ params }) {
        const { locale } = await params
        const title = locale === 'ja' ? '東京のエリア' : dict.areas.metaTitle
        return {
          title: { default: title, template: '%s | Pitonne' },
          description: locale === 'ja' ? dict.areas.metaDescription : 'Areas we serve',
          ...pageSocialMetadata({ title, description: 'Social text', path: '/areas/' }),
          twitter: { card: 'summary_large_image', title: \`\${title} in Tokyo\` }
        }
      }`)
    ).toEqual([
      "'Pitonne CMS'",
      "'About the clinic'",
      "'Clinic'",
      "'東京のエリア'",
      "'Areas we serve'",
      "'Social text'",
      `\`\${title} in Tokyo\``
    ])
  })

  it('leaves dictionary values, brand names, technical values and aria-hidden content alone', () => {
    expect(
      texts(`export function A({ locale, dict, post, item }) {
        const dateLocale = locale === 'ja' ? 'ja-JP' : 'en-US'
        const isClosed = item.hours === 'Closed' || item.hours === '休診'
        return (
          <section id="more-videos" className="flex items-center gap-2" data-testid="hero section">
            <h1>{dict.nav.home}</h1>
            <img src="/logo.svg" alt="Pitonne" loading="lazy" sizes="(min-width: 768px) 50vw, 100vw" />
            <a href="https://serp.co" target="_blank" rel="noopener noreferrer">SERP</a>
            <span aria-hidden="true">&rarr; Next</span>
            <svg aria-hidden><title>Arrow icon</title></svg>
            <Icon aria-hidden="true" label="Decorative" />
            <p>&copy; {new Date().getFullYear()} {dict.footer.businessName}.{' '}</p>
            <p className={isClosed ? 'text-white/70' : 'text-white/90'}>{isClosed ? dict.footer.closed : item.hours}</p>
            <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString(dateLocale, { month: 'long' })}</time>
            <Button variant="outline" size="lg" asChild locale="ja" iconClassName="h-4 w-4" />
            <iframe src={\`https://www.google.com/maps?q=\${q}&output=embed\`} allow="autoplay; encrypted-media" referrerPolicy="no-referrer-when-downgrade" title={dict.areas.mapOf} />
            <Link href={localizedRoute(\`/areas-served/\${ward}/\`, locale)} key={\`\${item.label}-1\`}>{item.label}</Link>
            <JsonLd data={serviceJsonLd(post, locale)} />
            <a href="tel:03-6821-8285">{'https://pitonne.jp/contact/'}</a>
            <script>{'window.dataLayer = window.dataLayer || []'}</script>
          </section>
        )
      }
      export const metadata = { title: \`%s | \${SITE_NAME}\`, openGraph: { locale: 'ja_JP', type: 'article' }, robots: { index: false } }`)
    ).toEqual([])
  })

  it('scans the site in src/app and src/components, not the CMS admin', () => {
    expect(isScanned('src/app/layout.tsx')).toBe(true)
    expect(isScanned('src/app/(en)/about/page.tsx')).toBe(true)
    expect(isScanned('src/components/ui/dialog.tsx')).toBe(true)
    expect(isScanned('src/app/keystatic/layout.tsx')).toBe(false)
    expect(isScanned('src/app/api/keystatic/[...params]/route.keystatic.ts')).toBe(false)
    expect(isScanned('src/lib/seo.ts')).toBe(false)
  })

  it('come from the dictionary in the site pages and components', () => {
    const findings = scanFiles(newScan(), scannedDirectories.flatMap(sourceFiles)).map(
      finding => `${finding.file}:${finding.line} ${finding.text}`
    )

    expect(findings).toEqual([])
  })
})
