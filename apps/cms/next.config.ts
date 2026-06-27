import { withPayload } from "@payloadcms/next/withPayload"
import type { NextConfig } from "next"
import path from "node:path"

const projectRoot = process.cwd()
const workspaceRoot = path.resolve(projectRoot, "../..")

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/api/media/file/**",
      },
    ],
  },
  serverExternalPackages: ["jose", "pg-cloudflare"],
  turbopack: {
    root: workspaceRoot,
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
