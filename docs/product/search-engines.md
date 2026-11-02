# Search engines

What search engines and link previews get from pitonne.jp: titles and descriptions, canonical
URLs, sharing tags, structured data, sitemaps, `robots.txt`, and each environment's indexing
signals. The language signals, `lang` and hreflang, are in [Languages](languages.md#search-engines).
How each is written, and what each audit reads, is in [`docs/agents/seo.md`](../agents/seo.md).
The build audits mirror Ahrefs Site Audit's checks
([#63](https://github.com/serpcompany/pitonne.jp/issues/63)). How a check is named is in
[How behavior is verified](index.md#how-behavior-is-verified).

## Titles and descriptions

**Titles.** A page's title is its own title followed by " | Pitonne"; the home page's is the
site's title. With the suffix, every title is 15 to 70 characters, and every meta description 110
to 160.

- Check: `scripts/audit-meta-lengths.mjs` (`pnpm audit:meta`, posts and services in both
  languages, drafts skipped), "title too long", "title too short", "description too long" and
  "description too short"; `scripts/audit-seo-build.mjs` (every built page), "title is … chars
  (want …)" and "meta description is … chars (want …)"; `src/lib/seo.test.tsx`, "SEO parity >
  exposes core page titles, descriptions, and canonical URLs".

**Descriptions.** A post's description is its meta description override, or else its excerpt. An
excerpt under 110 characters is extended with the post's own opening sentences, word for word and
in its language; when no whole sentence fits, the next one is cut at 160 characters with an
ellipsis. A service's description is its override, or else its short description, and a
category's is its description.

- Check: `src/lib/data/blog-meta-fallback.test.ts`, "fallbackMetaDescription > leaves a long
  enough excerpt alone", "extends a short excerpt with verbatim body sentences into the meta
  range", "separates English sentences with spaces" and "cuts an overlong next sentence at the
  limit instead of staying short"; `src/lib/data/blog-posts.test.ts`, "blog content model >
  publishes a short excerpt without a metaDescription instead of failing the build".

## URLs and sharing

**Canonical URLs.** Every page names itself as its canonical, on its environment's origin
([Environments](environments.md#the-three-environments)): the English home page as the bare origin,
`https://pitonne.jp`, and every other page with its trailing slash. A page has one canonical and
one `og:url`, both in `<head>`, and they match.

- Source: SERP's
  [URL Trailing Slash](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/url-trailing-slash.md)
  standard; [#91](https://github.com/serpcompany/pitonne.jp/issues/91) (the bare origin).
- Check: `src/lib/seo.test.tsx`, "SEO parity > writes the English homepage as the bare origin in
  its canonical, og:url and hreflang tags" and "exposes core page titles, descriptions, and
  canonical URLs"; `e2e/environment.spec.ts`, "answers each page with the ${environment} indexing
  signals and canonical"; `scripts/audit-seo-build.mjs`, "og:url … does not match canonical …",
  "tags (want 1)" and "tag outside <head>".

**Sharing.** Every page has Open Graph and Twitter card tags: the title, the description, an image
(a post's or service's own, or else the site's), the page's URL, and the type, `article` for a
post with its published date.

- Check: `scripts/audit-seo-build.mjs`, "missing Open Graph tags: …";
  `src/lib/site-origin.test.tsx`, "URLs a %s build writes > puts canonicals, og:url, hreflang and
  social images on its own host". The post's type and date: no automated check yet.

**Internal links.** Every link from one page of the site to another reaches a page that exists,
directly, without a redirect, and on the canonical host.

- Check: `scripts/audit-seo-build.mjs`, "broken internal link …", "internal link redirects: …"
  and "links to non-canonical URL … (use …)".

## Structured data

**Structured data.** Every page carries the clinic as a `MedicalBusiness`, with its address,
hours and languages, and the site as a `WebSite`. A service page adds a `Service`, a post a
`BlogPosting`, the FAQs a `FAQPage`, the videos index an `ItemList`, and a watch page a
`VideoObject` and its breadcrumbs as a `BreadcrumbList`. Every id and URL in it is on the page's
environment's origin.

- Check: `src/lib/structured-data.test.tsx`, "structured data parity > renders organization and
  website JSON-LD in the root layout", "writes the Japanese homepage URL with its trailing slash",
  "renders Service JSON-LD on service detail pages" and "renders BlogPosting JSON-LD on blog post
  pages"; `src/app/[locale]/videos/page.test.tsx`, "Pitonne video pages > generates VideoObject,
  ItemList, and breadcrumb schema"; `src/lib/site-origin.test.tsx`, "URLs a %s build writes >
  writes structured-data ids and URLs on its own host". The `FAQPage`: no automated check yet.

## Sitemaps and robots.txt

**Sitemaps.** `robots.txt` lists one sitemap, `/sitemap-index.xml`, which names six child
sitemaps at the root: `/sitemap-pages.xml`, `-services`, `-areas`, `-blog`, `-categories` and
`-videos`. Every indexable page is in exactly one of them, at its canonical URL, with its other
language beside it and both as `xhtml:link` alternates; drafts never are. The videos sitemap adds
each video's details for Google. `/sitemap.xml` serves the same XML as the index, and
`/videos-sitemap.xml` answers 301 to `/sitemap-videos.xml`. Sitemaps are served as XML, cached for
an hour, and styled for a browser by `/sitemap.xsl`.

- Source: SERP's
  [Sitemap Index Pattern](https://github.com/serpcompany/serp/blob/main/docs/engineering/websites/features/xml-sitemaps.md);
  [#80](https://github.com/serpcompany/pitonne.jp/issues/80).
- Check: `src/lib/sitemaps.test.ts`, "sitemap index > lists one root-level sitemap-<group>.xml per
  content group", "serves /sitemap.xml as the same XML as /sitemap-index.xml", "has a route, cache
  headers and no legacy duplicate for every child sitemap" and "serves every child sitemap as a
  well-formed URL set", and "sitemap URLs > lists every URL in exactly one child sitemap, within
  the per-file limit" and "writes the homepage as the bare origin and every other URL with a
  trailing slash"; `src/lib/seo.test.tsx`, "SEO parity > lists each page in the sitemap of its
  content group"; `src/app/[locale]/videos/page.test.tsx`, "Pitonne video pages > serves a Google
  video sitemap"; `scripts/audit-seo-build.mjs`, "is not listed in any sitemap", "listed in
  multiple sitemaps: …", "URL has no trailing slash: …", "lists URL that is not a page: …" and
  "does not match the page canonical"; `scripts/audit-out.mjs`, "missing out/…";
  `scripts/smoke-environment.mjs`, "expected 200 with a <sitemapindex>" for
  `https://pitonne.jp/sitemap-index.xml`. The styling: no automated check yet.

**Production's robots.txt.** It allows every crawler everywhere but `/keystatic/`, and lists
`https://pitonne.jp/sitemap-index.xml`. It is served as plain text, cached for five minutes.

- Check: `src/lib/site-origin.test.tsx`, "robots.txt > keeps production and previews as they were";
  `src/lib/seo.test.tsx`, "SEO parity > allows production crawling and blocks non-production
  crawling"; `e2e/environment.spec.ts`, "serves the ${environment} robots.txt";
  `scripts/audit-seo-build.mjs`, "must list only Sitemap: …"; `scripts/smoke-environment.mjs`,
  "disallows all crawling on production", "has no `Allow: /`" and "doesn't list".

## Indexing signals

**Each environment's signals.** Production's pages are indexable: no `noindex` in a header or a
meta tag. A pull request preview, or any build without an environment, sends
`X-Robots-Tag: noindex, nofollow` on every path and a `noindex, nofollow` meta tag on every page,
and its `robots.txt` disallows everything. Staging's pages are indexable for whoever has the
password, and everything it serves without it carries `noindex`
([The Staging gate](environments.md#the-staging-gate)). The 404 page carries `noindex` everywhere.

- Source: SERP's
  [Environment Configuration](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/environment-configuration.md)
  standard.
- Check: `e2e/environment.spec.ts`, "answers each page with the ${environment} indexing signals
  and canonical", for Production in CI, which runs the journeys on the production build, and for
  Staging or a preview only when run by hand on that build; `scripts/environment-headers.test.mjs`, "environment headers > sends
  X-Robots-Tag: noindex on every path of a preview" and "leaves the committed headers unchanged on
  %s, which is indexable"; `scripts/audit-out.mjs`, "out/_headers sends X-Robots-Tag: noindex but
  out/robots.txt allows crawling" and "out/robots.txt disallows crawling but out/_headers sends no
  X-Robots-Tag: noindex"; `scripts/smoke-environment.mjs`, "on production" (a `noindex` on
  Production), "X-Robots-Tag is …, expected noindex", "meta robots is …, expected noindex" and
  "doesn't disallow all crawling"; `tools/checks/deploy-workflows.test.ts`, "CI and deploy
  workflows > checks each environment's indexing signals before deploying and smoke-tests them
  after".
