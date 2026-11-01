# GitHub Actions

The workflows are in `.github/workflows/`. Workflow files hold no comments, so what starts each
one, what it runs and why it's built that way are here and in [`ci-deploys.md`](ci-deploys.md);
change a workflow's section in the same pull request as the workflow. The flow they implement
(which push deploys what, and when) is in [`docs/gitflow.md`](../gitflow.md#what-ci-deploys).

| Workflow | File | Starts on | Section |
| --- | --- | --- | --- |
| CI | `ci.yml` | Every pull request; every push to `staging` and `main` | [Below](#ciyml) |
| Deploy | `deploy.yml` | Called by CI; by hand from `main` or `staging` | [`ci-deploys.md`](ci-deploys.md#deployyml) |
| Promote to Production | `promote.yml` | By hand | [`ci-deploys.md`](ci-deploys.md#promoteyml) |
| Sync staging | `sync-staging.yml` | Every push to `main`; by hand | [`ci-deploys.md`](ci-deploys.md#sync-stagingyml) |

Every job runs on `ubuntu-latest` with a time limit, and a workflow's top-level permissions only
read: each write is granted to the one job that needs it. No `run:` script holds a `${{ }}`
expression; values reach scripts through `env:`. These tests hold the workflows to this doc:

| Test | Holds |
| --- | --- |
| `tools/checks/workflow-rules.test.ts` | Pinned actions, time limits, permissions, version files, the private install, no expressions in scripts |
| `tools/checks/deploy-workflows.test.ts` | The deploy, promotion and sync rules |
| `tools/checks/lighthouse-ci.test.ts`, `e2e.test.ts` | Lighthouse's setup and the browser journeys' rules |

## Checks a merge waits for

The `staging` and `main` rulesets require `test`. Once `verify` is on both branches, the owner
adds it to both (owner steps, [below](#owner-steps)). CI starts on every pull request, with no
`paths` filter, so its checks always report.

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
to `staging` and `main` gets a run of its own, so none is cancelled.

**`verify`** runs `pnpm verify`, every shared check at the `@serpcompany/verify` the lockfile
pins, including actionlint on these workflows. It checks out the commit with its parent
(`fetch-depth: 2`) and names the parent `SERP_VERIFY_BASE` (`HEAD^1`), so the checks' lists can
only shrink. On a pull request into `staging` that parent is `staging`'s tip: the run checks out
the merge commit GitHub makes, whose first parent is the base branch. When the repository has the
`serp-agent` app's key, the job makes the app's short-lived token, narrowed to reading contents,
issues and pull requests, and hands it to the docs check as `SERP_VERIFY_GITHUB_TOKEN`, so links
into serp's private repositories are checked. Without the key, as on a pull request from a fork,
it passes no token, and the docs check skips those links with a note, as it does locally without
one. It lives in CI, rather than a workflow of its own, so the code deploy can need it.

**`test`** runs, one step each: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm audit:meta`,
`DEPLOY_ENV=production pnpm build`, `pnpm audit:out`, `pnpm audit:seo` and
`pnpm test:lighthouse`. These are the steps of `pnpm check` after `pnpm verify`, plus Lighthouse,
listed rather than calling `pnpm check`, so a step added to one is added to the other by hand.
It restores `.next/cache` for the production build.

Lighthouse CI (`lighthouserc.cjs`) serves `out/` with `pnpm start` and audits eight pages once
each, with the desktop preset. Accessibility and best practices must score 0.95 and SEO 0.9;
performance under 0.5 only warns. It skips two audits: `color-contrast`, and
`third-party-cookies`, which the LeadConnector integration sets (removing those cookies is
[issue #51](https://github.com/serpcompany/pitonne.jp/issues/51)). It blocks Google Tag Manager,
LeadConnector and msgsndr, so only this repository's code is scored: tags that load through GTM,
such as the LeadConnector chat widget, behaved differently between runs and made the score flaky.

**`changes`** (pushes only) classifies the push. It is a job of its own, so a skipped deploy never
joins the deploy concurrency group. Its outputs:

- `skip`: the push changes only blog posts that are drafts before and after, such as a draft
  saved in the CMS, so the built site doesn't change and nothing deploys.
  `scripts/draft-only-change.mjs <before> <after>` decides it.
- `fast`: deploy without waiting for this run's checks, because either the push changes only the
  files Keystatic edits (`content/blog/`, `content/blog-categories/` and the feature images under
  `public/images/content/blog/`; the same script decides it), or this exact commit already passed
  every check (`CHECKS` in the step: `verify` and `test`), looked up through GitHub's check-runs
  API, such as a promotion of a commit tested on `staging`. An API error means waiting for the
  checks, never skipping the deploy.

**`deploy-content`** ("Deploy content") runs when the push isn't skipped and is `fast`: CMS
content and already-tested commits deploy at once. **`deploy`** runs when it isn't skipped and
isn't `fast`: a code push's deploy needs `verify` and `test`. Both call `deploy.yml` for
Production on `main` and Staging on `staging`, and both upload the branch tip.

**`alert`** ("Alert on red main") runs when, on a push to `main`, a check, the classification or
a Production deploy failed. A failing check never holds back a CMS save, and CMS commits come
from a bot, so nobody gets the failure email: the job opens one issue titled "CI is failing on
main" that mentions the owner's account, or comments on the open one, until someone fixes `main`
and closes it. It runs one at a time (`alert-red-main`, never cancelled), so two red runs can't
open two issues. It needs `issues: write`.

**`preview`** ("Deploy PR preview") needs `test` and runs only for same-repository pull requests
into `staging` or `main`: a forked pull request gets no secrets and no preview. It deploys the
pull request's head commit to its `pr-<n>` alias.

## deploy.yml

Builds the export for its environment, uploads it to Cloudflare Pages and smoke-tests it, one
deploy per target and environment at a time, always the branch tip. Its steps, its smoke tests
and their retry times are in [`ci-deploys.md`](ci-deploys.md#deployyml).

## Pinned actions

Each workflow runs every action at a commit, never a tag, which can be moved to new code: the
deploy jobs hold the Cloudflare token, and every install holds a token that reads the private
package. Each commit is the one its tag named on 2026-11-01. `checkout`, `setup-node`
and `pnpm/action-setup` moved then from `v4` to the majors SERP's standards use; `wrangler-action`
stays at the commit `v3` named, so the deploy runs the code it ran before. To move one, pin the
new release's commit and change its row here in the same pull request;
`tools/checks/workflow-rules.test.ts` fails on an action that isn't pinned, or isn't in this table
beside the workflows that use it.

| Action | Commit | Version | Used in |
| --- | --- | --- | --- |
| `actions/checkout` | `fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09` | v5.1.0 | `ci.yml`, `deploy.yml`, `promote.yml`, `sync-staging.yml` |
| `actions/setup-node` | `a0853c24544627f65ddf259abe73b1d18a591444` | v5.0.0 | `ci.yml`, `deploy.yml` |
| `pnpm/action-setup` | `0977fd99725f1db4007ccb2928dbb4e90d06cc86` | v6.0.10 | `ci.yml`, `deploy.yml` |
| `actions/cache` | `caa296126883cff596d87d8935842f9db880ef25` | v5.1.0 | `ci.yml`, `deploy.yml` |
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
   and make sure the app is installed on `serpcompany/serp`. Until then `verify` skips those links
   with a note.
3. **Required checks:** add `verify` to the `staging` and `main` rulesets beside `test`.
