# SEO and the audits

How the site writes its URLs, metadata, structured data and sitemaps, and the audits that hold
them. The audits mirror Ahrefs Site Audit's checks, and the ranges they share are in
`src/lib/seo-limits.json`. The signals each locale sends (`lang`, hreflang, `og:locale`) are
listed in [`docs/i18n.md`](../i18n.md#seo-signals).

## URLs

- **One canonical form per URL,** as SERP's
  [URL Trailing Slash](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/url-trailing-slash.md)
  standard sets: the English homepage is the bare origin (`https://pitonne.jp`, no slash), and
  every other page ends in `/`. `canonicalUrl()` in `src/lib/seo.ts` and the sitemap URLs in
  `src/lib/sitemaps.ts` write them that way, and so does the business's `url` in the JSON-LD.
- `next.config.mjs` sets `trailingSlash: true`, so the export writes each page as
  `<path>/index.html`. The Pages Function redirects the other forms
  ([`hosts.md`](hosts.md)).
- URLs are written on the build's own origin, `siteOrigin()`
  ([`environments.md`](environments.md)): Staging's canonicals, hreflang, `og:url`, JSON-LD ids
  and sitemaps name https://staging.pitonne.jp.

## Metadata

- **Every page builds its metadata with `localizedPageMetadata()`** in `src/lib/seo.ts`: the
  title and description, the canonical URL, the hreflang alternates, and the full Open Graph and
  Twitter tags. Next.js replaces the layout's `openGraph` and `twitter` when a page sets its own
  rather than merging them, so every page sets the whole set.
- **hreflang lists only the locales a page exists in,** plus `x-default` (English, or the page's
  only locale): `localizedHreflangAlternates()` takes `availableLocales` for a post or category
  published in one language.
- **The homepage writes its own tags.** With `trailingSlash` on, Next's metadata API turns
  `https://pitonne.jp` into `https://pitonne.jp/`. So the `[locale]` layout sets no `alternates`
  or `openGraph.url`, and the homepage renders its canonical, `og:url` and hreflang links through
  `HomepageHeadTags` (`src/components/shared/homepage-head-tags.tsx`), which React moves into
  `<head>`.
- Title and description text comes from the dictionary or locale-aware data, never hardcoded
  English ([`content.md`](content.md)). A blog post or service that needs different search text
  sets `metaTitle` or `metaDescription` rather than changing its visible title or excerpt.
- Non-indexable builds add a `noindex, nofollow` robots tag through `deploymentRobots()`.

## Structured data

- JSON-LD is built in `src/lib/structured-data.ts` and typed with `schema-dts`
  (`WithContext<...>`), so `pnpm typecheck` rejects a property schema.org doesn't define for the
  type. `JsonLd` (`src/components/shared/json-ld.tsx`) writes it into a `script` element with
  `<` escaped as `<`.
- The `MedicalBusiness` lists English and Japanese as `knowsLanguage`. It never carries
  `inLanguage` or `availableLanguage`, which aren't valid there and which Ahrefs reports as errors
  (`src/lib/structured-data.test.tsx`). `WebSite` and `BlogPosting` carry `inLanguage`.
- A post and its translation point at each other: the Japanese `BlogPosting` names the English one
  as `translationOfWork`, and the English one names the Japanese as `workTranslation`.
- The video breadcrumbs follow the page's locale, as the visible breadcrumbs on `/watch/` and
  `/ja/watch/` do.

## Sitemaps

`src/lib/sitemaps.ts` follows SERP's sitemap index pattern.

- `/sitemap-index.xml` is the entry point, and `robots.txt` lists only it. It names one
  root-level child per content group, in the order of `sitemapGroups`: `/sitemap-pages.xml`,
  `-services`, `-areas`, `-blog`, `-categories` and `-videos`, each served by
  `src/app/sitemap-<group>.xml/route.ts`.
- `/sitemap.xml` serves the same XML as the index, for clients that still ask for it, and
  `/videos-sitemap.xml` answers 301 to `/sitemap-videos.xml` (`public/_redirects`).
- A URL belongs to the first group that lists it, so each is in exactly one child. Each lists
  its published locales as `xhtml:link` alternates, and both locales of a page sit in the same
  child. A child holds at most 50,000 URLs (`MAX_SITEMAP_URLS`); past that, the group needs a
  second file listed in the index.
- The blog and categories groups come from the CMS and may be empty, which is a valid URL set;
  `src/lib/sitemaps.test.ts` depends on no particular post.
- Under `next dev`, `sitemapOrigin()` writes local URLs, so the local sitemaps link to local pages.
- **A new kind of route** goes into an existing group, or into a new group: add it to
  `sitemapGroups`, add its route file, and give it the sitemap headers in `public/_headers`.

## The audits

| Command | When | What fails it |
| --- | --- | --- |
| `pnpm audit:meta` | Any time; no build | A blog post or service (both languages, drafts skipped) whose rendered `<title>` is outside 15–70 characters with " \| Pitonne", or whose meta description is outside 110–160. A post's short excerpt counts at its extended length (`fallbackMetaDescription`) |
| `pnpm audit:out` | After `pnpm build` | A missing file Pages needs (`index.html`, `ja/index.html`, `404.html`, `robots.txt`, `_headers`, `_redirects`, `_routes.json`, the sitemap index, `sitemap.xml`, each child sitemap); an `out/en/` folder; a page under a path `_routes.json` keeps off the Function; `robots.txt` and `_headers` disagreeing about indexing; a Staging build whose `_routes.json` doesn't send every path through the gate; a 404 page without `lang="en"`, one `noindex` robots tag and a link home |
| `pnpm audit:seo` | After `pnpm build`, with the build's `DEPLOY_ENV` exported | Below |

`pnpm audit:seo` (`scripts/audit-seo-build.mjs`) reads every page in `out/` but `_next/` and the
Keystatic app, against the origin of the build's environment. It fails on:

- a title outside 15–70 characters or a meta description outside 110–160;
- a page without exactly one `<h1>`;
- missing Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`), an
  `og:url` other than the canonical URL, or more than one canonical or `og:url` tag, or one
  outside `<head>`;
- an internal link that doesn't reach a page, or reaches it only through a redirect;
- an image over 5 MB;
- a break in the sitemap index pattern: `robots.txt` listing anything but `/sitemap-index.xml`, an
  index that points at another index, an indexable page in no child sitemap or in more than one,
  or a sitemap URL or hreflang alternate that isn't a page, isn't that page's canonical URL, or
  is `noindex`. The homepage must be listed as the bare origin and every other URL with its slash.

A non-indexable build disallows everything and noindexes every page, so the `noindex` and "in a
sitemap" checks apply only to indexable builds. Lighthouse CI, which runs only in CI, is in
[`ci.md`](ci.md#ciyml).
