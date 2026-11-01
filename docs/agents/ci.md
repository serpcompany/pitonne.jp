# GitHub Actions

The workflows are in `.github/workflows/`. Workflow files hold no comments, so what starts each
one, what it runs and why it's built that way are here; change a workflow's section in the same
pull request as the workflow. The flow they implement (which push deploys what, and when) is in
[`docs/gitflow.md`](../gitflow.md#what-ci-deploys), and the tests that hold the workflows to it are
`tools/checks/deploy-workflows.test.ts` and `tools/checks/lighthouse-ci.test.ts`.

| Workflow | File | Starts on |
| --- | --- | --- |
| CI | `ci.yml` | Every pull request; every push to `staging` and `main` |
| Deploy | `deploy.yml` | Called by CI; by hand from `main` or `staging` |
| Promote to Production | `promote.yml` | By hand |
| Sync staging | `sync-staging.yml` | Every push to `main`; by hand |

Every job runs on `ubuntu-latest`. The jobs that install set up pnpm 10.14.0 and Node 24 and run
`pnpm install --frozen-lockfile`. They don't yet authenticate to GitHub Packages, which
installing the private `@serpcompany/verify` needs, and no workflow runs `pnpm verify` yet.

## ci.yml

**Concurrency.** A new push to a pull request cancels that pull request's older run; every push
to `staging` and `main` gets a run of its own, so none is cancelled. The workflow reads contents
only; the jobs that call `deploy.yml` add `checks: read` and `deployments: write`.

**`test`** runs, one step each: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm audit:meta`,
`DEPLOY_ENV=production pnpm build`, `pnpm audit:out`, `pnpm audit:seo` and
`pnpm test:lighthouse`. These are the steps of `pnpm check` after `pnpm verify`, plus Lighthouse,
listed rather than calling `pnpm check`, so a step added to one is added to the other by hand.

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
- `fast`: deploy without waiting for this run's `test`, because either the push changes only the
  files Keystatic edits (`content/blog/`, `content/blog-categories/` and the feature images under
  `public/images/content/blog/`; the same script decides it), or this exact commit already passed
  `test`, looked up through GitHub's check-runs API, such as a promotion of a commit tested on
  `staging`. An API error means waiting for `test`, never skipping the deploy.

**`deploy-content`** ("Deploy content") runs when the push isn't skipped and is `fast`: CMS
content and already-tested commits deploy at once. **`deploy`** runs when it isn't skipped and
isn't `fast`: a code push's deploy waits for `test`. Both call `deploy.yml` for Production on
`main` and Staging on `staging`, and both upload the branch tip.

**`alert`** ("Alert on red main") runs when, on a push to `main`, `test`, the classification or a
Production deploy failed. A failing `test` never holds back a CMS save, and CMS commits come from
a bot, so nobody gets the failure email: the job opens one issue titled "CI is failing on main"
that mentions the owner's account, or comments on the open one, until someone fixes `main` and
closes it. It runs one at a time (`alert-red-main`, never cancelled), so two red runs can't open
two issues. It needs `issues: write`.

**`preview`** ("Deploy PR preview") needs `test` and runs only for same-repository pull requests
into `staging` or `main`: a forked pull request gets no secrets and no preview. It deploys the
pull request's head commit to its `pr-<n>` alias.

## deploy.yml

A reusable workflow that builds the export, uploads it to Cloudflare Pages and smoke-tests the
environment. Run by hand (Actions → Deploy → Run workflow), it uploads the current tip of the
branch it runs from, `main` to Production or `staging` to Staging, and skips CI's `test` gate.
The job has 30 minutes. It receives one secret, `CLOUDFLARE_API_TOKEN`; the release deploy key
never reaches a deploy or a preview.

- **Concurrency:** one group per target and environment (`deploy-pages-production`,
  `deploy-pages-staging`, `deploy-pages-pr-<n>`), never cancelled. A running deploy is never
  cancelled, a Staging push never cancels a Production deploy, and GitHub keeps only the newest
  queued deploy of a group.
- **Resolve environment:** Production deploys only from `main`, Staging only from `staging`, and a
  preview only for a pull request, to its own `pr-<n>` alias, so nothing else can reach the
  Production or Staging aliases. It sets `DEPLOY_ENV`, `NEXT_PUBLIC_DEPLOY_ENV` and the Pages
  branch.
- **Choose the commit to deploy** (Staging and Production): deploys queue out of commit order,
  since a CMS save deploys at once while a code commit waits for its `test`. So, inside the
  concurrency group, `scripts/deploy-target.mjs <branch> <sha>` fetches the branch and picks its
  tip as it is now, and every deploy publishes everything committed so far: a queued older deploy
  never puts back an older site, and rapid CMS saves all go live. `main` and `staging` only move
  forward, so the tip is the newest state. There is deliberately no "already live" skip:
  GitHub's deployment records name the branch, not the uploaded commit, and redeploying the same
  tree is harmless. When the tip isn't the commit the run started for, the next step checks the
  tip out before anything is installed or built.
  - If the fetch fails, it deploys the tip the job's checkout fetched a moment earlier, with a
    warning: deploys of one environment run one at a time, so no deploy before this one saw a
    newer tip.
  - If it can read no tip at all, the step fails and nothing deploys, rather than deploy the
    commit the run started for, which could be older than what is live
    (`scripts/deploy-target.test.mjs` runs each case against a scratch clone).
- **Build and verify:** `pnpm build`, then `pnpm audit:out`, then the environment's own output:
  Production's `robots.txt` doesn't disallow crawling and its `_headers` send no `noindex`;
  Staging's `_headers` send no `noindex` and its `robots.txt` disallows `*`, names
  `AhrefsSiteAudit` and lists Staging's sitemap; a preview's do both.
- **Upload:** `wrangler pages deploy out` (wrangler 4.103.0) to the `pitonne-jp` project with the
  branch and commit. For Staging and Production it passes the job's token so GitHub records a
  deployment; for previews the Cloudflare Pages app comments on the pull request instead.

**Smoke tests.** The checks of a page's content send the smoke-test header, so a deployment URL
is served instead of redirected; the redirect and password checks leave it off.

- **Production:** `scripts/smoke-canonical-host.mjs <deployment-url>` checks the host redirects
  ([`hosts.md`](hosts.md)): each non-canonical host gives one 308 to https://pitonne.jp with the
  path and query, a `_redirects` rule is folded into that hop, a file URL with a slash gives one
  308 to the file, and behind the Function the Keystatic app, a legacy 301, the sitemap's content
  type and a 404 still come from the static files. Then
  `scripts/smoke-environment.mjs production` on `pitonne-jp.pages.dev` and
  https://pitonne.jp: `/` and `/ja/` answer 200 without `noindex`, `robots.txt` allows crawling
  and lists the sitemap index, a missing page answers 404 with one `noindex` tag and a link home,
  the sitemap index loads, and no response asks for a password. Not on the deployment URL:
  Cloudflare sends `noindex` on every `<hash>.pitonne-jp.pages.dev`, Production's too.
- **Staging:** `smoke-environment.mjs staging` on the `staging` alias, the deployment URL and
  https://staging.pitonne.jp. On each, `/` and `/ja/` answer 200 with `noindex` and a Staging
  canonical, `robots.txt` disallows crawling, and a missing page answers 404. On
  staging.pitonne.jp, without the header: `/`, `/ja/` and `/favicon.ico` answer 401 with a Basic
  challenge, `no-store` and `noindex`; with the password, `/` and `/ja/` answer 200 with no
  `noindex` and a Staging canonical; `/robots.txt` answers 200, disallows `*` and lists Staging's
  sitemap. On the other two, `/contact` without the header answers 308 to
  https://staging.pitonne.jp/contact/, which proves the branch variable reached the Function.
- **Previews:** `smoke-environment.mjs preview` on the `pr-<n>` alias and the deployment URL: the
  page, `robots.txt` and 404 checks, with `noindex` in both the header and the meta tag.

The branded hosts sit behind Bot Fight Mode, which may challenge the runner: a challenge there is
a warning, any other wrong answer still fails. The pages.dev hosts are always checked.

**Retries.** A new deployment takes a while to replace the old one at the edge, and a brand-new
deployment URL can answer 404 for some paths for over a minute while others work (seen on
2026-10-06, [issue #109](https://github.com/serpcompany/pitonne.jp/issues/109)). Each request
times out after 10 seconds and retries 5 seconds later.

- `smoke-environment.mjs` keeps retrying each origin's checks until 120 seconds after its first
  check started, with at least 2 tries each.
- `smoke-canonical-host.mjs` gives its first check 12 tries, every later one 2, and the deployment
  URL's checks until 120 seconds after the first of them started.
- If every request hung until its timeout, Production's smoke tests would take about 22 minutes
  (about 14 for the host checks and 4 per origin for the environment checks) and Staging's about
  14, inside the job's 30 minutes.

**A late deploy, 2026-10-27.** Run 40513860827, a promotion push to `main`, had GitHub create its
deploy job 19 minutes after its only prerequisite finished. No concurrency group, queue or
environment rule held it, and in 13 other push runs the deploy started 2 to 60 seconds after its
prerequisites. It was a delay on GitHub's side, so nothing in the workflows changed.

## promote.yml

Promotes Staging to Production by fast-forwarding `main` to `staging`, so `main` receives exactly
the commits tested and deployed on Staging, never a squash. The push to `main` runs CI there,
which deploys at once, since the commit already passed `test`. It runs one at a time
(`promote-production`) and has 10 minutes.

- It refuses when `main` has commits `staging` lacks (Sync staging hasn't caught up, or failed on
  a conflict), and when the `staging` commit hasn't passed `test`. When `main` is already at
  `staging`, it succeeds with nothing to promote.
- It pushes with `RELEASE_DEPLOY_KEY`, a deploy key that bypasses the `main` ruleset, so the
  ruleset checks nothing about this push, required checks included: the checks above are what
  protect `main`. A push with Actions' own token wouldn't start CI, so Production wouldn't deploy.
- The key is a secret of the `release` environment, which only `main` and `staging` can use.
- The push isn't forced, so git only ever fast-forwards `main`, and it pushes the commit it
  checked: a CMS save landing in between makes it fail safely.

## sync-staging.yml

Keeps `staging` from falling behind `main`. CMS saves and hotfixes land on `main` directly, so
after every push to `main` it merges `main` into `staging`: a fast-forward when `staging` has
nothing new, otherwise a merge commit, `chore: merge main into staging`. Promotions then stay
fast-forwards. It runs one at a time (`sync-staging`) and has 10 minutes.

- It can't loop and never deploys Production: it runs only on pushes to `main` and only ever
  pushes `staging`, whose CI then redeploys Staging. After a promotion, `staging` already
  contains `main`, so it does nothing.
- It pushes with the same deploy key from the `release` environment, for the same reason as
  `promote.yml`, and never forces.
- When someone pushes to `staging` between its fetch and its push, it tries again, up to three
  times. On a merge conflict it aborts and fails with the commands an admin runs to resolve it
  locally ([`docs/gitflow.md`](../gitflow.md#content-cms-saves-go-straight-to-main)).
