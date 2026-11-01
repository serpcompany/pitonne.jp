# GitHub Actions

The workflows are in `.github/workflows/`. Workflow files hold no comments, so what starts each
one, what it runs and why it's built that way are here and in the two docs this one links;
change a workflow's section in the same pull request as the workflow. The flow they implement
(which push deploys what, and when) is in [`docs/gitflow.md`](../gitflow.md#what-ci-deploys).

| Workflow | File | Starts on | Section |
| --- | --- | --- | --- |
| CI | `ci.yml` | Every pull request, again when it's marked ready; every push to `staging` and `main` | [Below](#ciyml) |
| Deploy | `deploy.yml` | Called by CI; by hand from `main` or `staging` | [`ci-deploys.md`](ci-deploys.md#deployyml) |
| Promote to Production | `promote.yml` | By hand | [`ci-deploys.md`](ci-deploys.md#promoteyml) |
| Sync staging | `sync-staging.yml` | Every push to `main`; by hand | [`ci-deploys.md`](ci-deploys.md#sync-stagingyml) |
| Pull request | `pull-request.yml` | Every pull request, again when its title or body is edited | [`ci-pull-requests.md`](ci-pull-requests.md#pull-request) |
| Close issues | `close-issues.yml` | A pull request into `staging` closing | [`ci-pull-requests.md`](ci-pull-requests.md#close-issues) |

Every job runs on `ubuntu-latest` with a time limit, and a workflow's top-level permissions only
read: each write is granted to the one job that needs it. No `run:` script holds a `${{ }}`
expression; values reach scripts through `env:`. These tests hold the workflows to this doc:

| Test | Holds |
| --- | --- |
| `tools/checks/workflow-rules.test.ts` | Pinned actions, time limits, permissions, version files, the private install, no expressions in scripts |
| `tools/checks/ci-events.test.ts` | Which CI jobs and steps run on each event, played out as GitHub settles them |
| `tools/checks/deploy-workflows.test.ts` | The deploy, promotion and sync rules |
| `tools/checks/pull-request-workflows.test.ts`, `pull-request.test.ts`, `close-issues.test.ts` | The pull request checks and the issue closing |
| `tools/checks/lighthouse-ci.test.ts`, `e2e.test.ts` | Lighthouse's setup and the browser journeys' rules |

## Checks a merge waits for

The `staging` and `main` rulesets require `test`. Once these workflows are on both branches, the
owner adds `verify`, `title`, `issue-link`, `fix-test` and `text` to both, and may add `e2e` and
`lighthouse`, which run on every ready pull request (owner steps, [below](#owner-steps)). Each
required workflow starts on every pull request, with no `paths` filter, so its check always
reports: a docs-only change skips work inside the jobs, never the jobs.

## Installing the private package

`@serpcompany/verify` is a private package on GitHub Packages, so each job that installs grants
`packages: read`, `actions/setup-node` sends the `@serpcompany` scope to
`https://npm.pkg.github.com`, and the install step alone gets the job's own token as
`NODE_AUTH_TOKEN`. That token reads the package only once the package's settings give this
repository Read under Manage Actions access, an owner step; until then the install fails, and the
step after it says what to grant. No other token can stand in: GitHub Packages takes only Actions'
own token or a personal access token (classic), no app's. Node comes from `.node-version` and pnpm
from `packageManager` in `package.json`; `actions/setup-node` caches the pnpm store.

## ci.yml

**Concurrency.** A new push to a pull request cancels that pull request's older run; every push
to `staging` and `main` gets a run of its own, so none is cancelled. It starts on
`ready_for_review` too, so a draft marked ready runs the jobs its draft run skipped.

**`changes`** ("Classify changes") runs first, on every event, and says what the rest must do.
`scripts/draft-only-change.mjs <before> <after>` compares the pushed commits, or a pull
request's merge commit with its base:

- `docs`: every changed file is a doc (`docs/`, a root `*.md`, or a skill under
  `.claude/skills/`), which the build never reads.
- `skip` (pushes): the push changes only blog posts that are drafts before and after, such as a
  draft saved in the CMS, so the built site doesn't change and nothing deploys.
- `fast` (pushes): deploy without waiting for this run's checks, because either the push changes
  only the files Keystatic edits (`content/blog/`, `content/blog-categories/` and the feature
  images under `public/images/content/blog/`), or this exact commit already passed every check
  (`verify`, `test`, `e2e` and `lighthouse`), looked up through GitHub's check-runs API, such as a
  promotion of a commit tested on `staging`. An API error means waiting for the checks.
- `e2e` and `lighthouse` (pushes): `passed` when the pushed tree has a receipt for that suite
  ([below](#receipts)), otherwise `run`.

It is a job of its own, so a skipped deploy never joins the deploy concurrency group.

**`verify`** runs `pnpm verify`, every shared check at the `@serpcompany/verify` the lockfile
pins, including actionlint on these workflows. It checks out the commit with its parent
(`fetch-depth: 2`) and names the parent `SERP_VERIFY_BASE` (`HEAD^1`), so the checks' lists can
only shrink. On a pull request into `staging` that parent is `staging`'s tip: the run checks out
the merge commit GitHub makes, whose first parent is the base branch. When the repository has the
`serp-agent` app's key, the job makes the app's short-lived token, narrowed to reading contents,
issues and pull requests, and hands it to the docs check as `SERP_VERIFY_GITHUB_TOKEN`, so links
into serp's private repositories are checked, as SERP's verification standard sets. Without the
key, as on a pull request from a fork, it passes no token, and the docs check skips those links
with a note, as it does locally without one. It lives in CI, rather than a workflow of its own, so
the code deploy can need it.

**`test`** runs `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm audit:meta`, then builds
the production export, runs `pnpm audit:out` and `pnpm audit:seo` on it, and hands it to `e2e`
and `lighthouse` as the `site-production` artifact. These are the steps of `pnpm check` after
`pnpm verify`, listed rather than calling `pnpm check`, so a step added to one is added to the
other by hand. It skips the build and the audits on a docs-only change, and on a push whose tree
has both suites' receipts. It needs `changes`, and fails when `changes` didn't succeed: a skipped
required check would count as passed.

**`e2e`** runs the browser journeys ([`verification.md`](verification.md#browser-journeys)) on
that export: it installs Chromium (`~/.cache/ms-playwright` is cached under the lockfile's hash),
serves the export with `pnpm preview`, and runs `pnpm test:e2e` with `DEPLOY_ENV=production`.
`retries` is 0. On a failure it keeps `tmp/e2e`, the report and traces, as the
`playwright-report` artifact for a week.

**`lighthouse`** runs Lighthouse CI (`lighthouserc.cjs`) on the same export, served with
`pnpm start`, auditing eight pages once each with the desktop preset. Accessibility and best
practices must score 0.95 and SEO 0.9; performance under 0.5 only warns. It skips two audits:
`color-contrast`, and `third-party-cookies`, which the LeadConnector integration sets (removing
those cookies is [issue #51](https://github.com/serpcompany/pitonne.jp/issues/51)). It blocks
Google Tag Manager, LeadConnector and msgsndr, so only this repository's code is scored: tags that
load through GTM, such as the LeadConnector chat widget, behaved differently between runs.

Both are slow suites, so a draft pull request skips them (`draft == false`), and a docs-only
change or a receipt skips their steps, never the jobs, so the deploy that needs them still runs.

### Receipts

When `e2e` or `lighthouse` passes in a run of this repository (not a fork's), it uploads
`passed-<suite>-<tree>`, where `<tree>` is `git rev-parse HEAD^{tree}` of the commit it tested,
kept 30 days. On a push, `changes` looks one up for the pushed tree, from this repository's runs
only; a match skips that suite's steps, and an error looking means running it. The `staging`
ruleset requires up-to-date branches, so a squash merge usually lands the tree its pull request
run tested, and a promotion lands the tree `staging` tested.

### One build per commit and environment

`DEPLOY_ENV` changes the output (the `robots.txt`, `_headers`, canonical origin and Google Tag
Manager), so "once" means once per commit and environment:

- The production build the checks need (`audit:seo`, the journeys, Lighthouse, which can't score
  a Staging or preview build whose `robots.txt` blocks crawlers) is made once, by `test`, and
  handed on. On a push whose tree passed those suites before, it isn't made at all, and the
  deploy's build, with its `audit:out` and output checks, is that commit's build check.
- Each deploy builds its own environment once, from the branch tip, which can be newer than the
  commit the run tested, so it never takes `test`'s artifact.
- A push to `main` that wasn't tested before, a CMS save or a hotfix, builds production twice:
  in `test`, for the checks, and in the deploy, which for content can't wait for them.

**`deploy-content`** ("Deploy content") runs when the push isn't skipped and is `fast`: CMS
content and already-tested commits deploy at once. **`deploy`** runs when it isn't skipped and
isn't `fast`: a code push's deploy needs `verify`, `test`, `e2e` and `lighthouse`. Both call
`deploy.yml` for Production on `main` and Staging on `staging`, and both upload the branch tip
([`ci-deploys.md`](ci-deploys.md#deployyml)).

**`alert`** ("Alert on red main") runs when, on a push to `main`, any check, the classification or
a Production deploy failed. A failing check never holds back a CMS save, and CMS commits come
from a bot, so nobody gets the failure email: the job opens one issue titled "CI is failing on
main" that mentions the owner's account, or comments on the open one, until someone fixes `main`
and closes it. It runs one at a time (`alert-red-main`, never cancelled), so two red runs can't
open two issues. It needs `issues: write`.

**`preview`** ("Deploy PR preview") needs `test` and runs only for same-repository pull requests
into `staging` or `main`: a forked pull request gets no secrets and no preview. It deploys the
pull request's head commit to its `pr-<n>` alias.

**Caches:** the pnpm store (through `actions/setup-node`), `.next/cache` per environment under
the lockfile's and the sources' hashes, and Playwright's browsers. The export itself is never
cached: each run builds it or takes it from its own `test`.

## deploy.yml

Builds the export for its environment, uploads it to Cloudflare Pages and smoke-tests it, one
deploy per target and environment at a time, always the branch tip. Its steps, its smoke tests
and their retry times are in [`ci-deploys.md`](ci-deploys.md#deployyml).

## Pinned actions

Each workflow runs every action at a commit, never a tag, which can be moved to new code: the
deploy jobs hold the Cloudflare token, every install holds a token that reads the private
package, and the issue closing holds one that writes issues. Each commit is the one its tag named on 2026-11-01.
`checkout`, `setup-node` and `pnpm/action-setup` moved then from `v4` to the majors SERP's
standards use; `wrangler-action` stays at the commit `v3` named, so the deploy runs the code it
ran before. To move one, pin the new release's commit and change its row here in the same pull
request; `tools/checks/workflow-rules.test.ts` fails on an action that isn't pinned, or isn't in
this table beside the workflows that use it.

| Action | Commit | Version | Used in |
| --- | --- | --- | --- |
| `actions/checkout` | `fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09` | v5.1.0 | `ci.yml`, `close-issues.yml`, `deploy.yml`, `promote.yml`, `pull-request.yml`, `sync-staging.yml` |
| `actions/setup-node` | `a0853c24544627f65ddf259abe73b1d18a591444` | v5.0.0 | `ci.yml`, `deploy.yml` |
| `pnpm/action-setup` | `0977fd99725f1db4007ccb2928dbb4e90d06cc86` | v6.0.10 | `ci.yml`, `deploy.yml` |
| `actions/cache` | `caa296126883cff596d87d8935842f9db880ef25` | v5.1.0 | `ci.yml`, `deploy.yml` |
| `actions/upload-artifact` | `cf430e030ddbb5b0abf93d22962f4752f3646cd9` | v7.0.2 | `ci.yml` |
| `actions/download-artifact` | `9000827ccba6bdab643e8b6fd33ac0654aef8333` | v8.0.2 | `ci.yml` |
| `actions/create-github-app-token` | `64ab729a6294000f5aa4a4bc0b73d1f32bc45510` | v3.3.0 | `ci.yml` |
| `cloudflare/wrangler-action` | `9acf94ace14e7dc412b076f2c5c20b8ce93c79cd` | v3.15.0 | `deploy.yml` |

## Owner steps

Nothing in the repository can do these; an owner does them once:

1. **Read access to the package:** in serpcompany's `@serpcompany/verify` package settings,
   Manage Actions access, add `serpcompany/pitonne.jp` with the Read role. Until then every job
   that installs fails, with a note saying so.
2. **The `serp-agent` app's key**, so `verify` checks links into serp's private repositories:
   add the app's ID as the Actions variable `SERP_AGENT_APP_ID` and a private key made for CI as
   the Actions secret `SERP_AGENT_PRIVATE_KEY` (or organization ones that cover this repository),
   and install the app on `serpcompany/serp`. Until then `verify` skips those links with a note.
3. **Required checks:** add `verify`, `title`, `issue-link`, `fix-test` and `text` to the
   `staging` and `main` rulesets beside `test`, and optionally `e2e` and `lighthouse`.
