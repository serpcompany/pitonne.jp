import fs from 'node:fs'
import path from 'node:path'

export const googleDriveImage = /drive\.google\.com|googleusercontent\.com/
export const localImagePath = /^\/(?!\/)/

export function publicAssetExists(assetPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), 'public', assetPath))
}

function unwrapOptimizedImage(url: string): string {
  if (!url.startsWith('/_next/image?')) return url
  return Object.fromEntries(new URLSearchParams(url.slice(url.indexOf('?') + 1))).url
}

export function imageSource(image: Element): string {
  return unwrapOptimizedImage(String(image.getAttribute('src')))
}

function srcsetUrls(srcset: string | null): string[] {
  return (srcset ?? '')
    .split(',')
    .map(candidate => candidate.trim().split(/\s+/)[0])
    .filter(Boolean)
}

function backgroundUrls(root: ParentNode): string[] {
  return Array.from(root.querySelectorAll('[style]')).flatMap(element =>
    Array.from(
      String(element.getAttribute('style')).matchAll(/url\(\s*['"]?([^'")]+)/g),
      match => match[1]
    )
  )
}

export function renderedImageUrls(root: ParentNode): string[] {
  const images = Array.from(root.querySelectorAll('img')).flatMap(image => [
    String(image.getAttribute('src')),
    ...srcsetUrls(image.getAttribute('srcset'))
  ])
  const sources = Array.from(root.querySelectorAll('source')).flatMap(source =>
    srcsetUrls(source.getAttribute('srcset'))
  )
  return [...images, ...sources, ...backgroundUrls(root)].map(unwrapOptimizedImage)
}
