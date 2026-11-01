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
- `pnpm typecheck` and `pnpm exec biome check <files>` (or `pnpm lint`; `pnpm format` writes formatting).
- `pnpm audit:meta` (title/description lengths) for what you touched; it needs no build. Hardcoded strings
  (`src/lib/i18n/hardcoded-strings.test.ts`), route coverage (`src/lib/data/routes.test.ts`) and business data
  (`src/lib/data/site.test.ts`) are tests; `pnpm test` runs them.
- `pnpm dev` for the site; `pnpm cms` for Keystatic on local files at http://127.0.0.1:3000/keystatic.

## Finish gate

```sh
pnpm check
```

It runs lint → typecheck → test → audit:meta →
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
| Redirects or headers (`public/_redirects`, `public/_headers`), trailing slashes, the `/keystatic/*` fallback | Before merge, a production-like preview: `DEPLOY_ENV=production pnpm build`, then `pnpm dlx wrangler@4.103.0 pages dev out` and `curl -I` the affected URLs (`pnpm start` does not apply `_redirects` or `_headers`). This is routing on a Ship site, so also `curl -I` the same URLs on https://pitonne.jp before the change and again after the Production deploy, and put both in the PR. |
| CMS (`keystatic.config.ts`, `src/lib/blog-rules.ts`, `patches/@keystatic__core*`, blog/category schemas) | A local run of the affected editor flow with `pnpm cms`; after the deploy, https://pitonne.jp/keystatic loads |
| Deploy config (`.github/workflows/*`, `wrangler.toml`, `next.config.mjs`, `scripts/draft-only-change.mjs`, `scripts/environment-headers.mjs`, the smoke scripts, `DEPLOY_ENV` handling, robots or sitemaps) | The production-like preview above and the PR preview; for the Staging gate, also `DEPLOY_ENV=staging pnpm build` served with `--binding CF_PAGES_BRANCH=staging --binding STAGING_PASSWORD=stagingpassword`; after merge, the Staging deploy and its smoke test (https://staging.pitonne.jp answers 401 without the password and serves Staging canonicals with it), then after promotion the Production deploy and its smoke test (https://pitonne.jp returns 200, `robots.txt` allows crawling and lists the sitemap) |

Same-repository PRs into `staging` (or `main`, for hotfixes) get a preview at `https://pr-<n>.pitonne-jp.pages.dev`
once the `test` job passes (the `preview` job in `ci.yml`). It is non-indexable, so it's evidence for behaviour, not
for production SEO output; use the production-like preview for that.

## Git workflow

The base branch is `staging`; `main` is Production and receives code only by promotion. The full flow, including what
CI deploys and the repository settings, is in [docs/gitflow.md](docs/gitflow.md).

1. Every change starts from a GitHub issue.
2. Branch from `origin/staging` as `issue-<n>-<slug>`, in its own worktree
   (`git worktree add -b issue-<n>-<slug> ../pitonne.jp-worktrees/issue-<n>-<slug> origin/staging`), not in the owner's
   checkout.
3. Open a PR into `staging` (`gh pr create --base staging`; GitHub's default branch is still `main`) with a
   Conventional Commit title. The body starts with `Closes #<n>`, says what changed and what was left out, and reports
   evidence levels separately. Hotfixes are the only PRs into `main`.
4. Once CI is green, a fresh agent reviews the PR. Reply to every finding as fixed (with the commit) or declined
   (with the reason). Only blocking findings start another round.
5. Record the review outcome in the PR, for example "Review: 1 round, clean".
6. The owner merges (squash), one PR at a time, each up to date with `staging`. Merging deploys Staging
   (https://staging.pitonne.jp).
7. The owner promotes Staging to Production by fast-forward, never by squashing: Actions → Promote to Production, or
   `git fetch origin && git push origin origin/staging:main`. Agents never promote.

Keystatic Cloud commits CMS saves straight to `main` (a documented exception: content goes live immediately), and the
Sync staging workflow merges `main` back into `staging` after every push to `main`. Branches still fall behind often;
bring one up to date with `git fetch origin && git merge origin/staging` (don't rebase a pushed branch). Check the
latest runs (`gh run list --branch staging --limit 5` and `gh run list --branch main --limit 5`) before starting work
and again when handing back. If CI, a deploy or Sync staging failed, fixing it comes first.

## Rules

- Tests check rules, not content snapshots. Editors add and change posts at any time, so don't assert post counts,
  that every post has an image or tags, or the text of a post.
- Trailing-slash exceptions to the [URL trailing-slash standard](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/url-trailing-slash.md):
  on Production and PR previews, the slashed form of a path excluded in `public/_routes.json` (`/images/x.jpg/`,
  `/favicon.ico/`) never reaches the Function and returns 404 (Staging routes every path through the Function, so there
  it 308s once the password is given), and `/keystatic/*` is left as requested (the Keystatic router reads a slash as a segment).
- Staging's password gate exempts only smoke-test header requests (`x-pitonne-smoke-test`) and `/robots.txt`. The site
  receives no webhooks. Keep the list explicit; it lives in `src/lib/canonical-host.ts`.
- Don't rewrite reviewed Japanese copy (content, dictionaries, frontmatter). Add to it instead, and flag
  AI-written Japanese in the PR for native review.
