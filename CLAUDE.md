# Pitonne.jp — Project Instructions

Workflow (stage, inner-loop commands, the `pnpm check` finish gate, preview/deploy evidence, git workflow) is in
[AGENTS.md](AGENTS.md). This file holds the project rules.

## i18n Rules

- Every user-visible string in JSX must come from `getDictionary(locale)`, never hardcoded.
  Exception: brand names ("Pitonne"), technical identifiers, and `aria-hidden` content.
- When adding a new UI string, add the key to BOTH `src/lib/i18n/dictionaries/en.json` and
  `src/lib/i18n/dictionaries/ja.json` in the same commit. Never add a key to only one file.
- Components receive `locale` as a prop. Call `getDictionary(locale)` at the component level.
- All `<Link href>` values must use `localizedRoute(path, locale)`.
- Services and legal content files must exist in both `content/*/` and `content/*/ja/`.
  When creating a new English service or legal file, always create the Japanese counterpart.
- Blog posts may exist in one locale only (see `docs/adr/0001-blog-cms.md`). Translations pair by identical filename/slug;
  a missing translation gets no page, index/category entry, hreflang, or sitemap URL in that locale.
- `draft: true` blog posts are excluded from every build (production, staging, PR previews). Don't link to drafts.
- Blog frontmatter rules (zod in `src/lib/data/blog-posts.ts`, limits in `src/lib/blog-rules.ts`): excerpt 70–160 chars; under 110 without
  `metaDescription`, the meta description is extended with the post's opening sentences at build time (never fail a CMS save). `featureImageAlt` is optional; an image without it uses the post title. The slug is
  the filename; don't add a `slug:` key. `readingTime` is computed at build; don't add it to new posts.
- Blog posts are edited in Keystatic (`keystatic.config.ts`, guide in `docs/cms.md`) at `/keystatic`, a static
  single-page app served for every `/keystatic/*` path by `public/_redirects`. CMS saves commit straight to `main` (the
  Keystatic Cloud app bypasses the ruleset) and deploy to Production without waiting for a promotion, the one exception
  to the staging → main flow; the Sync staging workflow then merges `main` back into `staging`. Editors use the Draft
  checkbox, not branches. Locally, `pnpm cms`
  edits files and `pnpm cms:cloud` uses Keystatic Cloud. Feature images live in `public/images/content/blog/<slug>/`
  (English) and `public/images/content/blog/ja/<slug>/` (Japanese).
- Blog markdown links to internal pages use locale-neutral relative paths (`/blog/<slug>/`, `/contact/`), never
  `https://pitonne.jp/...` or `/ja/...`; Japanese posts resolve them to `/ja/...` at render time.
- Blog categories live in `content/blog-categories/<slug>.json` (bilingual `name`/`nameJa`, `description`/`descriptionJa`,
  optional `ctaDescription`/`ctaDescriptionJa`, editable in the CMS); posts store only `categorySlug`. Deleting or renaming a category still used by posts fails the
  build until those posts are moved to another category.
- The area data model uses co-located fields (`name`/`nameJa`, `description`/`descriptionJa`).
  When adding a new area, provide both English and Japanese values inline.
- Metadata (`title`, `description`, `openGraph`) must use dictionary values or locale-aware
  data, never hardcoded English.
- Business data (address, hours, phone) must come from `getBusinessInfo(locale)`, not `businessInfo` directly.
- Run `pnpm test` before committing to catch dictionary key sync and content parity issues.
- `src/lib/i18n/hardcoded-strings.test.ts` (run by `pnpm test`) fails on user-visible text in `src/app` and
  `src/components` that doesn't come from the dictionary: JSX text, text attributes and props, and metadata.

## Architecture Quick Reference

