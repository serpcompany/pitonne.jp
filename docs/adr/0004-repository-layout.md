# ADR 0004: Code in `src/`, content and the CMS config at the root

- **Status:** Accepted
- **Date:** 2026-10-31

## Context

SERP's [repository layout](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/web-stack/repository-layout.md)
standard puts a website in `apps/web/`, with its code in `apps/web/src/`, even when it is the
repository's only surface. Before the 2026-10 refactor, pitonne.jp kept `app/`, `components/` and
`lib/` at the root.

The CMS writes into the repository. `keystatic.config.ts` names `content/blog/*`,
`content/blog/ja/*` and `content/blog-categories/*` as its collections, and folders under
`public/images/content/blog/` for the feature images, and Keystatic Cloud commits each save
straight to `main` ([CMS](../cms.md#for-developers)). `scripts/draft-only-change.mjs` tells a
content save from code by those same paths, so a save deploys without waiting for the tests.

## Decision

Only the code moves into `src/`: `src/app`, `src/components`, `src/lib` and `src/test`, with
`@/*` resolving to `src/` (`tsconfig.json`). `content/`, `public/` and `keystatic.config.ts` stay
at the root, and so do `functions/`, `scripts/` and `tools/`. There is no `apps/web/`.

## Why

- **Moving `content/` and `public/` would move every path the CMS writes to.** Keystatic's
  collections, the image folders and the content-save rule in CI would all have to change in the
  one commit that reaches Production, since editors save straight to `main` and their saves never
  pass through Staging.
- **`src/` gives the code the layout SERP's tools and docs expect inside a web app:** the `@/*`
  alias, `src/app`, `src/components` and `src/lib`, and Biome's import layers between them.
- **Cloudflare Pages reads `functions/` from the directory `wrangler pages deploy` runs in,** the
  repository root.

## Consequences

- Paths in docs and scripts start at the root: `src/...` for code, and `content/...` and
  `public/...` for what the CMS writes and Pages serves.
- `verify.json` has one TypeScript part, whose folder is the root.
- Moving to `apps/web/` later is a change of its own, made together with the CMS config, the
  content and image paths, and CI's content-save rule.

## Revisit when

A second surface, such as an app or another site, joins the repository.
