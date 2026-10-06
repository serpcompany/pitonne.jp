# ADR 0002: Payload CMS on Cloudflare D1: no-go for now

- **Status:** Accepted (no-go)
- **Date:** 2026-10-07
- **Tracking issue:** [serpcompany/pitonne.jp#82](https://github.com/serpcompany/pitonne.jp/issues/82)
- **Evidence:** [spike report on #81](https://github.com/serpcompany/pitonne.jp/issues/81#issuecomment-6018528486)

## Context

Moving the blog from Keystatic and markdown to Payload CMS on Cloudflare Workers, D1 and R2 (epic #75) would give editors:

- instant publishing, with no rebuild per save
- English and Japanese in one document
- drafts, live preview and version restore

The throwaway spike in #81 deployed the official `with-cloudflare-d1` template. It ran Payload 3.90.2, `@payloadcms/db-d1-sqlite` 3.90.2 and `@opennextjs/cloudflare` 1.20.1, and it tested the go criteria from #82.

## Decision

**No-go.** The blog stays on Keystatic Cloud with markdown in git ([ADR 0001](0001-blog-cms.md)). The site keeps no database. Sub-issues #83–#87 are closed as not planned.

## Why

**Saves are not atomic on D1. This is the blocker.**

- In the spike, a failed English-only update kept the title change and deleted every FAQ array row for that post, in both locales (upstream [payloadcms/payload#15219](https://github.com/payloadcms/payload/issues/15219)).
- Reading the 3.90.2 source shows the cause is built into the adapter, not a fluke:
  - `@payloadcms/db-d1-sqlite` uses no transaction unless `transactionOptions` is set (`dist/index.js:83`).
  - Setting it doesn't help. drizzle's D1 driver sends `BEGIN`/`COMMIT` as separate D1 calls (`drizzle-orm/d1/session.js`), which doesn't make a save atomic on D1.
  - `@payloadcms/drizzle` never calls D1's atomic `batch()`.
  - `upsertRow` writes each save as a sequence of separate statements: update the main row, then for each locale, relationship and array, delete the old rows and insert the new ones. Any failure midway leaves a half-applied save.
- Fixing this locally means forking Payload's core write path so each save runs as one `db.batch()`. We would carry that fork on every upgrade, which is too much maintenance for a client site that is edited daily.

**Other findings**

| Finding | Status in spike | Blocking? |
| --- | --- | --- |
| First admin user can't be created ([#18274](https://github.com/payloadcms/payload/issues/18274)): Workers cap PBKDF2 at 100k iterations | Reproduced; a local patch works but weakens hashing | Yes, until fixed upstream |
| Deletes silently do nothing ([#15070](https://github.com/payloadcms/payload/issues/15070)) | Not reproduced (28/28 deletes worked); root cause never found upstream | No |
| D1 100-bound-parameter limit ([#17493](https://github.com/payloadcms/payload/issues/17493), [#14766](https://github.com/payloadcms/payload/issues/14766)) | Reproduced: `in` filters over ~98 values and bulk publish of 150 posts fail | Manageable at our size |
| Next.js images ([#15502](https://github.com/payloadcms/payload/issues/15502)) | Reproduced: `/_next/image` 404s | Workaround needed |
| Bundle and latency | 16.8 MiB (3.83 MiB gzip, over the Free plan's 3 MiB); cold TTFB 1.2–1.5 s, warm median ~0.25 s | Needs Workers Paid |

**Migrations are solvable and were not the reason for no-go.**

- Option A worked end to end: `push: false` → `payload generate:db-schema` → `drizzle-kit generate` → `wrangler d1 migrations apply`, recorded in `d1_migrations`.
- A drift check proved that the config, the generated schema, the migration files and the live D1 database all matched.
- One hazard was found: when drizzle-kit rebuilds a table, D1 cascade-deletes the child rows. That is a migration-discipline problem with a known answer:
  - review every generated SQL file;
  - hand-write table rebuilds so they preserve child rows;
  - take a D1 Time Travel restore point before each migration;
  - compare row counts in a Staging rehearsal.
- If this is revisited, use option A with that checklist.

## Revisit when

All of these hold:

1. Payload's D1 adapter makes document writes atomic, for example via `batch()`, and #15219 is closed with a release.
2. #18274 is fixed upstream, so admin creation works without weakening hashing.
3. Ideally, the D1 adapter is no longer labelled beta in Payload's docs.

Re-running the #81 reproduction steps against the new release is enough to re-decide.

## Consequences

- Editor convenience problems with Keystatic get solved inside Keystatic and CI instead, for example a visible "publishing / live" status and a faster content-only deploy.
- Standards work in epic #75 (Staging #78, #91–#93) continues independently of this decision.
