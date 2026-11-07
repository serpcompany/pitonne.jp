# ADR 0003: Stay a static export on Cloudflare Pages

- **Status:** Accepted
- **Date:** 2026-10-31

## Context

SERP's [web stack](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/web-stack/README.md#the-stack)
hosts every site on Cloudflare Workers through OpenNext. Its "Not chosen" table rejects static
exports (`output: 'export'`) because they "can't send per-environment headers or 308 redirects".

pitonne.jp is a Next.js static export (`next.config.mjs`) that `deploy.yml` uploads to Cloudflare
Pages. The 2026-10 refactor brought the repository to SERP's standards, so it had to decide
whether the site moves to Workers.

## Decision

The site stays a static export on Cloudflare Pages. `pnpm build` renders every page into `out/`,
Pages serves it, and the Pages Function (`functions/_middleware.ts`) runs in front of it for the
host rules and the Staging password gate.

## Why

- **Nothing is rendered per request.** The export is 228 HTML files: the 224 pages in the
  sitemaps, the 404 page with the two copies Next.js also writes, and the Keystatic app shell, all
  built from content in git. There is no sign-in, no database and no form endpoint; the contact
  form is a LeadConnector iframe.
- **A CMS save needs a rebuild on either platform,** because Keystatic commits each post to git.
  Workers wouldn't make publishing faster.
- **SERP's reason against static exports doesn't hold on Pages:**
  - `scripts/environment-headers.mjs` writes each environment's headers into `out/_headers`, and
    its routes into `out/_routes.json`, when the site builds.
  - The Pages Function answers non-canonical hosts and slashed file URLs with one 308, and folds a
    `_redirects` rule into that same hop ([hosts](../agents/hosts.md)).
- **What the standards ask of a deployed site works on the static build:** the 404 page
  (`src/app/global-not-found.tsx`), the Staging password gate, and Staging's own canonicals,
  hreflang and sitemaps ([environments](../agents/environments.md)).
- **Moving would risk what the site depends on.** Workers would change the rendered output,
  headers and redirects of a live site whose search rankings, and whose editors' publishing flow,
  the refactor must not put at risk.
- **OpenNext doesn't build on Windows,** which a maintainer's machine runs.

## Consequences

- English pages are thin wrappers in `src/app/(en)/` around the `[locale]` pages, since a static
  export can't rewrite bare URLs to `/en/` as SERP's localization standard does
  ([i18n](../i18n.md#architecture)).
- Images are served unoptimized (`images.unoptimized: true`), so `next/image` would optimize
  nothing and Biome's `noImgElement` is off ([exceptions](../agents/exceptions.md)).
- The production-like preview is `wrangler pages dev out`, not a Worker in workerd
  ([verification](../agents/verification.md#evidence)).
- The host and slash rules live in the Pages Function, and the static files that
  `public/_routes.json` keeps off it can't be redirected, which is one of the trailing-slash
  exceptions `AGENTS.md` lists.

## Revisit when

The site needs work done per request: a form endpoint of its own, sign-in, or incremental static
regeneration.
