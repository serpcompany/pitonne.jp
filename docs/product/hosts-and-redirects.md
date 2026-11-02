# Hosts and redirects

Which host answers for Production, and what a visitor or crawler gets for a URL that isn't in its
canonical form: another host, a missing or extra trailing slash, `/en/`, or a moved URL. Staging's
hosts are in [Environments](environments.md#the-staging-gate). How the Pages Function and
`public/_redirects` do it is in [`docs/agents/hosts.md`](../agents/hosts.md). How a check is named
is in [How behavior is verified](index.md#how-behavior-is-verified).

## The canonical host

**Production's host.** Production answers on https://pitonne.jp. `www.pitonne.jp` redirects there
by a Cloudflare rule. Every other host that serves Production, `pitonne-jp.pages.dev`, its
deployment URLs and its branch aliases, answers one 308 to the same path and query on
https://pitonne.jp, with the path already in its canonical form. A pull request preview,
`pr-<n>.pitonne-jp.pages.dev`, is served as it is.

- Source: [#79](https://github.com/serpcompany/pitonne.jp/issues/79).
- Check: `src/lib/canonical-host.test.ts`, "canonical host > redirects %s" and "serves %s as is",
  and "canonical host redirect > keeps the path and query string", "answers with a single 308" and
  "redirects %s requests the same way"; smoke (`scripts/smoke-canonical-host.mjs`),
  `https://pitonne-jp.pages.dev/contact: 308 -> https://pitonne.jp/contact/` and
  `https://pitonne-jp.pages.dev/ja/services/?smoke=<sha>: 308 -> https://pitonne.jp/ja/services/?smoke=<sha>`,
  the same from the new deployment's URL, and
  `https://www.pitonne.jp/ja/services/?smoke=<sha>: 308 -> https://pitonne.jp/ja/services/?smoke=<sha>`,
  where a Cloudflare challenge is only a warning.

**One hop.** A request that needs both the host redirect and a moved-URL redirect gets one 308,
straight to the final URL: `https://pitonne-jp.pages.dev/en/` lands on https://pitonne.jp. A
temporary redirect is never made permanent.

- Check: `src/lib/canonical-host.test.ts`, "canonical host redirect > folds a _redirects rule into
  the same hop" and "doesn't make a temporary %i permanent", and "slashed file redirect > folds a
  permanent _redirects rule into the same hop: %s -> %s"; smoke
  (`scripts/smoke-canonical-host.mjs`), `https://pitonne-jp.pages.dev/en/: 308 -> https://pitonne.jp/`.

## Trailing slashes

**Pages end in a slash, files never do.** A page's URL ends in `/`: `/about` answers one 308 to
`/about/`, keeping the query. The English home page is the bare origin. A file's URL has no
slash: `/robots.txt/` and `/sitemap-index.xml/` answer one 308 to the file, on the request's own
host.

- Source: SERP's
  [URL Trailing Slash](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/url-trailing-slash.md)
  standard; [#92](https://github.com/serpcompany/pitonne.jp/issues/92).
- Check: `src/lib/canonical-host.test.ts`, "canonical path > %s -> %s", "slashed file redirect >
  %s -> %s" and "Pages middleware > redirects slashed file URLs on hosts it serves as is";
  `e2e/environment.spec.ts`, "redirects /about to /about/ with one 308", "redirects /ja/contact to
  /ja/contact/ with one 308" and "redirects /robots.txt/ to /robots.txt with one 308"; smoke
  (`scripts/smoke-canonical-host.mjs`),
  `https://pitonne.jp/sitemap-index.xml/?smoke=<sha>: 308 -> https://pitonne.jp/sitemap-index.xml?smoke=<sha>`
  and `https://pitonne.jp/robots.txt/: 308 -> https://pitonne.jp/robots.txt`, where a Cloudflare
  challenge is only a warning.

**Two exceptions.** On Production and previews, a static file kept off the Pages Function, under
`/images/`, `/_next/` or `/screenshots/`, or an icon or `/sitemap.xsl`, answers 404 with a
trailing slash (`/images/x.jpg/`); on Staging it gets the 308 once the password is given. URLs
under `/keystatic/` are left as they are requested. Both are among this site's
[differences from SERP's standards](../agents/deviations.md#urls-and-languages), and
[`docs/agents/hosts.md`](../agents/hosts.md#exceptions-to-the-trailing-slash-standard) says why.

- Check: `src/lib/canonical-host.test.ts`, "_routes.json > excludes only static files, never a page
  or the files the smoke test checks" and "keeps build assets and images off the Function";
  `scripts/audit-out.mjs`, "is a page under a path _routes.json keeps off the Function".

## The `/en/` prefix

**`/en/` redirects to the bare path.** `/en` answers 301 to `/`, and `/en/<path>` 301 to
`/<path>`.

- Source: SERP's Localization standard,
  [URLs](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/web-stack/localization.md#urls).
- Check: `e2e/environment.spec.ts`, "redirects /en/ to / with one 301" and "redirects
  /en/services/ to /services/ with one 301"; smoke (`scripts/smoke-canonical-host.mjs`),
  `https://pitonne-jp.pages.dev/en/ (with x-pitonne-smoke-test): 301 -> /`.

## Moved URLs

**Moved URLs.** `/services/medications/`, with or without its slash and under `/ja/` too, answers
301 to `/services/medication/`. `/videos-sitemap.xml` answers 301 to `/sitemap-videos.xml`. The old
URLs of some blog feature images answer 301 to the image in its post's folder. Any other URL with
no page answers 404, including the retired legal URLs ([Pages](pages.md#legal)).

- Check: `src/lib/data/routes.test.ts`, "routes > redirects the old medications URL to the
  medication service"; `e2e/environment.spec.ts`, "redirects /services/medications/ to
  /services/medication/ with one 301"; `src/lib/sitemaps.test.ts`, "sitemap index > has a route,
  cache headers and no legacy duplicate for every child sitemap", for the videos sitemap; and
  `src/lib/data/routes.test.ts`, "routes > sends each old blog image URL to an image that exists,
  in one 301".

## Behind the Function

**The CMS app.** Every URL under `/keystatic/` serves the CMS app, which reads the path itself, on
every host ([The CMS](cms.md)). `robots.txt` keeps crawlers out of it.

- Check: smoke (`scripts/smoke-canonical-host.mjs`),
  `https://pitonne-jp.pages.dev/keystatic/branch/main (with x-pitonne-smoke-test): 200 [text/html]`;
  `src/lib/site-origin.test.tsx`, "robots.txt > keeps production and previews as they were".

**Files and missing pages.** With the Pages Function in front of them, the static files answer as
they would without it: a sitemap as XML, a missing page with 404, a page with 200.

- Check: `src/lib/canonical-host.test.ts`, "Pages middleware > passes the asset server's response
  through unchanged"; smoke (`scripts/smoke-canonical-host.mjs`),
  `https://pitonne-jp.pages.dev/sitemap.xml (with x-pitonne-smoke-test): 200 [application/xml]`,
  `https://pitonne-jp.pages.dev/ja/ (with x-pitonne-smoke-test): 200 [text/html]` and
  `https://pitonne-jp.pages.dev/no-such-page-smoke-test/ (with x-pitonne-smoke-test): 404`.
