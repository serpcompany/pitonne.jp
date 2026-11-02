# Environments

The three places the site is served, Production, Staging and pull request previews, and what each
gives a visitor or a crawler: its origin, Staging's password gate, and a preview's place outside
search. Each environment's indexing signals are in
[Search engines](search-engines.md#indexing-signals), and its analytics in
[Site-wide](site-wide.md#analytics). What each build sets, and the gate's details, are in
[`docs/agents/environments.md`](../agents/environments.md); which branch deploys where, and when,
in [`docs/gitflow.md`](../gitflow.md). How a check is named is in
[How behavior is verified](index.md#how-behavior-is-verified).

## The three environments

**Production, Staging and previews.** Production is https://pitonne.jp, built from `main`.
Staging is https://staging.pitonne.jp, built from `staging` as Production is, on its own origin,
behind a password. A pull request from this repository into `staging` or `main` gets a preview at
`pr-<n>.pitonne-jp.pages.dev` once CI's `test` job passes; one from a fork gets none.

- Source: SERP's
  [Environment Configuration](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/environment-configuration.md)
  standard.
- Check: `tools/checks/deploy-workflows.test.ts`, "CI and deploy workflows > deploys Production
  only from main, Staging only from staging, and previews only to pr-<n>" and "previews
  same-repository PRs into staging or main after validation".

**Each build's own origin.** A build writes its own origin wherever it writes a URL: canonicals,
hreflang, `og:url`, sharing images, structured data, the sitemaps, and absolute links in the
services' and legal pages' text. Staging's name https://staging.pitonne.jp; Production's and
previews' name https://pitonne.jp. A build with no environment named, or an unknown one, is a
preview.

- Check: `src/lib/site-origin.test.tsx`, "URLs a %s build writes > puts canonicals, og:url,
  hreflang and social images on its own host", "writes absolute site links in legal and service
  markdown on its own host", "sets metadataBase, absolute links and JSON-LD ids in the layout" and
  "lists its own URLs in the sitemap index, the sitemaps and their hreflang links";
  `src/lib/deploy-environment.test.ts`, "deploy environment > falls back to preview for a missing,
  unknown or conflicting value: %j" and "derives indexing, analytics, the password gate and the
  site origin from it"; `scripts/smoke-environment.mjs`, "canonical is …, expected …" on
  Staging.

## The Staging gate

**A password on every Staging URL.** Without the password, a request to Staging answers 401 with
a Basic challenge, `Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow`, and serves
nothing, images and scripts included. Any username works with the shared password that
[`docs/agents/environments.md`](../agents/environments.md#the-staging-gate) gives. A browser asks
for it once per session. Whatever the gate lets through, with the password or without it, is
marked `Cache-Control: private, no-store`, so no shared cache serves it to someone without the
password.

- Source: SERP's
  [Staging Access](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/staging-access.md)
  standard.
- Check: `src/lib/staging-gate.test.ts`, "staging password gate > answers 401 with a Basic
  challenge to %s, without serving anything", "checks only the password, whatever the username
  (%j)", "fails closed when STAGING_PASSWORD is missing or empty", "gates %s like any page" and
  "keeps every answer it serves out of shared caches, whatever the file itself allows";
  `scripts/environment-headers.test.mjs`, "environment routes > sends every staging path through
  the Function, so the password gate covers static files"; `scripts/audit-out.mjs`, "so the
  password gate must cover every path"; `scripts/smoke-environment.mjs`, on
  https://staging.pitonne.jp for `/`, `/ja/` and `/favicon.ico`, "without the password, expected
  401", "expected Basic", "expected no-store" and "expected noindex".

**With the password.** Staging's pages answer 200 as Production builds them: indexable, with no
`noindex` and with Staging canonicals, so an SEO auditor with the password crawls Staging as
search engines crawl Production.

- Check: `src/lib/staging-gate.test.ts`, "staging password gate > strips Authorization before
  serving a verified request, and never adds noindex to it"; `src/lib/site-origin.test.tsx`,
  "staging pages > are indexable and load no analytics"; `scripts/smoke-environment.mjs`, "with the
  password, expected 200", "with the password" (a `noindex`) and "canonical is …, expected …".

**Without the password.** Only two things are served without it, each with
`X-Robots-Tag: noindex, nofollow`: `/robots.txt`, which disallows every crawler but Ahrefs' site
auditor, gives that auditor Production's rules, and lists Staging's sitemap index; and CI's
smoke-test requests.

- Check: `src/lib/staging-gate.test.ts`, "staging password gate > serves %s without the password,
  with noindex" and "keeps noindex on an exempt request even when it carries the password";
  `src/lib/site-origin.test.tsx`, "robots.txt > blocks every crawler on staging except the site
  auditor, which gets production rules"; `scripts/smoke-environment.mjs`, "without the password,
  expected 200", "doesn't disallow all crawlers" and "doesn't list" for `/robots.txt`. The
  journey `e2e/environment.spec.ts`, "serves the ${environment} robots.txt", checks it too, but
  only when run by hand on a Staging build: CI runs the journeys on the production build.

**Staging's other hosts.** `staging.pitonne-jp.pages.dev` and Staging's deployment URLs answer
one 308 to the same path on https://staging.pitonne.jp before asking for the password. Any other
host that reaches a Staging deployment asks for the password, as staging.pitonne.jp does, and is
never sent to Staging. Whether a Staging deployment's own URL is told it is Staging isn't proven
yet: if it isn't, that URL answers as Production's do, with a 308 to https://pitonne.jp, and the
first Staging deploy's smoke check shows which
([`docs/agents/environments.md`](../agents/environments.md#the-staging-gate)).

- Check: `src/lib/staging-gate.test.ts`, "staging canonical host > sends %s to %s in one 308,
  before asking for the password", "gates %s as it gates the staging host, never sending it to
  Staging", "folds a _redirects rule into the same hop" and "gates the staging hosts when
  CF_PAGES_BRANCH is %j"; `scripts/smoke-environment.mjs`, "expected 308 to"
  `https://staging.pitonne.jp/contact/`, for `/contact` on the other two hosts.

**No password elsewhere.** Production and previews never ask for one.

- Check: `src/lib/staging-gate.test.ts`, "staging password gate > never gates another deployment
  (%j), even with STAGING_PASSWORD set"; `scripts/smoke-environment.mjs`, "sends WWW-Authenticate:"
  (on Production).

## Pull request previews

**Outside search.** A preview shows a pull request's behavior, not Production's SEO output: it
sends `noindex, nofollow` in a header on every path and a meta tag on every page, its `robots.txt`
disallows everything, its canonicals name https://pitonne.jp, and it loads no analytics. A new
commit replaces it.

- Source: [#50](https://github.com/serpcompany/pitonne.jp/issues/50).
- Check: `scripts/environment-headers.test.mjs`, "environment headers > sends X-Robots-Tag:
  noindex on every path of a preview"; `scripts/smoke-environment.mjs`, "X-Robots-Tag is …,
  expected noindex", "meta robots is …, expected noindex" and "doesn't disallow all crawling", on
  the preview's alias and deployment URL; `src/lib/seo.test.tsx`, "SEO parity > renders Google Tag
  Manager only for production deployments".
