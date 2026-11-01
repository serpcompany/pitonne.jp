import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js'

const root = dirname(fileURLToPath(import.meta.url))

export default function nextConfig(phase) {
  const isKeystatic = phase === PHASE_DEVELOPMENT_SERVER && process.env.KEYSTATIC === '1'

  return {
    output: isKeystatic ? undefined : 'export',
    allowedDevOrigins: isKeystatic ? ['127.0.0.1'] : undefined,
    pageExtensions: isKeystatic
      ? ['tsx', 'ts', 'jsx', 'js', 'keystatic.tsx', 'keystatic.ts']
      : ['tsx', 'ts', 'jsx', 'js'],
    trailingSlash: true,
    skipTrailingSlashRedirect: isKeystatic,
    turbopack: {
      root
    },
    images: {
      unoptimized: true
    },
    experimental: {
      globalNotFound: true
    }
  }
}
