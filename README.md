# Pitonne.jp

Small pnpm monorepo for the Pitonne public website and Payload CMS.

## Apps

- `apps/web`: public Next.js static-export site for Cloudflare Pages.
- `apps/cms`: Payload CMS app for Cloudflare Workers/OpenNext with D1 records and R2 media.

## Common Commands

- `pnpm dev`: run the public site.
- `pnpm dev:cms`: run the CMS.
- `pnpm --filter cms generate:content-options`: regenerate Payload blog category, tag, and related service select options from `apps/web/content`.
- `CMS_API_URL=http://localhost:3001 CMS_EMAIL=local-admin@pitonne.test CMS_PASSWORD=local-admin-password pnpm seed:cms`: seed local CMS content from the existing markdown/page content.
- `pnpm build`: build the public static site to `apps/web/out`.
- `PAYLOAD_SECRET=dev-build-secret pnpm --filter cms build:worker`: build the CMS Worker bundle.
- `pnpm test`: run the public-site test suite.
- `pnpm typecheck`: typecheck both workspaces.

Leave `CMS_API_URL` unset in `apps/web` to build from markdown/static fallback content. Set it to a Payload server URL when the public site should prefer CMS-published content.

## Local Development

Local-only env files are ignored by git:

- `apps/cms/.env.local`: Payload secret, local admin bootstrap, and local Payload MCP API key.
- `apps/web/.env.local`: public site points at the local CMS API.

Local CMS admin:

- URL: `http://localhost:3001/admin`
- Email: `local-admin@pitonne.test`
- Password: `local-admin-password`
- Blog posts use Payload's native Lexical rich text editor. On save, the CMS stores synchronized hidden Markdown for the public static site.
- Page content uses Payload's native rich text editor with toolbar controls, uploads, code blocks, and video embeds.
- Blog posts and pages use Payload's native `Preview` admin action, pointed at the local public site.
- Blog `Category`, `Tags`, and `Related Service Slugs` are controlled Payload `select` fields generated from real site content. Run `pnpm --filter cms generate:content-options` after changing `apps/web/content/services/**/*.md` or `apps/web/content/blog/**/*.md`.
- Media uploads accept images only. Node CMS runtimes with `PAYLOAD_ENABLE_SHARP=true` use Payload's native `sharp` integration to generate thumbnail, card, hero, and Open Graph image sizes. Cloudflare Worker builds and runtime keep R2 storage and image-only validation, but leave native `sharp` disabled.
- Use the CMS `Preview` action after saving a blog post or page to open the matching public URL. Locally this uses `PAYLOAD_PUBLIC_WEB_URL=http://localhost:3000`.

Local public site:

- URL: `http://localhost:3000`
- Blog: `http://localhost:3000/blog/`
- Japanese blog: `http://localhost:3000/ja/blog/`
- To test CMS-authored public blog content locally, run the public site with `CMS_API_URL=http://localhost:3001`. When this is set, blog pages read published posts from the local CMS instead of falling back to Markdown content. Drafts remain visible only in Payload admin until published.
- The public web app does not send `CMS_AUTH_TOKEN`, `CMS_API_TOKEN`, or any bearer token for CMS reads. Payload published content is read through normal public collection access. The seed script can use `CMS_AUTH_TOKEN` as an already-issued Payload login JWT; it is not the MCP API key and it is not generic REST API-key auth.

### Blog Editing Workflow

Blog posts keep two body fields so the CMS can author in Payload Lexical rich text while the static web app continues to consume Markdown:

- `bodyRichText`: Payload Lexical rich text field shown in admin.
- `body`: hidden Markdown storage generated for the public website.

On save, the CMS converts `bodyRichText` to Markdown and stores it in `body`. Existing Markdown content still backfills `bodyRichText` when read.

Featured images are Payload upload relations to `media`. The relation picker is filtered to images, and the `media` collection rejects non-image uploads via Payload's native upload validation.

For local end-to-end testing, create or edit a blog post in Payload admin, publish it, and refresh `http://localhost:3000/blog/`. In development, CMS requests are uncached so public blog changes should be visible without restarting the public web server. Deleting the published post in Payload removes it from the public blog on refresh.

Blog select options are generated into `apps/cms/src/generated/contentOptions.ts`:

- Categories come from English service frontmatter where `kind: parent`, with Japanese labels matched by service `slug`.
- Related service slugs come from all English service frontmatter `slug` and `title` values.
- Tags come from the union of `tags` in English and Japanese blog frontmatter.

Payload imports the generated TypeScript file at runtime instead of scanning Markdown files, which keeps Worker bundles static while preserving `apps/web/content` as the source data.

## Codex MCP

Codex MCP is configured in `.codex/config.toml` as the `payload_cms` MCP server. It uses `mcp-remote` to connect Codex to the local Payload endpoint at `http://127.0.0.1:3001/api/mcp`.

Payload's `MCP -> API Keys` admin area is not site content. It is the official `@payloadcms/plugin-mcp` API-key gate for `/api/mcp`. The local key lives in `apps/cms/.env.local` as `PAYLOAD_MCP_API_KEY`, and the project Codex config sources that file before starting `mcp-remote`.

The local Codex key is read-only and exposes:

- `findBlogPosts`
- `findMedia`
- `findPages`

Restart Codex after changing `.codex/config.toml` or `PAYLOAD_MCP_API_KEY`.

## Pitonne Google Sheet

- business info: https://docs.google.com/spreadsheets/d/1Eleu4irittacEOz_4z3omwceXgzZAoP8xSTe4kv8HR8/edit?gid=536022593#gid=536022593
- service info: https://docs.google.com/spreadsheets/d/1Eleu4irittacEOz_4z3omwceXgzZAoP8xSTe4kv8HR8/edit?gid=559859161#gid=559859161
- faq content: https://docs.google.com/spreadsheets/d/1Eleu4irittacEOz_4z3omwceXgzZAoP8xSTe4kv8HR8/edit?gid=65618073#gid=65618073
- sitemap with links to images and content: https://docs.google.com/spreadsheets/d/1Eleu4irittacEOz_4z3omwceXgzZAoP8xSTe4kv8HR8/edit?gid=658035943#gid=658035943
- another repo with some content and images: `/Users/devin/dev/repos/pitonne.jp/assets`
- another repo where content was collected: `/Users/devin/dev/repos/pitonne.jp-nextjs-refactor-1`
