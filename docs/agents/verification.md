# Verifying a change

What to run while editing, before a push and at the finish gate, and the evidence each kind of
change needs. Commands here and in the skills are POSIX shell: on Windows, run them in Git Bash.
In PowerShell, set a variable first instead, as in `$env:DEPLOY_ENV = 'production'; pnpm build`.
The rules are SERP's
[Verification Cadence](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/verification-cadence.md);
this doc holds this repository's commands for them.

## Three levels

| Level | When | What runs |
| --- | --- | --- |
| Inner loop | While editing | The tests for the code you changed, the typecheck, Biome on the changed files, and the dev server |
| Push | Before each push for review | `pnpm check`. The pre-push hook also runs `serp-verify` and the fast check |
| Finish gate | Once, on the finished tree | `pnpm check`, then the evidence below |

**The inner loop:**

- `pnpm exec vitest related --run --coverage <files>`: the tests that import the files you
  changed, then `pnpm exec serp-verify coverage --changed`: the coverage gaps on the lines you
  changed ([`code.md`](code.md#coverage)).
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

**The finish gate** is `pnpm check`: `pnpm verify`, then `pnpm lint`, `pnpm typecheck`,
`pnpm test`, `pnpm audit:meta`, `DEPLOY_ENV=production pnpm build`, `pnpm audit:out` and
`pnpm audit:seo`, in that order, stopping at the first failure. The shared checks come first
because they take seconds. The whole gate took about two minutes on a Windows machine on
2026-11-01. It writes the export to `out/`, so don't change files while it runs: the result
would match no commit.

- **Never use the finish gate as the inner loop.**
- **Run it once per state.** If the tree hasn't changed since the last green run (no commit,
  rebase or lockfile change), cite that run instead of repeating it.
- **A fix re-runs only what it could have affected** ([below](#heavy-suites-and-re-runs)).
- **CI on the final commit is the record** of what CI runs, which is all of it
  ([below](#where-ci-runs-what)).
- **Docker installed but not running** fails the shared checks' linters step: `@serpcompany/verify`
  0.1.1 reads Docker's "failed to connect to the docker API" as actionlint failing, instead of
  falling back. Start Docker, or run with Docker's folder off `PATH` and an installed actionlint
  1.7.12 on it.

### Heavy suites and re-runs

SERP's
[Heavy suites and re-runs](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/verification-cadence.md#heavy-suites-and-re-runs)
sets the rule; here, the heavy suites are the browser journeys and Lighthouse.

- **Locally, run only the journeys that cover what changed, at the finish too.** The inner loop,
  the push and the finish gate never run either suite in full: a change to one page runs that
  page's journeys, not the suite. CI runs both in full on every ready pull request that isn't
  docs-only, and its run on the final commit is the record.
- **A fix re-runs only what it could have affected:** the check or tests that failed, the unit
  tests for what it touched (`pnpm exec vitest related --run <files>`), and the journeys that
  cross it, by file and title, as in
  `DEPLOY_ENV=production pnpm test:e2e e2e/pages.spec.ts --grep "contact page"`. A fix to one
  page's component re-runs that page's journey. A fix to a shared component, such as the header,
  the footer or `ContactButton`, re-runs every journey that passes through it; find them by
  searching `e2e/` and the component's uses.
- **The whole suite runs locally only when a change's reach is wide or unknown:** the `[locale]`
  layout, `src/app/globals.css`, `next.config.mjs`, routing or the data layer, the Pages Function,
  `public/_redirects` or `_headers`, a dependency upgrade, or anything whose reach you can't bound.
  Otherwise no change runs the journeys it can't reach.
- **Report what ran:** the pull request's evidence says what ran in full, what ran scoped and
  why, and what was left to CI. A scoped run is never reported as a full pass.

## Browser journeys

`e2e/` holds Playwright journeys that drive a built `out/` in Chromium, served as Pages serves
it: Playwright starts `pnpm preview` (`wrangler pages dev out`, with the wrangler the deploy
uploads with) on port 8791 (`E2E_PORT` changes it), which applies `_redirects`, `_headers`,
`_routes.json` and the Function, and it refuses to reuse a server already on that port.

- **Run them:** `DEPLOY_ENV=production pnpm build`, then `DEPLOY_ENV=production pnpm test:e2e`.
  They read `DEPLOY_ENV` as `pnpm audit:seo` does, to know which indexing signals the build must
  send, so export the value the build used; `pnpm build` and `pnpm test:e2e` with neither test
  a preview build. Once per machine, `pnpm exec playwright install chromium` downloads the
  browser; point `PLAYWRIGHT_BROWSERS_PATH` at a disk with room if the default one is full.
- **The `playwright` package,** not `@playwright/test`, which only re-exports it: `next` names
  `@playwright/test` as an optional peer, so installing it renames `next`'s folder in pnpm's
  store, and Turbopack, which numbers modules by their path, then builds different JavaScript.
  `tools/checks/e2e.test.ts` fails if it comes back.
- **Two widths:** the `desktop` project (1440×900) and the `phone` project (Pixel 7). `retries`
  is 0, and any console error or uncaught page error fails the journey (`e2e/fixtures.ts`).
  Requests to other hosts (Google Tag Manager, the LeadConnector form, the map) get an empty
  answer, so no journey depends on a third party.
- **Behavior, not content:** editors change posts at any time, so a journey follows whatever
  post, category, service or area the page links first, and never counts posts or reads their
  text. Labels come from the dictionaries.
- **What they cover:** the product docs name each journey under the behavior it holds
  ([`docs/product/`](../product/index.md)). `e2e/environment.spec.ts` checks the indexing
  signals, the 404 page and the redirects on the build before the deploy; the deploy's smoke test
  checks them again on the deployed site.
- **Not part of `pnpm check`:** they need a build and a browser, and on Windows the export
  isn't the one Linux builds (below). CI's `e2e` job runs them on every ready pull request and
  every push ([`ci.md`](ci.md#ciyml)).
- **On Windows,** `next build` writes each page's RSC payload files into nested folders
  (`out/about/__next.!KGVuKQ/about/__PAGE__.txt`) where Linux, and so CI and every deploy, writes
  one flat name per file (`out/about/__next.!KGVuKQ.about.__PAGE__.txt`), the name the client
  requests. Served locally, those requests answer 404, so on a Windows build the journeys that
  load or follow links fail: on 2026-11-01, 12 of the 23 that ran failed, 10 on console errors
  (`Failed to load resource: the server responded with a status of 404` for
  `/services/__next.!KGVuKQ.services.txt` and the like), one because a link never navigated,
  and one on an aborted page load. Run them in WSL or another Linux shell, or let CI run them.

## Where CI runs what

CI runs the whole finish gate, split into jobs, on every pull request and every push to `staging`
and `main` ([`ci.md`](ci.md#ciyml)), so CI on the final commit is the record of it. A docs-only
change, Markdown under `docs/` or `.claude/skills/` or at the root that nothing else reads, runs
only `pnpm verify docs,secrets` and deploys nothing, as SERP's
[CI Scope](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/ci-scope.md)
sets:

| Check | Locally | In CI |
| --- | --- | --- |
| SERP's shared checks | `pnpm verify`; the git hooks | `verify`; only `docs` and `secrets` on a docs-only change |
| Lint, types, unit tests, `audit:meta` | The inner loop; `pnpm check` | `test`, except on a docs-only change |
| The production build, `audit:out`, `audit:seo` | `pnpm check` | `test`, except on a docs-only change or a pushed tree that passed the slow suites; each deploy builds its own environment |
| Browser journeys | `pnpm test:e2e` after a build | `e2e`, on `test`'s build; not on drafts or docs-only changes |
| Lighthouse | `pnpm test:lighthouse` after a build | `lighthouse`, on `test`'s build; not on drafts or docs-only changes |
| Each environment as deployed | `verify-site` | Each deploy's smoke test; none for a docs-only push |

CI lists `pnpm check`'s steps rather than calling it, so a step added to one is added to the
other by hand.

## Git hooks

`pnpm install` installs lefthook's git hooks (`lefthook.yml`, which extends
`@serpcompany/verify`'s own). Before each commit, `serp-verify comments,sizes,secrets` and Biome
run on the staged files. Before each push, the full `serp-verify` runs, and `pnpm lint`,
`pnpm typecheck` and `pnpm test`, with no build. Fix what they report rather than skipping them.

## Agent hooks

`.claude/settings.json` gives Claude Code SERP's two hooks. After each file an agent writes or
edits, `serp-verify hook` runs the comment, size, layer and secrets checks on it and hands any
finding back to the agent to fix. Before a turn ends, `serp-verify stop-hook` runs them on every
file changed since the last commit, and the docs check on the whole repository, and holds the
turn open until the agent fixes or explains them. It reports the same findings only once per
session, and keeps that record in the ignored `tmp/agent/`. Without an install, both hooks say
to run `pnpm install` (see Setup in [`AGENTS.md`](../../AGENTS.md#setup)).

The same file asks before an agent deploys or changes the Cloudflare Pages project with
`wrangler`, pushes to `main` or `staging`, runs, re-runs or cancels a workflow, merges a pull
request, changes a secret, a variable or the repository, or writes through `gh api`. Deleting the
Pages project is denied.

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

**The production-like preview:** `DEPLOY_ENV=production pnpm build`, then `pnpm preview`
(`wrangler pages dev out`) from the repository root, which serves `out/` with `_redirects`,
`_headers`, `_routes.json` and the Function as Pages does. `pnpm start` serves the files alone,
without any of those.

**The Staging gate locally:** `DEPLOY_ENV=staging pnpm build`, then serve it with
`pnpm preview --binding CF_PAGES_BRANCH=staging --binding STAGING_PASSWORD=stagingpassword`.
The Function gates `127.0.0.1` as it gates `staging.pitonne.jp`: `curl -I http://127.0.0.1:8788/`
answers 401, and with `-u any:stagingpassword` it answers 200 without `X-Robots-Tag`.

**PR previews** (`https://pr-<n>.pitonne-jp.pages.dev`) are non-indexable, with canonicals on
https://pitonne.jp, so they're evidence for behavior, not for Production's SEO output; the
production-like preview shows that ([`environments.md`](environments.md#pr-previews)).

## Tests that hold the site's rules

Each behavior of the live site names the test, journey, audit or smoke check that holds it in
[`docs/product/`](../product/index.md). The checks of the code and the harness are named beside
their rules: the
dictionaries kept out of client components in [`docs/i18n.md`](../i18n.md#ui-strings), the
areas' text kept out of them in [`content.md`](content.md#areas-videos-and-business-data), the
journeys' own rules in [`code.md`](code.md#tests), and the workflows' in [`ci.md`](ci.md).
