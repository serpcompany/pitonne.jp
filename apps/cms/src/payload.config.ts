import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { sqliteD1Adapter } from "@payloadcms/db-d1-sqlite"
import { mcpPlugin } from "@payloadcms/plugin-mcp"
import { r2Storage } from "@payloadcms/storage-r2"
import { CloudflareContext, getCloudflareContext } from "@opennextjs/cloudflare"
import type { GetPlatformProxyOptions } from "wrangler"
import { buildConfig } from "payload"

import { BlogPosts } from "@/collections/BlogPosts"
import { Media } from "@/collections/Media"
import { Pages } from "@/collections/Pages"
import { Users } from "@/collections/Users"
import { contentRichTextEditor } from "@/lib/richTextMarkdown"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)
const isPayloadCLI = process.argv.some((value) => realpath(value)?.endsWith(path.join("payload", "bin.js")))
const isProduction = process.env.NODE_ENV === "production"
const isNextProductionBuild = process.env.NEXT_PHASE === "phase-production-build"
const localAdminEmail = process.env.PAYLOAD_LOCAL_ADMIN_EMAIL
const localAdminPassword = process.env.PAYLOAD_LOCAL_ADMIN_PASSWORD
const wranglerPersistPath = process.env.WRANGLER_PERSIST_PATH
const shouldBootstrapLocalAdmin = !isProduction && Boolean(localAdminEmail && localAdminPassword)

if (isProduction && !process.env.PAYLOAD_SECRET) {
  throw new Error("PAYLOAD_SECRET is required in production.")
}

const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === "string") {
      fn(JSON.stringify({ level, msg: objOrMsg }))
      return
    }

    fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || "info",
  trace: createLog("trace", console.debug),
  debug: createLog("debug", console.debug),
  info: createLog("info", console.log),
  warn: createLog("warn", console.warn),
  error: createLog("error", console.error),
  fatal: createLog("fatal", console.error),
  silent: () => {},
} as any

const cloudflare =
  isPayloadCLI || !isProduction || isNextProductionBuild
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })
const bindings = cloudflare.env as Record<"D1" | "R2", any>

const cors = process.env.PAYLOAD_CORS_ORIGINS
  ? process.env.PAYLOAD_CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : ["http://localhost:3000", "http://localhost:3001"]

export default buildConfig({
  admin: {
    user: Users.slug,
    autoLogin: shouldBootstrapLocalAdmin
      ? {
          email: localAdminEmail,
        }
      : false,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, BlogPosts, Pages],
  cors,
  db: sqliteD1Adapter({ binding: bindings.D1 }),
  editor: contentRichTextEditor,
  graphQL: {
    disablePlaygroundInProduction: true,
  },
  localization: {
    locales: [
      { label: "English", code: "en" },
      { label: "Japanese", code: "ja" },
    ],
    defaultLocale: "en",
    fallback: true,
  },
  logger: isProduction ? cloudflareLogger : undefined,
  plugins: [
    mcpPlugin({
      collections: {
        "blog-posts": {
          enabled: {
            find: true,
          },
          description:
            "Localized published and draft blog articles for the Pitonne website, including slugs, titles, excerpts, Markdown body content, categories, tags, author metadata, publish dates, and related service slugs.",
        },
        media: {
          enabled: {
            find: true,
          },
          description: "Uploaded media assets used by public website content.",
        },
        pages: {
          enabled: {
            find: true,
          },
          description:
            "Editable localized page metadata and hero copy for selected Pitonne website pages keyed by stable page identifiers such as home, about, faqs, and contact.",
        },
      },
    }),
    r2Storage({
      bucket: bindings.R2,
      collections: {
        media: true,
      },
    }),
  ],
  onInit: async (payload) => {
    if (!shouldBootstrapLocalAdmin || !localAdminEmail || !localAdminPassword) {
      return
    }

    const existingUser = await payload.find({
      collection: "users",
      depth: 0,
      limit: 1,
      pagination: false,
      where: {
        email: {
          equals: localAdminEmail,
        },
      },
    })

    if (existingUser.docs.length > 0) {
      return
    }

    await payload.create({
      collection: "users",
      data: {
        email: localAdminEmail,
        password: localAdminPassword,
      },
      overrideAccess: true,
    })

    payload.logger.info(`Created local Payload admin user: ${localAdminEmail}`)
  },
  secret: process.env.PAYLOAD_SECRET || "development-only-change-me",
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
})

function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  const persist =
    isNextProductionBuild || process.env.WRANGLER_PERSIST === "false"
      ? false
      : wranglerPersistPath
        ? { path: path.resolve(dirname, "..", wranglerPersistPath) }
        : undefined

  return import(/* webpackIgnore: true */ `${"__wrangler".replaceAll("_", "")}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        persist,
        remoteBindings: isProduction && !isNextProductionBuild,
      } satisfies GetPlatformProxyOptions),
  )
}
