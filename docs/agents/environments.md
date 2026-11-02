# Environments and the Staging gate

What each environment builds and serves, and the password gate in front of Staging. The site
follows SERP's
[Environment Configuration](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/environment-configuration.md)
and [Staging Access](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/staging-access.md)
standards. Which branch deploys where is in [`docs/gitflow.md`](../gitflow.md); the hosts each
environment answers on, and their redirects, are in [`hosts.md`](hosts.md).

## `DEPLOY_ENV`

- A build is `production`, `staging` or `preview`, from `DEPLOY_ENV` and
  `NEXT_PUBLIC_DEPLOY_ENV`, which `deploy.yml` sets to the same value. Only
  `src/lib/deploy-environment.mts` reads them, in `deployEnvironment()`.
- **A missing, unknown or conflicting value means `preview`,** the safe default: a local
  `pnpm build` without it is a preview build. `pnpm check` builds with
  `DEPLOY_ENV=production`.
- **Branch on the helpers, never on a value:** `isIndexable()` (Production and Staging),
  `hasAnalytics()` (Production), `hasPasswordGate()` (Staging) and `siteOrigin()`, the origin a
  build writes into canonicals, hreflang, `og:url`, JSON-LD ids and sitemaps.
  `src/lib/deploy-environment.test.ts` holds the mapping.

## What each environment builds

| | Production | Staging | Preview |
| --- | --- | --- | --- |
| Served at | https://pitonne.jp | https://staging.pitonne.jp, behind a password | `https://pr-<n>.pitonne-jp.pages.dev`, and local builds |
| `siteOrigin()` | `https://pitonne.jp` | `https://staging.pitonne.jp` | `https://pitonne.jp` |
| `robots.txt` (`src/app/robots.ts`) | Allows everything but `/keystatic/` | Disallows every crawler but `AhrefsSiteAudit`, which gets Production's rules | Disallows everything |
| `Sitemap:` line | `https://pitonne.jp/sitemap-index.xml` | `https://staging.pitonne.jp/sitemap-index.xml` | `https://pitonne.jp/sitemap-index.xml` |
| Meta robots | Indexable | Indexable | `noindex, nofollow` |
| `X-Robots-Tag` from `_headers` | None | None; the Function adds it to what it serves without the password | `noindex, nofollow` on every path |
| Google Tag Manager | Loaded | Not loaded | Not loaded |
| `_routes.json` | The committed `public/_routes.json` | Every path runs the Function | The committed file |

- `scripts/environment-headers.mjs`, which `pnpm build` runs after `next build`, writes the
  environment's lines into `out/_headers` and its `out/_routes.json`. Cloudflare adds
  `X-Robots-Tag: noindex` on `*.pitonne-jp.pages.dev` hosts by itself, but not on a custom domain,
  so a preview build sends it explicitly.
- `pnpm audit:out` fails when `robots.txt` and `_headers` disagree about indexing, and before
  each deploy `deploy.yml` checks the environment's `robots.txt` and `_headers` again
  ([`ci.md`](ci.md#deployyml)). Both treat any `X-Robots-Tag: noindex` in `_headers` as
  site-wide, so a `noindex` rule for one path in `public/_headers` needs those checks narrowed
  first.
- **No error reporting.** Sentry, the web stack's default for errors, isn't installed; adding it
  is an open decision for the owner.

## The Staging gate

Staging is built like Production on its own origin, indexable, with Staging canonicals and
sitemaps, so an SEO auditor with the password crawls it as search engines will crawl Production.
The password keeps search engines and the public out.

- **Where:** `handleRequest` in `src/lib/canonical-host.ts`, which `functions/_middleware.ts`
  calls on every request. A request is Staging's when `CF_PAGES_BRANCH` is `staging`, or its host
  is `staging.pitonne.jp` or `staging.pitonne-jp.pages.dev`; the host check keeps the gate on if
  the branch variable never reaches the Function.
- **Not proven yet:** Cloudflare documents `CF_PAGES_BRANCH` for Pages builds, but not that it
  reaches the Function of a deployment made by direct upload, as `deploy.yml` makes them. Without
  it, the host check still gates both Staging hosts, and only a Staging deployment's own
  `<hash>.pitonne-jp.pages.dev` URL answers as Production's do, with a 308 to `pitonne.jp`. The
  first Staging deploy's smoke check of that URL, "expected 308 to" `staging.pitonne.jp`, settles
  it ([`ci-deploys.md`](ci-deploys.md#smoke-tests)). If it fails, the Function needs its
  environment some other way, such as a variable set for the preview environment.
- **Order:** first the host redirect: a host under `pitonne-jp.pages.dev`, the `staging` alias or
  a deployment URL, gets one 308 to the same path on `staging.pitonne.jp`. Every other host goes
  through the gate as `staging.pitonne.jp` does, so a Staging deployment never sends a host such as
  `pitonne.jp` to Staging, and fails closed if one ever reaches it. Then come the exemptions, the
  password, the slashed-file redirect and the files themselves. A Staging build's `_routes.json`
  sends every path through the Function, so images and scripts are gated too.
- **The password** is SERP's shared, public `stagingpassword`, the plain variable
  `STAGING_PASSWORD` in `wrangler.toml` (`[env.preview.vars]`, which Pages applies to every
  deployment but Production's), never a secret. Only the password is checked; any username works.
  Without the variable, every request but the exemptions gets the 401.
- **The check** hashes both values with SHA-256 and compares the digests with
  `crypto.subtle.timingSafeEqual`, so the time taken says nothing about the password.
- **The 401** carries `WWW-Authenticate: Basic realm="Pitonne staging", charset="UTF-8"`,
  `Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow`.
- **A request that passes** reaches the files without its `Authorization` header and gets no
  `noindex`.
- **No shared cache keeps what the gate serves:** every answer it lets through, with the password
  or exempt, carries `Cache-Control: private, no-store`, replacing the file's own, such as a
  sitemap's `s-maxage`. A shared cache may otherwise reuse a response to a request that carried
  `Authorization` when the response allows it ([RFC 9111 §3.5](https://www.rfc-editor.org/rfc/rfc9111#section-3.5)),
  and a cache key never includes the smoke-test header.
- **Exemptions,** each served with `X-Robots-Tag: noindex, nofollow`, even when it carries the
  password: requests with the smoke-test header (`x-pitonne-smoke-test`), so CI's smoke tests reach
  every Staging host, and `/robots.txt`, so a crawler that reaches Staging reads its disallow. The
  site receives no webhooks, so there are no others. Keep the list explicit, in
  `src/lib/canonical-host.ts`.

The tests and smoke checks that hold these rules are named in the product docs'
[Staging gate](../product/environments.md#the-staging-gate). A browser asks for the password once
per session; Ahrefs Site Audit takes it in its crawl settings.

## PR previews

Same-repository pull requests into `staging` or `main` get a preview at
`https://pr-<n>.pitonne-jp.pages.dev` once CI's `test` job passes. It is a `preview` build:
non-indexable, with canonicals on https://pitonne.jp, so it shows behavior, not Production's SEO
output. The production-like local preview shows that
([`verification.md`](verification.md#evidence)). Forked pull requests get no secrets and no
preview.
