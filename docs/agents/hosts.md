# Hosts, redirects and the Pages Function

Which hosts serve the site, and what the Pages Function does before Cloudflare Pages serves a
file. The Function is `functions/_middleware.ts`, which hands every request to `handleRequest` in
`src/lib/canonical-host.ts`. The Staging password gate in that same function is in
[`environments.md`](environments.md#the-staging-gate).

## Hosts

| Host | Serves |
| --- | --- |
| https://pitonne.jp | Production, the canonical host |
| `www.pitonne.jp` | A redirect to the apex, by a Cloudflare zone redirect rule; the Function treats it as non-canonical too |
| `pitonne-jp.pages.dev`, its deployment URLs (`<hash>.pitonne-jp.pages.dev`) and branch aliases | One 308 to the same path and query on https://pitonne.jp |
| `pr-<n>.pitonne-jp.pages.dev` | A pull request's preview, served as is |
| https://staging.pitonne.jp | Staging: a custom domain of the `pitonne-jp` Pages project on the `staging` branch alias, behind the password |
| `staging.pitonne-jp.pages.dev` and Staging's deployment URLs | One 308 to the same path on https://staging.pitonne.jp |

A request with the smoke-test header (`x-pitonne-smoke-test`) is served as is on every host, so
CI can check a deployment through its own pages.dev host. Search engines never send it.

## The host redirect

- A non-canonical host gets **one** 308 to the canonical host, with the path already in its
  canonical slash form (below) and the query kept. The 308 carries
  `Cache-Control: public, max-age=86400`: deployment and preview hosts change often, so it is
  cached for a day, not forever.
- **A `_redirects` rule is folded into the same hop.** The Function asks the static asset server
  where it would redirect the URL. When that is a permanent redirect (301 or 308) on the same
  host, the 308 goes straight to the final URL, so `pitonne-jp.pages.dev/en/` lands on
  `https://pitonne.jp/` in one hop. A temporary redirect, or one to another host, is never
  folded, and if the asset server fails the plain redirect still goes out. `public/_redirects`
  stays the only list of legacy URLs.
- The asset server is asked with a `GET` that has no body and `redirect: "manual"`. A new
  `Request` follows redirects by default, and the asset server then answers with the target's
  content instead of the redirect, as seen on Pages and in `wrangler pages dev`.

## Trailing slashes

`canonicalPath` puts a path into the form SERP's
[URL Trailing Slash](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/url-trailing-slash.md)
standard sets:

- A last segment that ends in a known file extension (`FILE_EXTENSIONS`) is a file and never
  takes a slash.
- Every other segment without a dot is a page and always ends in one.
- A dotted segment that isn't a known file is left as requested. No page's slug has a dot.
- `KEEP_PATH` paths are never given or stripped a slash: paths starting with `_` (`/_next/`),
  `/api`, `/.well-known/`, and `/keystatic`, whose router reads a trailing slash as an extra
  segment. Pages' own redirects still apply there, folded into the host redirect.

On the hosts served as is, a file URL with a trailing slash gets one 308 to the file, query kept
(`/sitemap-pages.xml/` to `/sitemap-pages.xml`). Pages' asset server answers 404 for a file with
a slash, and `_redirects` can't match "any path ending in `.xml/`", so the Function does it. The
`Location` is absolute on the request's own origin, so a path such as `//evil.com/x.js/` can never
become a protocol-relative URL, and a redirect never points back at the URL that was asked for.

## `_routes.json`

`public/_routes.json` keeps static files off the Function (`/_next/*`, `/images/*`,
`/screenshots/*`, the icons and `/sitemap.xsl`), so they cost no Function requests. Cloudflare
allows 100 include and exclude rules together, which `src/lib/canonical-host.test.ts` checks, and
`pnpm audit:out` fails on a page under an excluded path, since it would answer 200 on pages.dev.
`wrangler pages deploy out` bundles `functions/` from the repository root.

## Exceptions to the trailing-slash standard

- **On Production and previews, the slashed form of an excluded path returns 404**
  (`/images/x.jpg/`, `/favicon.ico/`): Pages matches an excluded path with a trailing slash too,
  so the request never reaches the Function. Nothing links to those URLs, and moving every image
  request onto the Function isn't worth it. Staging sends every path through the Function, so
  there it gets the 308 once the password is given.
- **`/keystatic/*` is left as requested,** because the Keystatic router reads a slash as a
  segment.

## Checks

What a visitor gets from each rule, and the test or smoke check that holds it, is in
[Hosts and redirects](../product/hosts-and-redirects.md). How the smoke tests run after each
deploy is in [`ci-deploys.md`](ci-deploys.md#smoke-tests).
