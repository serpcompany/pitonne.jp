# Migrate pitonne.jp To Cloudflare Pages

Status: implementation plan and handoff notes for the static Cloudflare Pages migration.

## Target Architecture

- Public site: static Next.js export on Cloudflare Pages.
- Cloudflare Pages project name: `pitonne-jp`.
- Build command: `DEPLOY_ENV=production pnpm build`.
- Preview build env: `DEPLOY_ENV=preview`.
- Output directory: `out`.
- Node version: 24, pinned by `.node-version` and CI.
- Package manager: `pnpm@10.14.0`, pinned in `package.json`.
- English routes are real root routes:
  - `/`
  - `/services/`
  - `/blog/...`
  - `/areas-served/...`
- Japanese routes stay under `/ja/...`.
- `/en/*` is a permanent redirect to the bare English path.
- No runtime database, no OpenNext Worker, and no middleware are required for the public site.

## Important Implementation Details

- `next.config.mjs` uses `output: "export"`, `trailingSlash: true`, and unoptimized images for static export.
- `app/(en)/...` contains thin English route wrappers that render the existing locale-aware page implementations with `locale: "en"`.
- `app/[locale]/...` now generates only non-default locales, currently `/ja`.
- Dynamic route params are closed with `dynamicParams = false` for strict static export behavior.
- `middleware.ts` has been removed.
- Cloudflare Pages redirects live in `public/_redirects`.
- Cloudflare Pages static headers for XML/text SEO assets live in `public/_headers`.
- `wrangler.toml` declares the Pages project and `pages_build_output_dir = "./out"`.
- Production detection uses `DEPLOY_ENV=production` or `NEXT_PUBLIC_DEPLOY_ENV=production`; it no longer depends on `VERCEL_ENV`.
- Vercel Analytics has been removed. GTM remains gated to production deployments.
- `robots.txt`, `sitemap.xml`, and `videos-sitemap.xml` are statically emitted by `next build`.
- CI runs `pnpm typecheck` before build; Next no longer uses `typescript.ignoreBuildErrors`.

## Cloudflare Setup

Configure Cloudflare Pages:

- Project name: `pitonne-jp`.
- Production branch: `main`.
- Build command: `DEPLOY_ENV=production pnpm build`.
- Build output directory: `out`.
- Production environment variable:
  - `DEPLOY_ENV=production`
- Preview environment variable:
  - `DEPLOY_ENV=preview`
- DNS/custom domain:
  - Attach `pitonne.jp` only after preview validation passes.
  - Keep the Vercel deployment available until Cloudflare production is verified.

Required redirects are copied to `out/_redirects` from `public/_redirects`:

- `/en` -> `/`
- `/en/*` -> `/:splat`
- `/services/medications/` -> `/services/medication/`
- `/ja/services/medications/` -> `/ja/services/medication/`

## Future Payload CMS Path

Payload can be added later without making the public site dynamic.

Recommended shape:

- Public frontend stays on Cloudflare Pages as a static export.
- Payload runs separately at `cms.pitonne.jp` or `admin.pitonne.jp`.
- Payload owns editor auth, admin UI, media handling, and database access.
- Payload uses Postgres.
- Publishing in Payload triggers a Cloudflare Pages deploy hook.
- The public site fetches published CMS content during build and emits static pages.

Keep public-site content access centralized in `lib/data/*` so a future Payload adapter can replace or augment Markdown without changing the route structure.

## Validation Checklist

Run locally before Cloudflare cutover:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm audit:routes`
- `pnpm audit:content`
- `pnpm audit:strings`
- `DEPLOY_ENV=production pnpm build`
- `test -f out/index.html`
- `test -f out/ja/index.html`
- `test -f out/robots.txt`
- `test -f out/sitemap.xml`
- `test -f out/videos-sitemap.xml`
- Confirm no `out/en` directory exists.

Production SEO checks:

- `out/robots.txt` contains `Allow: /`.
- Production HTML does not include noindex robots metadata.
- Canonical URLs use `https://pitonne.jp`.
- English canonicals are bare paths, never `/en`.
- Japanese canonicals use `/ja/...`.
- Hreflang includes English, Japanese, and x-default where expected.

Preview SEO checks:

- `DEPLOY_ENV=preview pnpm build` emits `out/robots.txt` with `Disallow: /`.
- Preview HTML includes noindex behavior.

Route smoke checks on Cloudflare preview and production:

- `/`
- `/ja/`
- `/about/`
- `/ja/about/`
- `/services/`
- `/services/iv-therapy/`
- `/ja/services/iv-therapy/`
- `/areas-served/`
- representative ward and area pages
- `/blog/`
- representative blog post and category page
- `/videos/`
- representative `/watch/.../` page
- `/contact/`
- `/faqs/`
- legal pages
- `/robots.txt`
- `/sitemap.xml`
- `/videos-sitemap.xml`
- `/sitemap.xsl`
- representative `/images/...` assets

## Independent Audit Subagents

Before DNS cutover, run independent audits with separate scopes:

- Routing audit:
  - Confirm no middleware dependency remains.
  - Confirm bare English routes exist.
  - Confirm Japanese routes are under `/ja`.
  - Confirm `/en/*` redirects.
  - Confirm trailing slash and medication redirects.

- SEO audit:
  - Confirm canonical, hreflang, robots, sitemap, video sitemap, Open Graph, Twitter metadata, and JSON-LD.
  - Confirm production is indexable and preview is noindex.
  - Confirm no canonical URL contains `/en`.

- Static export audit:
  - Confirm all expected pages and assets exist in `out/`.
  - Confirm no public route needs middleware, cookies, headers, server actions, or request-time CMS calls.

- Cloudflare readiness audit:
  - Confirm `wrangler.toml`, `_redirects`, env vars, output directory, and DNS cutover steps.
  - Confirm no Vercel-only runtime package, env var, or workflow dependency remains.

- Future CMS readiness audit:
  - Confirm content access is centralized enough to swap Markdown for Payload build-time data later.
  - Confirm public routes and SEO are not tied to Markdown file paths.

## Rollback

Before Vercel is retired:

- Roll back by moving DNS/custom domain back to the existing Vercel deployment.
- Keep the Vercel project and last good deployment active through the stability window.

After Vercel is retired:

- Rollback requires restoring the previous Vercel setup or serving the last known good static build from Cloudflare Pages.
