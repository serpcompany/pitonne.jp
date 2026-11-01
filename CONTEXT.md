# Pitonne

The website of Pitonne, a concierge wellness clinic in Nishi-Azabu, Tokyo, in English and Japanese.
These are the terms that are easy to confuse; how the parts work is in
[`ARCHITECTURE.md`](ARCHITECTURE.md).

## Language

**Locale**:
The language a page is in, `en` or `ja` (`src/lib/i18n/config.ts`). English is the default and
has bare URLs; Japanese pages live under `/ja/`.
_Avoid_: `/en/` (never a public URL; it redirects to the bare path), language version

**Canonical route**:
A page's path without a locale prefix, in its one canonical form, such as `/services/iv-therapy/`
(`canonicalRoutes` in `src/lib/data/routes.ts`). `localizedRoute(path, locale)` turns it into the
URL for a locale.
_Avoid_: URL (for the locale-neutral path), slug (the last segment only)

**Translation**:
A Japanese content file paired with its English original by an identical filename. Services and
legal pages always have one; a blog post may be published in one locale only.
_Avoid_: localization (the whole two-locale setup)

**Service**:
A treatment page from `content/services/`, at `/services/<slug>/`. A **parent service**
(`kind: parent`) introduces a group of services, such as IV Therapy; a **leaf service** names its
parent in `parentSlug`.
_Avoid_: product, treatment

**Ward** and **area**:
A ward is one of the Tokyo wards the clinic serves, such as Minato, with a page at
`/areas-served/<ward>/`. An area is a neighborhood inside a ward, such as Roppongi, at
`/areas-served/<ward>/<area>/`.
_Avoid_: location, district, city

**Blog category**:
The topic a post belongs to, from `content/blog-categories/<slug>.json`, with a page at
`/blog/category/<slug>/` in each locale where a published post uses it.
_Avoid_: tag (posts also have tags, which get no page), service category

**Draft**:
A post saved with `draft: true`. It is in git, but no build includes it, in any environment.
_Avoid_: preview (an environment), unpublished branch (editors never use branches)

**Production**, **Staging** and **preview**:
The three environments, named by `DEPLOY_ENV`. Production is https://pitonne.jp, built from
`main`. Staging is https://staging.pitonne.jp, built from `staging` like Production on its own
origin, behind a password. A preview is a pull request's non-indexable build at
`pr-<n>.pitonne-jp.pages.dev`, and any build without `DEPLOY_ENV`.
_Avoid_: dev (the local `pnpm dev` server), test site

**Canonical host**:
The host an environment writes its URLs on: `pitonne.jp` for Production, `staging.pitonne.jp` for
Staging. The Pages Function redirects the environment's other hosts there.
_Avoid_: domain (several domains serve each environment)

**Promotion**:
Moving `main` forward to `staging`'s tip by fast-forward, through the Promote to Production
workflow or an admin's push. It is never a squash or a merge.
_Avoid_: release, merge to main

**CMS save**:
A commit Keystatic Cloud makes on `main` when an editor saves. It deploys Production without a
promotion, and Sync staging then merges it into `staging`.
_Avoid_: publish (a save of a draft publishes nothing)

**Content fast path**:
CI deploying a push at once, without waiting for `test`, because the push changes only files the
CMS edits or its commit already passed `test`: the `Deploy content` job.
_Avoid_: hotfix (a pull request into `main` with code)

**Smoke test**:
The checks `deploy.yml` runs against a deployment right after uploading it, from
`scripts/smoke-environment.mjs` and, on Production, `scripts/smoke-canonical-host.mjs`.
_Avoid_: the audits (`audit:out`, `audit:seo`), which read `out/` before the upload

**Smoke-test header**:
`x-pitonne-smoke-test`. With it the Pages Function skips the host redirect on any host, and the
Staging gate lets the request through with `noindex`. Search engines never send it.
