# AGENTS.md

Stage: ship

pitonne.jp is a live site with real visitors. Only the owner adds or changes the `Stage:` line. There is no
`Agents may merge` line, so agents never merge.

Project rules (i18n, content, blog/CMS, SEO) are in [CLAUDE.md](CLAUDE.md). This file covers how to work: commands,
verification and the git workflow, following the SERP standards
[Verification Cadence](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/verification-cadence.md)
and [Git Workflow](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/git-workflow.md).

## Setup

Node 24 and pnpm 10.14.0 (`packageManager` in `package.json`), then `pnpm install --frozen-lockfile`.

## Inner loop (while editing)

- `pnpm vitest related --run <files>`: the tests that import the files you changed.
- `pnpm vitest run <test-file>`: one test file.
- `pnpm typecheck` and `pnpm exec eslint <files>` (or `pnpm lint`).
- `pnpm test:parity` after dictionary or content changes.
- The audit for what you touched; none needs a build: `pnpm audit:strings` (hardcoded English),
  `pnpm audit:meta` (title/description lengths), `pnpm audit:content`, `pnpm audit:routes`.
- `pnpm dev` for the site; `pnpm cms` for Keystatic on local files at http://127.0.0.1:3000/keystatic.

Every `next dev` script (`dev`, `cms`, `cms:cloud`) rewrites `next-env.d.ts` to import `.next/dev/types/...`. Don't
commit that change. `pnpm build` writes the committed form back, so `pnpm check` restores it once it reaches the build
step; if `check` stops earlier, the file stays modified. Run `git checkout next-env.d.ts` to restore it.

## Finish gate

```sh
pnpm check
```

It runs lint → typecheck → test → audit:routes → audit:content → audit:strings → audit:meta →
`DEPLOY_ENV=production pnpm build` → audit:out (the export has the files Cloudflare Pages needs, every sitemap the
index lists, and no `out/en/`) → audit:seo, in about 30 seconds. This is a single package, so the push check is the same command.

Run it once per state: if the tree hasn't changed since the last green run, cite that run instead of repeating it.
CI (`.github/workflows/ci.yml`) runs the same steps one by one, plus `pnpm test:lighthouse`, and CI on the final
commit is the record. CI lists the steps itself rather than calling `pnpm check`, so keep the two in step by hand
when adding one.

## Evidence beyond the gate

Report evidence levels separately in the PR (local checks, CI, preview/deploy). What each change needs:

| Change | Evidence |
| --- | --- |
| Every change | `pnpm check` before pushing; CI on the final commit is the record |
| Visible UI | One local run with `pnpm dev` in both `/` and `/ja/`, with a screenshot |
| Redirects or headers (`public/_redirects`, `public/_headers`), trailing slashes, the `/keystatic/*` fallback | Before merge, a production-like preview: `DEPLOY_ENV=production pnpm build`, then `pnpm dlx wrangler@4.103.0 pages dev out` and `curl -I` the affected URLs (`pnpm start` does not apply `_redirects` or `_headers`). This is routing on a Ship site, so also `curl -I` the same URLs on https://pitonne.jp before the change and again after the Deploy run, and put both in the PR. |
| CMS (`keystatic.config.ts`, `lib/blog-rules.ts`, `patches/@keystatic__core*`, blog/category schemas) | A local run of the affected editor flow with `pnpm cms`; after the deploy, https://pitonne.jp/keystatic loads |
| Deploy config (`.github/workflows/*`, `wrangler.toml`, `next.config.mjs`, `scripts/draft-only-change.mjs`, `DEPLOY_ENV` handling, robots or sitemaps) | The production-like preview above, then wait for the Deploy run after merge and smoke-test https://pitonne.jp (pages return 200, `robots.txt` allows crawling and lists the sitemap) |

PR previews don't deploy right now: the `preview` job in `ci.yml` only runs for PRs into `staging`, which doesn't
exist until #78. Use the local production-like preview instead.

## Git workflow

The base branch is `main`. Staging was removed on 2026-10-06 and comes back in #78, which makes `staging` the base
branch again; until then `docs/gitflow.md` describes a flow that isn't active.

1. Every change starts from a GitHub issue.
2. Branch from `origin/main` as `issue-<n>-<slug>`, in its own worktree
   (`git worktree add -b issue-<n>-<slug> ../pitonne.jp-worktrees/issue-<n>-<slug> origin/main`), not in the owner's
   checkout.
3. Open a PR into `main` with a Conventional Commit title. The body starts with `Closes #<n>`, says what changed and
   what was left out, and reports evidence levels separately.
4. Once CI is green, a fresh agent reviews the PR. Reply to every finding as fixed (with the commit) or declined
   (with the reason). Only blocking findings start another round.
5. Record the review outcome in the PR, for example "Review: 1 round, clean".
6. The owner merges (squash), one PR at a time, each up to date with `main`.

Keystatic Cloud commits CMS saves straight to `main`, bypassing the ruleset, so branches fall behind often. Bring a
branch up to date with `git fetch origin && git merge origin/main` (don't rebase a pushed branch). Check the latest `main`
runs (`gh run list --branch main --limit 5`) before starting work and again when handing back. If CI or Deploy failed,
fixing it comes first.

## Rules

- Tests check rules, not content snapshots. Editors add and change posts at any time, so don't assert post counts,
  that every post has an image or tags, or the text of a post.
- Trailing-slash exceptions to the [URL trailing-slash standard](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/url-trailing-slash.md):
  the slashed form of a path excluded in `public/_routes.json` (`/images/x.jpg/`, `/favicon.ico/`) never reaches the
  Function and returns 404, and `/keystatic/*` is left as requested (the Keystatic router reads a slash as a segment).
- Don't rewrite reviewed Japanese copy (content, dictionaries, frontmatter). Add to it instead, and flag
  AI-written Japanese in the PR for native review.
