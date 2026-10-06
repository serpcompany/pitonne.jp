import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js"

const root = dirname(fileURLToPath(import.meta.url))

/** @type {(phase: string) => import('next').NextConfig} */
export default function nextConfig(phase) {
  // `pnpm cms` (local files) needs Keystatic's API route, which static export forbids. That route file uses the
  // `.keystatic.ts` extension and loads only under `pnpm cms` / `pnpm cms:cloud`, so `pnpm dev` and builds keep
  // static-export checks. The /keystatic admin page itself is a static single-page app in every mode.
  const isKeystatic = phase === PHASE_DEVELOPMENT_SERVER && process.env.KEYSTATIC === "1"

  return {
    output: isKeystatic ? undefined : "export",
    // Keystatic redirects localhost to 127.0.0.1 in cloud/GitHub mode, so allow that origin's dev resources
    allowedDevOrigins: isKeystatic ? ["127.0.0.1"] : undefined,
    pageExtensions: isKeystatic ? ["tsx", "ts", "jsx", "js", "keystatic.tsx", "keystatic.ts"] : ["tsx", "ts", "jsx", "js"],
    trailingSlash: true,
    // Keystatic's router reads a trailing slash as an extra path segment (its OAuth callback
    // /keystatic/cloud/oauth/callback/ becomes "not found"), so the CMS dev server doesn't add one. Skipping the
    // redirect, rather than turning trailingSlash off, avoids cached 308 loops when switching between dev and cms.
    skipTrailingSlashRedirect: isKeystatic,
    turbopack: {
      root,
    },
    images: {
      unoptimized: true,
    },
  }
}