- **Locale config**: `src/lib/i18n/config.ts`
- **Dictionaries**: `src/lib/i18n/dictionaries/{en,ja}.json`
- **Dictionary loader**: `src/lib/i18n/dictionaries.ts` — `getDictionary(locale)`
- **Route localization**: `src/lib/data/routes.ts` — `localizedRoute(path, locale)`
- **Business data**: `src/lib/data/site.ts` — `getBusinessInfo(locale)`
- **Content data**: `src/lib/data/blog-posts.ts`, `src/lib/data/services.ts` (accept `locale` param)
- **Area data**: `src/lib/data/areas.ts` (co-located en/ja fields)
- **Sitemaps**: `src/lib/sitemaps.ts`. `/sitemap-index.xml` is the entry point and lists one root-level child per content
  group (`/sitemap-pages.xml`, `-services`, `-areas`, `-blog`, `-categories`, `-videos`), each served by
  `src/app/sitemap-<group>.xml/route.ts`. `/sitemap.xml` serves the same XML as the index; `/videos-sitemap.xml` 301s to
  `/sitemap-videos.xml`. The English homepage is listed as `https://pitonne.jp` (no slash); every other URL ends in `/`.
  A new route type goes in an existing group or a new group (add it to `sitemapGroups`, a route file and `public/_headers`).
- **i18n docs**: `docs/i18n.md`

## Git flow and environments

- `staging` is the base branch: PRs go into `staging` (`gh pr create --base staging`), which deploys Staging at
  https://staging.pitonne.jp. `main` is Production (https://pitonne.jp) and receives code only by fast-forward promotion
  (`git push origin origin/staging:main` or the Promote to Production workflow), never a squash. See `docs/gitflow.md`.
- Every Staging/Production deploy uploads the branch tip. A code push's own deploy waits for CI's `test` job (a
  promoted commit that passed on `staging` deploys at once), but code already on the branch also goes live with the
  next CMS save. CMS content saves deploy as soon as they build and are never blocked by `test`; a failing `test` or
  deploy on `main` opens a "CI is failing on main" alert issue instead. Each deploy is smoke-tested: Production allows
  crawling and lists its sitemap; Staging and PR previews send noindex.
- `DEPLOY_ENV` is `production`, `staging` or `preview`. Only `production` is indexable; every other build (and any
  build without `DEPLOY_ENV`) disallows crawling in `robots.txt`, has a noindex meta robots tag, and sends
  `X-Robots-Tag: noindex` (`scripts/environment-headers.mjs`). Test with `isProductionDeployment()` from `src/lib/seo.ts`,
  never for a specific non-production value.

## Audits and parity tests

`pnpm check` and CI run these (see [AGENTS.md](AGENTS.md)). The SEO audits mirror the Ahrefs Site Audit checks:
- `pnpm audit:meta` — blog/service `<title>` 15–70 chars (incl. " | Pitonne") and meta description 110–160 chars.
  Use the optional `metaTitle` / `metaDescription` frontmatter instead of editing the visible title/excerpt.
- `pnpm audit:seo` — run after `pnpm build`; checks every page in `out/` for title/description length, exactly one `<h1>`
  (the CMS offers only H2–H4, and a body that starts with `# Title` has that line dropped), complete Open Graph tags (use `pageOpenGraph()` from `src/lib/seo.ts`),
  broken or redirecting internal links, images over 5 MB, and the sitemap index pattern: `robots.txt` lists only
  `/sitemap-index.xml`, every indexable page is in exactly one child sitemap, and every sitemap URL is a page that isn't
  `noindex` and whose canonical equals that URL (hreflang alternates must be pages too).
- JSON-LD is typed with `schema-dts` (`WithContext<...>` in `src/lib/structured-data.ts`), so `pnpm typecheck`
  rejects properties that aren't valid for a schema.org type.

Key parity tests:
- `src/lib/i18n/dictionaries.test.ts` — en.json and ja.json must have identical keys
- `src/lib/i18n/content-parity.test.ts` — services and legal must exist in both locales; blog translations pair by filename/slug
- `src/lib/data/routes.test.ts` — every canonical route has a built page in each locale, and blog pages exist only for
  published posts in their own locale

## Conventions

- Pages use Next.js App Router with `[locale]` dynamic segment
- Components are in `src/components/`, page templates in `src/app/[locale]/`
- Shared components (`src/components/shared/`) accept `locale` prop
- Content is markdown in `content/{blog,services,pages}/` with `ja/` subdirectories
- Use `canonicalRoutes` from `src/lib/data/routes.ts` for all internal paths
- SEO helpers in `src/lib/seo.ts`: `localizedCanonicalUrl`, `localizedHreflangAlternates`
