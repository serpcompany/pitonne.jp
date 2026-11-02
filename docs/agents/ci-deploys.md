# Deploys, promotion and the Staging sync

How `deploy.yml`, `promote.yml` and `sync-staging.yml` work, and why. Which push deploys what is
in [`ci.md`](ci.md#ciyml) and [`docs/gitflow.md`](../gitflow.md#what-ci-deploys);
`tools/checks/deploy-workflows.test.ts` holds these workflows to what this doc says.

## deploy.yml

A reusable workflow that builds the export, uploads it to Cloudflare Pages and smoke-tests the
environment. Run by hand (Actions → Deploy → Run workflow), which is the owner's to do and never an
agent's, it uploads the current tip of the branch it runs from, `main` to Production or `staging`
to Staging, and skips CI's checks, so it ships whatever is there. The
job has 40 minutes: the smoke tests' worst case and ten more ([Retries](#smoke-tests)). It receives one secret, `CLOUDFLARE_API_TOKEN`; the release deploy key never
reaches a deploy or a preview. It grants `deployments: write`, so wrangler can record a GitHub
deployment, and `packages: read` for the install ([`ci.md`](ci.md#installing-the-private-package)).

- **Concurrency:** one group per target and environment (`deploy-pages-production`,
  `deploy-pages-staging`, `deploy-pages-pr-<n>`), never cancelled. A running deploy is never
  cancelled, a Staging push never cancels a Production deploy, and GitHub keeps only the newest
  queued deploy of a group.
- **Resolve environment:** Production deploys only from `main`, Staging only from `staging`, and a
  preview only for a pull request, to its own `pr-<n>` alias, so nothing else can reach the
  Production or Staging aliases. It sets `DEPLOY_ENV`, `NEXT_PUBLIC_DEPLOY_ENV` and the Pages
  branch.
- **Choose the commit to deploy** (Staging and Production): deploys queue out of commit order,
  since a CMS save deploys at once while a code commit waits for its checks. So, inside the
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
- **Build and verify:** it restores `.next/cache` for its environment, runs `pnpm build`, then
  `pnpm audit:out`, the one check of the export ([`seo.md`](seo.md#the-audits)). With the
  `DEPLOY_ENV` the job resolved, it also checks the environment's own output: Production's
  `robots.txt` doesn't disallow crawling and its `_headers` send no `noindex`; Staging's `_headers`
  send no `noindex` and its `robots.txt` disallows `*`, names `AhrefsSiteAudit` and lists Staging's
  sitemap; a preview's do both (`scripts/audit-out.test.mjs` audits each environment's build as
  each other one). CI's `test` runs the same command on its production build, with no
  `DEPLOY_ENV`, so without these. This build is the commit's build check on a push: CI's `test`
  builds Production for the browser journeys and Lighthouse, and skips that build when the tree
  passed them before ([`ci.md`](ci.md#one-build-per-commit-and-environment)).
- **Upload:** `wrangler pages deploy out` to the `pitonne-jp` project with the branch and commit.
  wrangler-action finds wrangler 4.103.0, the version `package.json` pins, already installed, so
  it installs nothing. For Staging and Production it passes the job's token so GitHub records a
  deployment; for previews the Cloudflare Pages app comments on the pull request instead.

## Smoke tests

The checks of a page's content send the smoke-test header, so a deployment URL is served instead
of redirected; the redirect and password checks leave it off.

- **Production:** `scripts/smoke-canonical-host.mjs <deployment-url>` checks the host redirects
  ([`hosts.md`](hosts.md)): each non-canonical host gives one 308 to https://pitonne.jp with the
  path and query, a `_redirects` rule is folded into that hop, a file URL with a slash gives one
  308 to the file, and behind the Function the Keystatic app, a legacy 301, the sitemap's content
  type and a 404 still come from the static files. Then
  `scripts/smoke-environment.mjs production` on `pitonne-jp.pages.dev` and
  https://pitonne.jp: `/` and `/ja/` answer 200 without `noindex`, `robots.txt` allows crawling
  and lists the sitemap index, a missing page, `/404/` and `/_not-found/` answer 404 with one
  `noindex` tag and a link home, the sitemap index loads, and no response asks for a password.
  Not on the deployment URL: Cloudflare sends `noindex` on every `<hash>.pitonne-jp.pages.dev`,
  Production's too.
- **Staging:** `smoke-environment.mjs staging` on the `staging` alias, the deployment URL and
  https://staging.pitonne.jp. On each, `/` and `/ja/` answer 200 with `noindex` and a Staging
  canonical, `robots.txt` disallows crawling, and a missing page, `/404/` and `/_not-found/`
  answer 404. On staging.pitonne.jp, without the header: `/`, `/ja/` and `/favicon.ico` answer
  401 with a Basic challenge, `no-store` and `noindex`; with the password, `/` and `/ja/` answer
  200 with no `noindex` and a Staging canonical; `/robots.txt` answers 200, disallows `*` and lists
  Staging's sitemap. On the other two, `/contact` without the header answers 308 to
  https://staging.pitonne.jp/contact/. On the deployment URL, that 308 proves the branch variable
  reached the Function ([`environments.md`](environments.md#the-staging-gate)): without it, the
  URL answers as Production's do.
- **Previews:** `smoke-environment.mjs preview` on the `pr-<n>` alias and the deployment URL: the
  page, `robots.txt` and 404 checks, with `noindex` in both the header and the meta tag.

The branded hosts sit behind Bot Fight Mode, which may challenge the runner: a challenge there is
a warning, any other wrong answer still fails. The pages.dev hosts are always checked. The gate's
own checks, the 401 without the password and the 200 with it, run only on staging.pitonne.jp, a
branded host, so a run whose gate checks were challenged proves nothing about the gate.

**Retries.** A new deployment takes a while to replace the old one at the edge, and a brand-new
deployment URL can answer 404 for some paths for over a minute while others work (seen on
2026-10-06, [issue #109](https://github.com/serpcompany/pitonne.jp/issues/109)). Each request
times out after 10 seconds (`REQUEST_TIMEOUT_MS`) and retries 5 seconds later, so a try that
hangs costs 15 seconds.

- `smoke-environment.mjs` keeps retrying each origin's checks until 120 seconds after its first
  check started, with at least 2 tries each.
- `smoke-canonical-host.mjs` gives its first check 12 tries, every later one 2, and the deployment
  URL's checks until 120 seconds after the first of them started.
- If every request hung until its timeout, an origin's first check would take 130 seconds (9
  tries), the host checks' first 175 (12 tries), and each later one 25 (2 tries). Production's
  smoke tests would then take 23 minutes 10 seconds: 13 minutes 50 seconds for the host checks
  (12 on the pages.dev and branded hosts, 11 on the deployment URL) and 4 minutes 40 seconds for
  each of the environment checks' two origins (7 checks each). Staging's would take 16 minutes 5
  seconds, and a preview's 8 minutes 30 seconds.
- The job's 40 minutes leave ten for checkout, install, build and upload after Production's worst
  case; those took about a minute and a half on 2026-10-27. `tools/checks/deploy-timeout.test.ts`
  runs both scripts with every request timing out and fails if the limit stops leaving that.

**A late deploy, 2026-10-27.** Run 40513860827, a promotion push to `main`, had GitHub create its
deploy job 19 minutes after its only prerequisite finished. No concurrency group, queue or
environment rule held it, and in 13 other push runs the deploy started 2 to 60 seconds after its
prerequisites. It was a delay on GitHub's side, so nothing in the workflows changed.

## promote.yml

Promotes Staging to Production by fast-forwarding `main` to `staging`, so `main` receives exactly
the commits tested and deployed on Staging, never a squash. The push to `main` runs CI there,
which deploys at once, since the commit already passed its checks. It runs one at a time
(`promote-production`) and has 10 minutes.

- It refuses when `main` has commits `staging` lacks (Sync staging hasn't caught up, or failed on
  a conflict), and when the `staging` commit hasn't passed each of CI's checks (`CHECKS` in the
  step: `verify`, `test`, `e2e` and `lighthouse`), all in one of CI's runs for its push to
  `staging`, as `scripts/ci-passed.mjs` reads CI's jobs ([`ci.md`](ci.md#ciyml)); when GitHub
  can't be asked, it refuses too. When `main` is already at `staging`, it succeeds with nothing
  to promote.
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
