import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

// Contact details the clinic no longer uses (issue #115). Both are built from parts so this file
// never contains them literally and a repo-wide grep only finds the absence assertions.
const retiredEmail = ["pitonne.am", "gmail.com"].join("@")
const retiredPhoneGroups = ["786", "814", "0323"]

// Matches the number with or without +1, in any mix of spaces, dots, dashes and parentheses:
// "+1 786 814 0323", "7868140323", "786-814-0323", "(786) 814-0323", "tel:+17868140323".
// The digit lookarounds stop it matching inside longer numbers such as SVG path coordinates.
const separator = "[\\s.()-]*"
const retiredPhonePattern = new RegExp(
  `(?<!\\d)(?:\\+?1${separator})?${retiredPhoneGroups.join(separator)}(?!\\d)`,
)

const scannedDirectories = ["app", "components", "lib", "content", "public"]

// Binary and raster files can't contain readable contact details; SVG is text and is scanned.
const binaryExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".ico",
  ".bmp",
  ".tiff",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".eot",
  ".pdf",
  ".mp4",
  ".webm",
  ".mov",
  ".mp3",
  ".wav",
  ".zip",
  ".gz",
])

function listTextFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return []

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return listTextFiles(fullPath)
    if (!entry.isFile() || binaryExtensions.has(path.extname(entry.name).toLowerCase())) return []
    return [fullPath]
  })
}

function filesContaining(matches: (text: string) => boolean): string[] {
  const root = process.cwd()

  return scannedDirectories
    .flatMap((directory) => listTextFiles(path.join(root, directory)))
    .filter((file) => {
      const text = fs.readFileSync(file, "utf8")
      return !text.includes("\u0000") && matches(text)
    })
    .map((file) => path.relative(root, file))
}

describe("retired contact details", () => {
  it("recognises every common format of the retired U.S. number", () => {
    const [area, exchange, line] = retiredPhoneGroups

    for (const formatted of [
      `+1 ${area} ${exchange} ${line}`,
      `${area}${exchange}${line}`,
      `${area}-${exchange}-${line}`,
      `(${area}) ${exchange}-${line}`,
      `${area}.${exchange}.${line}`,
      `tel:+1${area}${exchange}${line}`,
    ]) {
      expect(retiredPhonePattern.test(formatted), formatted).toBe(true)
    }

    expect(retiredPhonePattern.test("03-6821-8285")).toBe(false)
    expect(retiredPhonePattern.test(`9${area}${exchange}${line}`)).toBe(false)
  })

  it("does not appear in any site file as the retired U.S. phone number", () => {
    expect(filesContaining((text) => retiredPhonePattern.test(text))).toEqual([])
  })

  it("does not appear in any site file as the retired Gmail address", () => {
    expect(filesContaining((text) => text.toLowerCase().includes(retiredEmail))).toEqual([])
  })
})
