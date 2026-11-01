# Code layout and conventions

Where code lives, the conventions every change follows, and the checks that hold them. How the
parts fit together is in [`ARCHITECTURE.md`](../../ARCHITECTURE.md); the words used for the
site's parts are in [`CONTEXT.md`](../../CONTEXT.md).

## Where code lives

| Path | Holds |
| --- | --- |
| `src/app/[locale]/` | Every page, implemented once for both locales; Japanese pages are generated from it |
| `src/app/(en)/` | Thin English wrappers that render the `[locale]` page at the bare English URL |
| `src/app/` (other) | The 404 page, robots, the sitemap route handlers and the Keystatic routes |
| `src/components/` | Site components, grouped by area (`blog/`, `services/`, `areas/`, ...) |
| `src/components/shared/` | Components several areas use; each takes `locale` as a prop |
| `src/components/ui/` | Stock shadcn components (only `dialog.tsx` today) |
| `src/lib/` | Data, metadata, sitemaps, structured data and the host rules: no UI |
| `src/lib/data/` | Loaders for `content/` and the site's own data (areas, videos, business info) |
| `src/lib/i18n/` | The locale list, the dictionaries and their loader |
| `src/test/` | Helpers the tests share |
| `functions/_middleware.ts` | The Cloudflare Pages Function, which calls `src/lib/canonical-host.ts` |
| `scripts/` | Build, audit, deploy and smoke-test scripts, each with its tests beside it |
| `tools/checks/` | Tests that hold the workflows and the Lighthouse setup to their rules |
| `content/`, `public/`, `keystatic.config.ts` | Content, static files and the CMS config, at the root ([ADR 0004](../adr/0004-repository-layout.md)) |

`@/*` resolves to `src/` (`tsconfig.json`). Wrangler bundles `src/lib/canonical-host.ts` into the
Function without that alias, so the file imports nothing.

## Layers

Imports point one way: `src/app` imports `src/components` and `src/lib`, `src/components`
imports `src/lib`, and `src/lib` imports neither. Biome's `noRestrictedImports` holds this in
`biome.json`, with a message that says where the code belongs; tests are exempt. The dependency
check reads the import graph from the entry points `verify.json` names (the routes, the Function
and the scripts).

## Conventions

- **Internal paths** come from `canonicalRoutes` in `src/lib/data/routes.ts`, and every
  `<Link href>` goes through `localizedRoute(path, locale)`, which adds `/ja` for Japanese.
- **Text** comes from `getDictionary(locale)`, and business data (address, hours, phone) from
  `getBusinessInfo(locale)` in `src/lib/data/site.ts`, never from `businessInfo` directly. The
  rules for strings and content are in [`content.md`](content.md).
- **Components take `locale` as a prop** and call `getDictionary(locale)` themselves. A client
  component never imports the dictionaries; its server parent passes the strings it needs
  ([`docs/i18n.md`](../i18n.md#ui-strings)).
- **Metadata** goes through `localizedPageMetadata()` in `src/lib/seo.ts`, which adds the
  canonical URL, hreflang and the Open Graph and Twitter tags ([`seo.md`](seo.md)).
- **Dates** are formatted in UTC (`src/lib/post-date.ts`), so the build machine's timezone never
  changes a page.
- **A new page** follows [Adding a New Page Route](../i18n.md#adding-a-new-page-route).

## UI kit

The site keeps shadcn's `new-york` style on Radix (`components.json`), where SERP's
[shadcn first](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/web-stack/shadcn-first.md#rules)
standard sets `base-nova` on Base UI. It was kept on 2026-10-31 because moving would change the UI.
Don't add `base-nova` components beside it; a move to `base-nova` is one change of its own.

## Tests

- Vitest runs two projects (`vitest.config.ts`): `*.dom.test.tsx` files in happy-dom, with
  `src/test/setup.ts`, and every other test in Node. Tests sit beside the module they test.
- **Tests check rules, not content.** Editors add and change posts at any time, so a test never
  asserts a post count, that every post has an image or tags, or a post's text.
- A test has 30 seconds (`testTimeout`), so a slow test fails rather than hangs.

## The checks

`pnpm verify` runs SERP's shared checks from `@serpcompany/verify`, configured by
[`verify.json`](../../verify.json); SERP's
[Verification](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/verification/README.md)
standard defines each one. This repository keeps no exception lists or baseline: every check
passes on every file.

| Check | Holds |
| --- | --- |
| `comments` | No comments in code, workflows or configs. Why code is built a certain way goes in these docs |
| `sizes` | A code file has at most 500 lines; split one that outgrows it by responsibility |
| `secrets` | No credential in any file |
| `duplicates` | No block repeated in two places; share it as a named function or test helper |
| `deadcode` | No unused file, export or dependency (Knip, with entries in `knip.json`) |
| `dependencies` | No import cycles, no test code or devDependency in production code, and no module that no entry point reaches |
| `docs` | Every path, script, link and anchor a doc names exists, every doc is reachable from `AGENTS.md`, and each fits its size budget |
| `linters` | ShellCheck, actionlint and Ruff at pinned versions; only actionlint has files to read here, the workflows |
| `layers`, `waits` | Swift layers and UI-test waits, which this repository has nothing for |

`verify.json` also lists the files a tool writes (`patches/*.patch`, and the blog posts and
categories Keystatic saves), which the checks leave as written. A rule is never switched off in
the code it flags; one turned off in a tool's config is listed in
[`exceptions.md`](exceptions.md), with its reason.

## Formatting commits in blame

[`.git-blame-ignore-revs`](../../.git-blame-ignore-revs) lists the commits that only reformatted
or moved code, one full hash per line, so blame shows who wrote each line rather than who
reformatted it. Today it holds `5bff871` ("style: format with Biome"). GitHub's blame view reads
the file by itself; locally, run `git config blame.ignoreRevsFile .git-blame-ignore-revs` once per
clone. Add a commit only when its diff is nothing but formatting or moves; a commit that also
deletes comments or changes code doesn't qualify.

## SERP's standards

What every SERP repository shares isn't restated here: handing work to subagents
([Token Budget](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/agent-harness/token-budget.md)),
the review prompt
([Review Prompt](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/agent-harness/review-prompt.md)),
and cleaning up after merged work
([Housekeeping](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/housekeeping.md)).
Where this repository differs from a standard, [`AGENTS.md`](../../AGENTS.md) lists it, and that
list wins.
