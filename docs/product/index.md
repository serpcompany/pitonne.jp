# Product docs

What pitonne.jp does for its visitors, for search engines and for its editors: each behavior that
is built and live on https://pitonne.jp, with the automated check that holds it. It describes the
site as it is, not a roadmap: plans are issues. When a behavior changes, its entry here and its
check change in the same pull request, as SERP's
[Docs Move With the Change](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/keeping-docs-current/docs-move-with-the-change.md)
standard sets.

These pages say what the site does. How each part is built is in the docs
[`AGENTS.md`](../../AGENTS.md) routes to, and each page links the one it relies on.

## The site

pitonne.jp is the website of Pitonne, a concierge wellness clinic in Nishi-Azabu, Tokyo: every
page in English at its bare URL and in Japanese under `/ja/`.

- **[Pages](pages.md):** the home page `/`, About `/about/`, FAQs `/faqs/`, the services index
  `/services/`, each category and service at `/services/<slug>/`, the areas served
  `/areas-served/` with each ward and area below it, the videos `/videos/` and each one at
  `/watch/<slug>/`, Contact `/contact/`, the legal index `/legal/` and its three pages, and the 404
  page.
- **[Blog](blog.md):** the index `/blog/`, each post at `/blog/<slug>/`, each category at
  `/blog/category/<slug>/`, posts in one language, and drafts.
- **[Languages](languages.md):** the two locales' URLs, what each language shows, the language
  switcher, and the signals that pair a page with its translation.
- **[Site-wide](site-wide.md):** the header and phone menu, the footer, breadcrumbs, the booking
  and contact buttons, the phone number and LINE, images, analytics, and the quality bars.
- **[Search engines](search-engines.md):** titles and descriptions, canonicals, sharing tags,
  structured data, sitemaps, `robots.txt`, and each environment's indexing signals.
- **[Hosts and redirects](hosts-and-redirects.md):** the canonical host, trailing slashes, `/en/`,
  moved URLs, and what answers behind the Pages Function, the CMS app included.
- **[Environments](environments.md):** Production, the Staging password gate, and pull request
  previews.
- **[The CMS](cms.md):** what editors edit in Keystatic, the rules it shows them, and how a save
  goes live.

## How behavior is verified

Each entry ends with **Check:**, naming what holds it, or saying "No automated check yet." for
what nothing holds; an entry partly held names its checks and then the part that has none. A
**Source:** line names the SERP standard, ADR or issue that decided a behavior. Checks come in
five kinds:

- **Unit tests** (Vitest), beside the code under `src/` and `scripts/`, and in `tools/checks/`,
  named by file and `describe > it`. A `%s`, `%j` or `%i` in a name stands for each case the test
  runs. `pnpm test` runs them, and CI's `test` job on every pull request and push.
- **Browser journeys** (Playwright) in `e2e/`, named by file and test title, which drive a built
  `out/` served as Cloudflare Pages serves it, at a desktop and a phone width. A title with
  `${environment}` runs on the environment the build was made for; titles generated from a list,
  such as the redirects, are given as they print. CI's `e2e` job runs them on the production build
  ([`verification.md`](../agents/verification.md#browser-journeys)).
- **Build audits:** `pnpm audit:meta` before the build, `pnpm audit:out` and `pnpm audit:seo`
  after it, named by script and the words of the finding they print, with `…` where it names a
  page or a number ([`seo.md`](../agents/seo.md#the-audits)).
- **Smoke tests,** which each deploy runs against the deployed environment, named by script and
  either the URL a check requests with the answer it expects, as `<url>: <status> -> <location>`
  or `<url>: <status> [<content type>]`, or the words of the problem a failing check reports.
  `<sha>` stands for the commit's short hash
  ([`ci-deploys.md`](../agents/ci-deploys.md#smoke-tests)).
- **Lighthouse CI,** in CI's `lighthouse` job, with the scores `lighthouserc.cjs` asserts.

## Coverage

For gardening: the code each page describes, and the day it was last checked against that code. A
gardening pass lists the pages whose code changed after that day, and reads only those.

| Page | Code it covers | Last checked |
| --- | --- | --- |
| [Pages](pages.md) | `src/app/[locale]/page.tsx`, `src/app/[locale]/about/`, `src/app/[locale]/faqs/`, `src/app/[locale]/services/`, `src/app/[locale]/areas-served/`, `src/app/[locale]/videos/`, `src/app/[locale]/watch/`, `src/app/[locale]/contact/`, `src/app/[locale]/legal/`, `src/app/global-not-found.tsx`, `src/components/services/`, `src/components/areas/`, `src/components/area-detail-page.tsx`, `src/components/contact/`, `src/components/legal/`, `src/components/not-found-page.tsx`, `src/lib/data/services.ts`, `src/lib/data/areas.ts`, `src/lib/data/wards/`, `src/lib/data/videos.ts`, `src/lib/data/pages.ts` | 2026-11-01 |
| [Blog](blog.md) | `src/app/[locale]/blog/`, `src/components/blog/`, `src/components/shared/latest-posts-section.tsx`, `src/lib/data/blog-posts.ts`, `src/lib/data/blog-categories.ts`, `src/lib/blog-content-parts.ts`, `src/lib/post-date.ts` | 2026-11-01 |
| [Languages](languages.md) | `src/lib/i18n/`, `src/app/(en)/`, `src/lib/data/routes.ts`, `src/components/header.tsx`, `src/lib/seo.ts`, `src/lib/structured-data.ts` | 2026-11-01 |
| [Site-wide](site-wide.md) | `src/app/[locale]/layout.tsx`, `src/components/header.tsx`, `src/components/header-text.ts`, `src/components/footer.tsx`, `src/components/shared/`, `src/lib/data/site.ts`, `e2e/fixtures.ts`, `lighthouserc.cjs` | 2026-11-01 |
| [Search engines](search-engines.md) | `src/lib/seo.ts`, `src/lib/seo-limits.json`, `src/lib/structured-data.ts`, `src/lib/sitemaps.ts`, `src/app/robots.ts`, the `src/app/sitemap*.xml/` routes, `public/_headers`, `scripts/audit-meta-lengths.mjs`, `scripts/audit-seo-build.mjs`, `scripts/audit-out.mjs`, `scripts/environment-headers.mjs` | 2026-11-01 |
| [Hosts and redirects](hosts-and-redirects.md) | `src/lib/canonical-host.ts`, `functions/_middleware.ts`, `public/_redirects`, `public/_routes.json`, `scripts/smoke-canonical-host.mjs` | 2026-11-01 |
| [Environments](environments.md) | `src/lib/deploy-environment.mts`, `src/lib/canonical-host.ts`, `scripts/environment-headers.mjs`, `scripts/smoke-environment.mjs`, `wrangler.toml`, `.github/workflows/deploy.yml` | 2026-11-01 |
| [The CMS](cms.md) | `keystatic.config.ts`, `src/lib/blog-rules.ts`, `src/app/keystatic/`, `patches/`, `scripts/draft-only-change.mjs`, `scripts/deploy-target.mjs`, `.github/workflows/ci.yml`, `.github/workflows/sync-staging.yml` | 2026-11-01 |
