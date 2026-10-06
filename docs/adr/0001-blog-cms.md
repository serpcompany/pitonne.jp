# ADR 0001: Blog CMS — Keystatic Cloud on the static site

- **Status:** Accepted
- **Date:** 2026-10-06
- **Tracking issue:** [serpcompany/pitonne.jp#64](https://github.com/serpcompany/pitonne.jp/issues/64)

## Context

Blog posts are markdown files in `content/blog/` (English) and `content/blog/ja/` (Japanese), validated by the zod schema in
`lib/data/blog-posts.ts` and built into a static export (`output: "export"`) deployed to Cloudflare Pages. Only developers can
publish today. The client needs up to three non-technical editors who can write, translate, and publish posts without a GitHub
account, while keeping the site static, cheap, and auditable.

## Decision

Use **[Keystatic Cloud](https://keystatic.com/docs/cloud)** (free tier) as a git-backed CMS for the blog only.

- **Architecture stays static.** Keystatic commits markdown to the repo; CI validates, auto-merges, and deploys. A post is live
  about 5–10 minutes after Publish (target 3–4 minutes with a content-only CI fast path).
- **Content model.** Two collections, `content/blog/*.md` and `content/blog/ja/*.md`, paired by identical filename/slug.
  A post may exist in one locale only; the missing locale has no page, no blog index or category entry, no hreflang alternate,
  and no sitemap entry. `draft: true` posts are excluded from every build (production, staging, and PR previews).
- **Validation lives in the zod schema** and is mirrored by the CMS field rules: excerpt 70–160 characters (it is also the
  default meta/OG/Twitter description), kebab-case slug matching the filename, `featureImageAlt` required when `featureImage` is
  set. `readingTime` is computed at build time (200 words/minute in English, 500 characters/minute in Japanese) and is no
  longer a CMS field; the frontmatter key remains as an optional override.
- **Version history and recovery** are git history. Restores are done by a developer (`git revert`); there is no self-serve
  restore UI in v1.
- **Scope v1:** blog only, human editors only. Services and legal pages can become Keystatic collections later.

## Options considered

|                            | Editors without GitHub      | SEO hints                     | Restore UI | MCP      | Cost  | Ops            |
| -------------------------- | --------------------------- | ----------------------------- | ---------- | -------- | ----- | -------------- |
| **Keystatic Cloud** ✅     | yes (3 free)                | length/regex validation only  | no (git)   | no       | $0    | low            |
| TinaCloud                  | yes (2 free)                | custom                        | no         | no       | $0    | low            |
| Decap + DecapBridge        | yes                         | no                            | no         | no       | $0    | low–med        |
| Sveltia                    | no (git account until v1.0) | counters                      | view-only  | no       | $0    | low            |
| Payload on Workers (D1/R2) | yes                         | official plugin               | yes        | official | ~$5/mo| high           |
| Sanity (free)              | yes                         | stale community plugin        | 3 days     | official | $0    | med + lock-in  |

### Research notes

- Keystatic detects the `main` branch ruleset (PR required) and prompts editors to create a branch
  ([Thinkmill/keystatic#1601](https://github.com/Thinkmill/keystatic/pull/1601)), but its "Create pull request" button links to
  GitHub, which editors cannot use. Publishing first used `cms/*` branches plus a GitHub Action that merged them, but
  naming branches and being left on deleted ones confused editors. **Update (2026-10-06):** the Keystatic Cloud GitHub
  app now bypasses the `main` ruleset, so saves commit straight to `main` and deploy; drafts use the `draft` field.
- Keystatic's admin UI must be served from the static export (stubbed `generateStaticParams` plus a `_redirects` SPA fallback)
  or, failing that, from a separate small Pages/Workers deploy. Phase 1 is a throwaway spike to prove this before committing.
- Images are committed to `public/images/content/blog/` with an upload cap (~500 KB–1 MB) because the site serves images
  unoptimized.

## Why Payload is deferred

Payload is the strongest option on features — official MCP and SEO plugins, a version-restore UI, and R2 media — but it changes
the architecture: it needs a running Workers app with D1 and R2, a paid Workers plan (~$5/month plus D1 operations), database
migrations, auth, and backups to operate. That is disproportionate for a blog with three editors when the static site,
git history, and CI already provide hosting, versioning, and validation for free.

Payload's main unique benefit for this project is AI agent access for the client (MCP) without GitHub. That is Phase 3 and is
not a v1 requirement. When it becomes one, the choice is between a small custom blog-only MCP Worker that commits through the
same validated commit-to-`main` path as the CMS, and migrating to Payload. Keeping content as plain markdown with a strict schema keeps both paths open.

## Consequences

- Editors publish without GitHub accounts; every change is a reviewed-by-CI git commit with full history.
- Single-locale posts are allowed, so the blog parity test only checks filename/slug pairing; services and legal pages remain
  strictly paired in both locales.
- Publishing latency is CI-bound (minutes, not seconds).
- No editor-facing restore or SEO preview tooling beyond field validation in v1.

## Phases

0. Content cleanup (this ADR): alt text backfill, relative internal links, computed reading time, `draft` flag, relaxed blog
   parity, schema tightened to the CMS rules.
1. Keystatic Cloud spike on a PR preview.
2. Build: Keystatic config, `cms/**` auto-merge workflow, CI fast path, editor and developer docs, invite editors.
3. Deferred: client AI agent access (custom MCP Worker vs. Payload migration).
