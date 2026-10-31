import fs from 'node:fs'
import path from 'node:path'

export const googleDriveImage = /drive\.google\.com|googleusercontent\.com/
export const localImagePath = /^\/(?!\/)/

export function publicAssetExists(assetPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), 'public', assetPath))
}

function unwrapOptimizedImage(url: string): string {
  if (!url.startsWith('/_next/image?')) return url
  return new URLSearchParams(url.slice(url.indexOf('?') + 1)).get('url') ?? url
}

export function imageSource(image: Element): string {
  return unwrapOptimizedImage(image.getAttribute('src') ?? '')
}

function srcsetUrls(srcset: string | null): string[] {
  return (srcset ?? '')
    .split(',')
    .map(candidate => candidate.trim().split(/\s+/)[0])
    .filter(Boolean)
}

export function renderedImageUrls(root: ParentNode): string[] {
  const images = Array.from(root.querySelectorAll('img')).flatMap(image => [
    image.getAttribute('src') ?? '',
    ...srcsetUrls(image.getAttribute('srcset'))
  ])
  const sources = Array.from(root.querySelectorAll('source')).flatMap(source =>
    srcsetUrls(source.getAttribute('srcset'))
  )
  return [...images, ...sources].map(unwrapOptimizedImage)
}
