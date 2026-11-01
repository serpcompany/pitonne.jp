import ts from 'typescript'
import {
  importBase,
  parseSource,
  resolveSourceFile,
  sourceExists,
  sourceFiles
} from '@/test/source-files'

type Mode = 'text' | 'prose' | 'metadata'
type Finding = { file: string; line: number; text: string }
type Scan = {
  files: Map<string, ts.SourceFile>
  findings: Map<string, Finding & { start: number }>
  seen: Set<string>
}

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

function load(scan: Scan, file: string): ts.SourceFile {
  const cached = scan.files.get(file)
  if (cached) return cached
  const sourceFile = parseSource(file)
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
  const base = importBase(from, specifier)
  if (!base || !isScanned(base)) return undefined
  return resolveSourceFile(base, file => scan.files.has(file) || sourceExists(file))
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

export function scanFiles(scan: Scan, files: string[]): Finding[] {
  for (const file of files) {
    const sourceFile = load(scan, file)
    analyzeJsx(scan, sourceFile)
    analyzeMetadata(scan, sourceFile)
  }
  return [...scan.findings.values()]
    .sort((a, b) => a.file.localeCompare(b.file) || a.start - b.start)
    .map(({ file, line, text }) => ({ file, line, text }))
}

export function newScan(sources: Record<string, string> = {}): Scan {
  const files = new Map(
    Object.entries(sources).map(([file, source]) => [file, parseSource(file, source)])
  )
  return { files, findings: new Map(), seen: new Set() }
}

export function isScanned(file: string): boolean {
  const within = (directories: string[]) =>
    directories.some(directory => file.startsWith(`${directory}/`))
  return within(scannedDirectories) && !within(cmsDirectories)
}

export function siteSourceFiles(): string[] {
  return scannedDirectories.flatMap(sourceFiles).filter(isScanned)
}

export function hardcodedTexts(source: string): string[] {
  const file = 'src/components/fixture.tsx'
  return scanFiles(newScan({ [file]: source }), [file]).map(finding => finding.text)
}
