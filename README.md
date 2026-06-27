# Pitonne.jp

Small pnpm monorepo for the Pitonne public website and Payload CMS.

## Apps

- `apps/web`: public Next.js static-export site for Cloudflare Pages.
- `apps/cms`: Payload CMS app for Cloudflare Workers/OpenNext with D1 records and R2 media.

## Common Commands

- `pnpm dev`: run the public site.
- `pnpm dev:cms`: run the CMS.
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
- Blog and page content use Payload's native rich text editor with toolbar controls, uploads, code blocks, and video embeds.
- Blog posts and pages use Payload's native `Preview` admin action, pointed at the local public site.
- Blog `Category`, `Tags`, and `Related Service Slugs` are controlled selectors backed by the existing site categories, markdown tags, and service slugs.
- Use the CMS `Preview` action after saving a blog post or page to open the matching public URL. Locally this uses `PAYLOAD_PUBLIC_WEB_URL=http://localhost:3000`.

Local public site:

- URL: `http://localhost:3000`
- Blog: `http://localhost:3000/blog/`
- Japanese blog: `http://localhost:3000/ja/blog/`

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
