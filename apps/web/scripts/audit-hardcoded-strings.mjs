/**
 * Audit JSX/TSX files for hardcoded English strings that should use dict lookups.
 *
 * Scans app/[locale]/ and components/ (excluding components/ui/) for literal
 * English text in JSX that isn't coming from the i18n dictionary system.
 *
 * Usage: node scripts/audit-hardcoded-strings.mjs
 */

import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const findings = []

// Directories to scan
const scanDirs = ["app/[locale]", "components"]
// Directories to skip
const skipDirs = ["components/ui"]

// Lines containing these patterns are safe (using dict, locale logic, etc.)
const safeLinePatterns = [
  /\bdict\./,
  /\bdict\[/,
  /getDictionary/,
  /getBusinessInfo/,
  /\bclassName[=:]/,
  /\bhref[=:]/,
  /\bsrc[=:]/,
  /\bimport\s/,
  /\bfrom\s+["']/,
  /\btype\s+/,
  /\binterface\s+/,
  /\bexport\s+type/,
  /\bconst\s+\w+\s*[:=]/,
  /\blocale\s*===?\s*["']/,
  /^\s*\/\//,
  /^\s*\*/,
  /^\s*\{\/\*/,
  /aria-hidden/,
  /data-testid/,
  /\.test\./,
  /console\./,
]

// Known safe English words/brands that can appear literally
const safeWords = new Set([
  "pitonne", "serp", "tokyo", "japan", "jsx", "tsx", "svg", "html", "css",
  "div", "span", "section", "nav", "header", "footer", "main", "article",
  "button", "input", "form", "label", "select", "option", "textarea",
  "true", "false", "null", "undefined", "return", "export", "default",
  "function", "const", "let", "var", "async", "await", "new", "this",
  "map", "filter", "find", "key", "ref", "children", "props", "state",
  "string", "number", "boolean", "object", "array",
  "use", "client", "server",
  "next", "react", "link", "image",
  "utf", "url", "api", "gtm", "www", "http", "https", "mailto", "tel",
  "png", "jpg", "jpeg", "webp", "gif", "ico", "pdf",
  "english", "locale",
])

// Regex: find lines with JSX text content containing 3+ consecutive ASCII letters
// This targets: >Some English Text< or standalone English in JSX expressions
const jsxTextPattern = />\s*([^<>{]*[A-Za-z]{3,}[^<>{}]*)\s*</

function isLineSafe(line) {
  for (const pattern of safeLinePatterns) {
    if (pattern.test(line)) return true
  }
  return false
}

function extractEnglishWords(text) {
  return text.match(/[A-Za-z]{3,}/g) || []
}

function isAllSafeWords(text) {
  const words = extractEnglishWords(text)
  return words.length > 0 && words.every((w) => safeWords.has(w.toLowerCase()))
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8")
  const lines = content.split("\n")
  const relPath = path.relative(root, filePath)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Skip empty lines, imports, types, comments
    if (!trimmed || isLineSafe(trimmed)) continue

    // Check for JSX text content: >English text<
    const match = jsxTextPattern.exec(trimmed)
    if (match) {
      const text = match[1].trim()
      // Skip if it's just variable interpolation, entities, or safe words
      if (!text || /^\{.*\}$/.test(text) || /^&\w+;$/.test(text)) continue
      if (isAllSafeWords(text)) continue
      // Skip if no real English words (just symbols/numbers)
      const englishWords = extractEnglishWords(text)
      if (englishWords.length === 0) continue
      if (englishWords.every((w) => safeWords.has(w.toLowerCase()))) continue

      findings.push({
        file: relPath,
        line: i + 1,
        text: text.length > 80 ? text.slice(0, 80) + "..." : text,
      })
    }
  }
}

function walkDir(dir) {
  const fullDir = path.join(root, dir)
  if (!fs.existsSync(fullDir)) return

  for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
    const relPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (skipDirs.some((skip) => relPath.startsWith(skip))) continue
      walkDir(relPath)
    } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
      // Skip test files and type definition files
      if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.tsx")) continue
      if (entry.name.endsWith(".d.ts")) continue
      scanFile(path.join(root, relPath))
    }
  }
}

// Run scan
for (const dir of scanDirs) {
  walkDir(dir)
}

if (findings.length === 0) {
  console.log("No hardcoded English strings found.")
  process.exit(0)
} else {
  console.log(`Found ${findings.length} potential hardcoded English string(s):\n`)
  for (const f of findings) {
    console.log(`  ${f.file}:${f.line}`)
    console.log(`    "${f.text}"\n`)
  }
  console.log("Review the above and ensure all user-visible text uses dict lookups.")
  console.log("If a string is intentional (brand name, technical term), add it to the safe list")
  console.log("in scripts/audit-hardcoded-strings.mjs\n")
  process.exit(1)
}
