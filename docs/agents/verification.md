# Verifying a change

What to run while editing, before a push and at the finish gate, and the evidence each kind of
change needs. The rules are SERP's
[Verification Cadence](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/verification-cadence.md);
this doc holds this repository's commands for them.

## Three levels

| Level | When | What runs |
| --- | --- | --- |
| Inner loop | While editing | The tests for the code you changed, the typecheck, Biome on the changed files, and the dev server |
| Push | Before each push for review | `pnpm check`. The pre-push hook also runs `serp-verify` and the fast check |
| Finish gate | Once, on the finished tree | `pnpm check`, then the evidence below |

**The inner loop:**

- `pnpm exec vitest related --run <files>`: the tests that import the files you changed.
- `pnpm exec vitest run <test-file>`: one test file.
- `pnpm typecheck`, and `pnpm exec biome check <files>` (or `pnpm lint` for everything;
  `pnpm format` writes the formatting).
- `pnpm verify [checks] [paths]`: SERP's shared checks, all of them or the comma-separated ones
  named, on every file or on the paths given, such as `pnpm verify docs` after editing a doc
  ([`code.md`](code.md#the-checks)).
- `pnpm audit:meta` for titles and descriptions; it needs no build. Hardcoded strings, route
  coverage and business data are tests that `pnpm test` runs.
- `pnpm dev` for the site at http://localhost:3000, and `pnpm cms` for Keystatic on local files
  at http://127.0.0.1:3000/keystatic.

**The finish gate** is `pnpm check`: `pnpm lint`, `pnpm typecheck`, `pnpm test`,
`pnpm audit:meta`, `DEPLOY_ENV=production pnpm build`, `pnpm audit:out` and `pnpm audit:seo`, in
that order, stopping at the first failure. It took about two minutes on a Windows laptop on
2026-11-01. It writes the export to `out/`, so don't change files while it runs: the result
would match no commit.

- **Never use the finish gate as the inner loop.**
- **Run it once per state.** If the tree hasn't changed since the last green run (no commit,
  rebase or lockfile change), cite that run instead of repeating it.
- **A fix re-runs what it could have broken:** the check that failed and the tests for the code
  you changed, not every suite again.
- **CI on the final commit is the record** of what CI runs. CI lists its steps itself rather than
  calling `pnpm check`, and runs Lighthouse too ([`ci.md`](ci.md#ciyml)).

## Git hooks

`pnpm install` installs lefthook's git hooks (`lefthook.yml`, which extends
`@serpcompany/verify`'s own). Before each commit, `serp-verify comments,sizes,secrets` and Biome
run on the staged files. Before each push, the full `serp-verify` runs, and `pnpm lint`,
`pnpm typecheck` and `pnpm test`, with no build. Fix what they report rather than skipping them.

## Waiting

- Anything that can take more than a couple of minutes runs in the background, with a time limit
  and its output in a file: CI, deploys, a crawl of the built site.
- No foreground `sleep` loops. With nothing else to do, hand back with the status and what you're
  waiting for. An agent reads CI with `gh` only as the organization's app
  ([Agent GitHub Identity](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/agent-harness/agent-github-identity.md)).
- Stop the servers you start, with their whole process tree: a `wrangler pages dev` whose shell
  was stopped keeps its port, and a new server on that port can be answered by the old one.

## Evidence

The [`verify-site`](../../.claude/skills/verify-site/SKILL.md) skill runs each setup below and
checks it. A pull request reports each level apart: build, automated tests, the running site, the deployed
site, and the owner's acceptance. A lower level never proves a higher one. Every change has the
build and tests, from the finish gate or CI. Beyond that:

| Change | Evidence |
| --- | --- |
| Visible UI | One local run with `pnpm dev`, in both `/` and `/ja/`, with a screenshot of each |
| Redirects or headers (`public/_redirects`, `public/_headers`, `public/_routes.json`, the Function), trailing slashes, the `/keystatic/*` fallback | The production-like preview below, with `curl -I` on the affected URLs. This is routing on a live site, so also `curl -I` the same URLs on https://pitonne.jp before the change and again after the Production deploy, and put both in the pull request |
| The CMS (`keystatic.config.ts`, `src/lib/blog-rules.ts`, `patches/@keystatic__core@0.6.9.patch`, the post and category schemas) | A local run of the affected editor flow with `pnpm cms`; after the deploy, https://pitonne.jp/keystatic loads |
| Deploy config (`.github/workflows/*`, `wrangler.toml`, `next.config.mjs`, `scripts/draft-only-change.mjs`, `scripts/deploy-target.mjs`, `scripts/environment-headers.mjs`, the smoke scripts, the environment helpers, robots or sitemaps) | The production-like preview, and the PR preview. For the Staging gate, a Staging build served locally (below). After the merge, the Staging deploy and its smoke test; after the promotion, the Production deploy and its smoke test ([`ci.md`](ci.md#deployyml)) |

**The production-like preview:** `DEPLOY_ENV=production pnpm build`, then
`pnpm dlx wrangler@4.103.0 pages dev out` from the repository root, which serves `out/` with
`_redirects`, `_headers`, `_routes.json` and the Function as Pages does. `pnpm start` serves the
files alone, without any of those.

**The Staging gate locally:** `DEPLOY_ENV=staging pnpm build`, then serve it with
`--binding CF_PAGES_BRANCH=staging --binding STAGING_PASSWORD=stagingpassword`. The Function
sends every Staging host but `staging.pitonne.jp` to that host, so send its name:
`curl -I -H "Host: staging.pitonne.jp" http://127.0.0.1:8788/` answers 401, and with
`-u any:stagingpassword` it answers 200 without `X-Robots-Tag`.

**PR previews** (`https://pr-<n>.pitonne-jp.pages.dev`) are non-indexable, with canonicals on
https://pitonne.jp, so they're evidence for behavior, not for Production's SEO output; the
production-like preview shows that ([`environments.md`](environments.md#pr-previews)).

## Tests that hold the site's rules

| Test | Holds |
| --- | --- |
| `src/lib/i18n/dictionaries.test.ts` | `en.json` and `ja.json` have the same keys and value types, and no empty Japanese value |
| `src/lib/i18n/content-parity.test.ts` | Services and legal pages exist in both locales; blog translations pair by filename and slug |
| `src/lib/i18n/hardcoded-strings.test.ts` | No visible text in `src/app` or `src/components` outside the dictionaries |
| `src/lib/i18n/client-imports.test.ts` | No client component reaches the dictionaries |
| `src/lib/data/routes.test.ts` | Every canonical route has a page in each locale, and blog pages exist only for published posts, in their own locale |
| `src/lib/data/blog-posts.test.ts` | The blog's frontmatter rules, drafts, categories and related services |
| `src/lib/sitemaps.test.ts` | The sitemap index pattern |
| `src/lib/canonical-host.test.ts`, `src/lib/staging-gate.test.ts` | The host redirects, the slash rules and the Staging gate |
| `src/lib/site-origin.test.tsx` | Staging writes its own origin everywhere a URL is written |
| `tools/checks/deploy-workflows.test.ts` | The workflows' deploy rules |
