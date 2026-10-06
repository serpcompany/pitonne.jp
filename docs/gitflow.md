# Git flow and deployment

pitonne.jp follows the SERP [git workflow](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/git-workflow.md)
and [environment configuration](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/environment-configuration.md)
standards, with one documented exception: CMS saves go straight to Production.

| Branch | Environment | URL | Indexable |
| --- | --- | --- | --- |
| `staging` (the base branch) | Staging | https://staging.pitonne.jp (backup: https://staging.pitonne-jp.pages.dev) | No |
| `main` | Production | https://pitonne.jp | Yes |
| PR `#<n>` | PR preview | https://pr-<n>.pitonne-jp.pages.dev | No |

## Code: issue → `staging` → `main`

1. Branch from `origin/staging` as `issue-<n>-<slug>`, in its own worktree:
   `git worktree add -b issue-<n>-<slug> ../pitonne.jp-worktrees/issue-<n>-<slug> origin/staging`.
2. Open a PR into **`staging`** (`gh pr create --base staging`). GitHub's default branch is still `main` (see
   [Why `main` stays the default branch](#why-main-stays-the-default-branch)), so pick the base explicitly.
   - The `staging` ruleset requires a PR, the `test` check, an up-to-date branch, and squash merging.
   - Same-repository PRs get a Cloudflare Pages preview at `pr-<n>.pitonne-jp.pages.dev` after the `test` job passes.
     New commits replace it, and the Cloudflare Pages app keeps one PR comment with the URL. Previews build with
     `DEPLOY_ENV=preview`: robots.txt disallows everything and pages send noindex. Forked PRs get no secrets and no
     preview.
3. The owner squash-merges into `staging`. CI tests the push and, once `test` passes, deploys Staging and smoke-tests
   it (robots.txt disallows everything; pages send `X-Robots-Tag: noindex` and a noindex meta tag).
4. QA on https://staging.pitonne.jp.
5. **Promote** `staging` to `main` by fast-forward, never by squashing, so `main` receives exactly the commits tested on
   Staging. Either:
   - run **Actions → Promote to Production → Run workflow** (`.github/workflows/promote.yml`). It refuses when `main`
     has commits `staging` lacks or when the `staging` commit hasn't passed `test`; or
   - as an admin: `git fetch origin && git push origin origin/staging:main`. The admin bypass skips every `main` rule,
     including the required `test` check, so check first that `staging`'s latest CI run is green.
6. The push to `main` runs CI. The promoted commit already passed `test` on `staging`, so it deploys to Production
   right away (no retest wait), then gets smoke-tested.

**Hotfixes** follow the same flow with a PR into `main`. Sync staging (below) merges them back into `staging` right
away.

**Diverged `main`** (Sync staging failed, so `main` has commits `staging` lacks): resolve the sync first (below), then
promote by fast-forward. Merge commits are allowed on `main` for a `staging` → `main` PR, as the standard requires, but
that PR can't merge until `staging` is up to date with `main` (the `main` ruleset requires up-to-date branches), and
once it is, a fast-forward promotion works anyway. So don't reach for the merge button: fix the sync, then promote.

**Up-to-date branches:** both rulesets require PR branches to be up to date. Every CMS save reaches `staging` through
Sync staging, so open PRs fall behind often; use "Update branch" (or `git merge origin/staging`) and let CI run again
before merging.

## Content: CMS saves go straight to `main`

Keystatic Cloud commits CMS saves directly to `main` (its GitHub app bypasses the `main` ruleset), so client content is
live within minutes without waiting for a promotion. This is the documented exception to "code flows staging → main":
it applies only to the files the CMS edits (`content/blog/`, `content/blog-categories/`, `public/images/content/blog/`).

**Sync staging** (`.github/workflows/sync-staging.yml`) runs after every push to `main` and merges `main` into
`staging`: a fast-forward when `staging` has nothing new, a merge commit (`chore: merge main into staging`) otherwise.
So `staging` never falls behind and promotions stay fast-forwards.

- It can't loop: it runs only on pushes to `main` and only ever pushes `staging`. After a promotion, `staging` already
  contains `main`, so it does nothing.
- It never deploys Production. Its push to `staging` runs CI there, which redeploys Staging with the new content.
- On a merge conflict it fails and changes nothing. An admin resolves it locally:
  `git fetch origin && git switch -C staging origin/staging && git merge origin/main && pnpm check && git push origin staging`.

## What CI deploys

`.github/workflows/ci.yml` runs on every PR and every push to `staging` and `main`; the build, upload and smoke tests
live in `.github/workflows/deploy.yml`, which CI calls.

| Push | Deploys | Waits for `test`? |
| --- | --- | --- |
| Only draft blog posts changed | Nothing (the built site is unchanged) | – |
| Only CMS content changed | Now (`Deploy content` job), as soon as the build succeeds | No, never |
| A commit that already passed `test` (a promotion of a tested `staging` commit) | Now (`Deploy content` job) | No |
| Any other change | After `test` passes on this run (`Deploy` job) | Yes |

- **Content is never blocked by `test`.** A CMS save goes live as soon as it builds, whatever `test` says about it or
  any earlier commit. A failing `test` on `main` alerts instead: the run is red, and the `alert` job opens (or comments
  on) an issue titled "CI is failing on main" that mentions @devinschumacher. Close it once `main` is fixed.
- **Code is gated before `main`.** Code reaches `main` only through promotion or a hotfix PR, both of which passed
  `test` first, and a code push's own deploy waits for `test` on `main`. If that post-merge `test` fails, the code
  still goes live with the next CMS save, because every deploy uploads the tip and content is never held back; the
  alert issue is the signal to fix or revert it. A hotfix that breaks `pnpm build` itself stops all deploys until it is
  reverted.
- **No stale deploys.** Deploys use `concurrency: deploy-pages-<environment>` (`deploy-pages-production`,
  `deploy-pages-staging`, `deploy-pages-pr-<n>`) with `cancel-in-progress: false`: a running deploy is never cancelled,
  and a Staging push never cancels a Production deploy. Queued deploys run in the order they were *queued*, not commit
  order (a code commit queues only after its `test`), and GitHub keeps only the newest queued one. So before building,
  `scripts/deploy-target.mjs` always picks the branch tip at that moment. Every deploy publishes everything committed
  so far: rapid CMS saves all go live, and an older commit never overwrites a newer one. There is no "already live"
  skip (GitHub deployment records name the branch, not the uploaded commit, so they can't tell what is live), and
  redeploying the same tree is harmless. A failed Production deploy also opens the "CI is failing on main" issue.
- Production deploys only from `main` and Staging only from `staging`; `deploy.yml` refuses anything else, so no PR can
  reach the `main` or `staging` aliases.
- **Manual redeploy:** Actions → Deploy → Run workflow, from `main` (Production) or `staging` (Staging). It skips the
  `test` gate, so only redeploy a commit CI already passed.

### Environment configuration

`DEPLOY_ENV` (and `NEXT_PUBLIC_DEPLOY_ENV`) is set per environment by `deploy.yml`: `production`, `staging` or
`preview`. Anything but `production` is non-indexable (the safe default, also for local builds):

- `robots.txt` disallows everything (`app/robots.ts`); production allows crawling except `/keystatic/` and lists
  `https://pitonne.jp/sitemap-index.xml`.
- Pages have a `noindex, nofollow` meta robots tag (`deploymentRobots()` in `lib/seo.ts`), and analytics are off.
- `pnpm build` adds `X-Robots-Tag: noindex, nofollow` for every path to `out/_headers`
  (`scripts/environment-headers.mjs`). Cloudflare adds that header on `*.pages.dev` aliases by itself, but not on
  `staging.pitonne.jp`. `pnpm audit:out` fails when robots.txt and `_headers` disagree. That check (and the deploy's
  verify step) treats any `X-Robots-Tag: noindex` in `_headers` as site-wide, so a future path-scoped noindex rule in
  `public/_headers` (for example for `/keystatic/*`) needs those checks narrowed first.

### Smoke tests after each deploy

- **Production:** `scripts/smoke-canonical-host.mjs` (below) and `scripts/smoke-environment.mjs production` on
  `pitonne-jp.pages.dev` (with the smoke-test header) and https://pitonne.jp: `/` and `/ja/` return 200 without
  noindex, robots.txt allows crawling and lists the sitemap index, and the sitemap index loads. Not on the hash
  deployment URL: Cloudflare sends `X-Robots-Tag: noindex` on every `<hash>.pitonne-jp.pages.dev`, Production's too.
- **Staging:** `scripts/smoke-environment.mjs staging` on the `staging` alias, the deployment URL and
  https://staging.pitonne.jp: robots.txt has `Disallow: /`, and `/` and `/ja/` send `X-Robots-Tag: noindex` and a
  noindex meta tag.
- **PR previews:** the same checks as Staging, on the `pr-<n>` alias and the deployment URL.

The branded domains sit behind Bot Fight Mode, which may challenge the CI runner; there, a challenge is a warning
rather than a failure. The pages.dev hosts are always checked.

### Hosts

- https://pitonne.jp is Production's canonical host. `www.pitonne.jp` redirects to apex (a Cloudflare zone redirect
  rule, which should answer 308).
- `pitonne-jp.pages.dev`, its branch aliases and its deployment URLs return 308 to the same path and query on
  `https://pitonne.jp` (`functions/_middleware.ts`). The `pr-<n>` and `staging` aliases, and requests with the
  `x-pitonne-smoke-test` header, are served as is. A `_redirects` rule is folded into the same hop
  (`pitonne-jp.pages.dev/en/` → `https://pitonne.jp/`). `public/_routes.json` keeps static files (`/_next/*`,
  `/images/*`, icons) off the Function; those paths still answer 200 on pages.dev. After each production deploy,
  `scripts/smoke-canonical-host.mjs` checks these redirects, and that `_redirects`, `_headers` and 404s still work
  behind the Function.
- On every host served as is, a file URL with a trailing slash returns one 308 to the file, query kept
  (`/sitemap-pages.xml/` → `/sitemap-pages.xml`, issue #92). The slashed form of a path `_routes.json` excludes
  (`/images/x.jpg/`, `/favicon.ico/`) never reaches the Function and stays 404.
- https://staging.pitonne.jp is a custom domain of the `pitonne-jp` Pages project that serves the `staging` branch
  alias.

## Why `main` stays the default branch

The standard makes `staging` the base branch for PRs; it doesn't require it to be GitHub's default branch, and changing
the default would break two things:

- The `main` ruleset targets `~DEFAULT_BRANCH`. Changing the default would move Production's protection onto `staging`
  and leave `main` unprotected, unless the ruleset first targets `refs/heads/main` explicitly.
- Keystatic Cloud opens on the repository's default branch, and editors save to the branch shown in the CMS. With
  `staging` as the default, saves would land on `staging` and stop going live.

So `main` stays the default branch, and `staging` is the documented PR base (`gh pr create --base staging`).

## Repository settings this flow needs

- Squash merging for PRs; merge commits allowed on `main` only, for the occasional diverged promotion. Rebase merging
  off. Default squash message: PR title, blank body.
- `main` and `staging` rulesets: require a PR, the `test` check and up-to-date branches; block deletion and force
  pushes, for everyone except the bypass actors. Bypass actors: the Keystatic Cloud app (CMS saves), organization
  admins (the promotion command and conflict resolution), and deploy keys (`RELEASE_DEPLOY_KEY`, used by Sync staging
  and Promote to Production). A bypass skips **every** rule of the ruleset, not just the PR rule: required checks,
  up-to-date, force-push and deletion protection. The workflows never force-push and check `test` themselves; an admin
  pushing by hand has to do the same.
- Secrets:
  - `CLOUDFLARE_API_TOKEN` (repository secret): Cloudflare account API token with Account > Cloudflare Pages > Edit
    permission. Deploy jobs and PR previews receive only this secret.
  - `RELEASE_DEPLOY_KEY` (secret of the `release` environment, whose deployment branches are limited to `main` and
    `staging`): the private half of a deploy key with write access. Only Sync staging and Promote to Production use
    that environment. Workflows push with it, not with `GITHUB_TOKEN`, because a `GITHUB_TOKEN` push doesn't start CI,
    so the pushed branch wouldn't deploy.
- Cloudflare Pages doesn't run its own Git builds for this project; GitHub Actions direct-uploads `out/`.

Lighthouse CI keeps the best-practices threshold at `0.95`. Collection skips only the accepted `third-party-cookies` best-practices audit caused by the current LeadConnector integration (in addition to the pre-existing color-contrast exclusion); inspector issues, console errors, and all other best-practices audits remain enabled. Removing the underlying cookies is tracked separately in [GitHub issue #51](https://github.com/serpcompany/pitonne.jp/issues/51).
