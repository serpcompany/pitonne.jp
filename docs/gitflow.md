# Git flow and deployment

pitonne.jp follows the SERP [git workflow](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/git-workflow.md)
and [environment configuration](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/environment-configuration.md)
standards, except where [`agents/deviations.md`](agents/deviations.md#branches-deploys-and-ci)
says otherwise: among them, CMS saves go straight to Production, and GitHub's default branch stays
`main` ([below](#why-main-stays-the-default-branch)).

| Branch | Environment | URL | Indexable |
| --- | --- | --- | --- |
| `staging` (the base branch) | Staging | https://staging.pitonne.jp, behind a password (backup: https://staging.pitonne-jp.pages.dev, which redirects there) | Yes, to whoever has the password |
| `main` | Production | https://pitonne.jp | Yes |
| PR `#<n>` | PR preview | https://pr-<n>.pitonne-jp.pages.dev | No |

What each environment builds, and the Staging password gate, are in
[`agents/environments.md`](agents/environments.md); the hosts and their redirects in
[`agents/hosts.md`](agents/hosts.md); each workflow in [`agents/ci.md`](agents/ci.md).

## Code: issue → `staging` → `main`

An agent runs `gh` and pushes only as the organization's app
([Agent GitHub Identity](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/agent-harness/agent-github-identity.md)).

1. Every change starts from a GitHub issue.
2. Branch from `origin/staging` as `issue-<n>-<slug>`, in a worktree of its own, not in the
   owner's checkout:
   `git worktree add -b issue-<n>-<slug> ../pitonne.jp-worktrees/issue-<n>-<slug> origin/staging`.
3. Open a PR into **`staging`** (`gh pr create --base staging`) with a Conventional Commit title.
   GitHub's default branch is still `main`, so pick the base explicitly. The body starts with
   `Closes #<n>`, says what changed and what was left out, and reports evidence levels separately
   ([`agents/verification.md`](agents/verification.md#evidence)). Hotfixes are the only PRs into
   `main`. The `Pull request` workflow checks the title, the issue link, a test with every fix,
   and that the text names no local path
   ([`agents/ci-pull-requests.md`](agents/ci-pull-requests.md#pull-request)).
   - The `staging` ruleset requires a PR, the `test` check, an up-to-date branch, and squash
     merging. CI also runs `verify` on every PR; the owner adds it, and the pull request checks,
     to the required checks once they're on both branches
     ([`agents/ci.md`](agents/ci.md#checks-a-merge-waits-for)).
   - Same-repository PRs into `staging` or `main` get a Cloudflare Pages preview at
     `pr-<n>.pitonne-jp.pages.dev` once the `test` job passes. New commits replace it, and the Cloudflare Pages app keeps one PR comment
     with the URL. Previews build with `DEPLOY_ENV=preview`: robots.txt disallows everything and
     pages send `noindex`. Forked PRs get no secrets and no preview.
4. The `Code review` workflow has Claude review each push once `verify` and `test` pass, and
   posts each finding on its line ([`agents/ci-pull-requests.md`](agents/ci-pull-requests.md#code-review)).
   Until it runs (it needs the `CLAUDE_CODE_OAUTH_TOKEN` secret), a fresh agent reviews the PR
   once CI is green. Reply to every finding as fixed (with the
   commit) or declined (with the reason). Only blocking findings start another round. Record the
   outcome in the PR, for example "Review: 1 round, clean".
5. The owner squash-merges into `staging`, one PR at a time, each up to date with `staging`. CI
   tests the push and, once `verify`, `test`, `e2e` and `lighthouse` pass, deploys Staging and
   smoke-tests it: without the password it answers 401, and with it, pages are indexable and
   carry Staging canonicals.
6. QA on https://staging.pitonne.jp, with the password `stagingpassword`.
7. The owner **promotes** `staging` to `main` by fast-forward, never by squashing, so `main`
   receives exactly the commits tested on Staging. Agents never promote. Either:
   - run **Actions → Promote to Production → Run workflow** (`.github/workflows/promote.yml`). It
     refuses when `main` has commits `staging` lacks or when the `staging` commit hasn't passed
     every check (`verify`, `test`, `e2e` and `lighthouse`); or
   - as an admin: `git fetch origin && git push origin origin/staging:main`. The admin bypass skips
     every `main` rule, including the required `test` check, so check first that `staging`'s
     latest CI run is green.
8. The push to `main` runs CI. The promoted commit already passed every check on `staging`, so
   it deploys to Production right away (no retest wait), then gets smoke-tested.

**Hotfixes** follow the same flow with a PR into `main`. Sync staging (below) merges them back into
`staging` right away.

**Diverged `main`** (Sync staging failed, so `main` has commits `staging` lacks): resolve the sync
first (below), then promote by fast-forward. Merge commits are allowed on `main` for a `staging` →
`main` PR, as the standard requires, but that PR can't merge until `staging` is up to date with
`main` (the `main` ruleset requires up-to-date branches), and once it is, a fast-forward promotion
works anyway. So don't reach for the merge button: fix the sync, then promote.

**Up-to-date branches:** both rulesets require PR branches to be up to date. Every CMS save
reaches `staging` through Sync staging, so open PRs fall behind often; use "Update branch" (or
`git fetch origin && git merge origin/staging`; don't rebase a pushed branch) and let CI run again
before merging.

**Before starting work, and again when handing back,** look at the latest runs:
`gh run list --branch staging --limit 5` and `gh run list --branch main --limit 5`. If CI, a
deploy or Sync staging failed, fixing it comes first.

## Content: CMS saves go straight to `main`

Keystatic Cloud commits CMS saves directly to `main` (its GitHub app bypasses the `main` ruleset),
so client content is live within minutes without waiting for a promotion or any check. With
hotfixes, these are the only changes that reach `main` without passing through `staging`, and they
touch only the files the CMS edits (`content/blog/`, `content/blog-categories/`,
`public/images/content/blog/`).

**Sync staging** (`.github/workflows/sync-staging.yml`) runs after every push to `main` and merges
`main` into `staging`: a fast-forward when `staging` has nothing new, a merge commit
(`chore: merge main into staging`) otherwise. So `staging` never falls behind and promotions stay
fast-forwards.

- It can't loop: it runs only on pushes to `main` and only ever pushes `staging`. After a
  promotion, `staging` already contains `main`, so it does nothing.
- It never deploys Production. Its push to `staging` runs CI there, which redeploys Staging with
  the new content.
- On a merge conflict it fails and changes nothing. An admin resolves it locally:
  `git fetch origin && git switch -C staging origin/staging && git merge origin/main && pnpm check && git push origin staging`.

## What CI deploys

`.github/workflows/ci.yml` runs on every PR and every push to `staging` and `main`; the build,
upload and smoke tests live in `.github/workflows/deploy.yml`, which CI calls.

| Push | Deploys | Waits for the checks? |
| --- | --- | --- |
| Only draft blog posts changed | Nothing (the built site is unchanged) | – |
| Only CMS content changed | Now (`Deploy content` job), as soon as the build succeeds | No, never |
| A commit that already passed every check (a promotion of a tested `staging` commit) | Now (`Deploy content` job) | No |
| Any other change | After this run's checks pass (`Deploy` job) | Yes, for this run's deploy |

Every row uploads the branch tip, so code already on the branch also goes live with the next
content deploy, even before its own checks finish.

- **Content is never blocked by the checks.** A CMS save goes live as soon as it builds, whatever
  the checks say about it or any earlier commit. A failing check on `main` alerts instead: the run
  is red, and the `alert` job opens (or comments on) an issue titled "CI is failing on main" that
  mentions the owner's account. Close it once `main` is fixed.
- **Code is gated before `main`.** Code reaches `main` only through promotion or a hotfix PR, both
  of which passed the checks first, and a code push's own deploy waits for `verify`, `test`,
  `e2e` and `lighthouse` on `main`. If those post-merge checks fail, the code still goes live
  with the next CMS save, because every deploy uploads the tip and content is never held back;
  the alert issue is the signal to fix or revert it. A hotfix that breaks `pnpm build` itself
  stops all deploys until it is reverted.
- **No stale deploys.** Deploys of one environment run one at a time and upload the branch tip
  as it is when they run, so an older commit never overwrites a newer one and rapid CMS saves all
  go live ([`agents/ci.md`](agents/ci.md#deployyml)). A failed Production deploy also opens the
  "CI is failing on main" issue.
- Production deploys only from `main` and Staging only from `staging`; `deploy.yml` refuses
  anything else, so no PR can reach the `main` or `staging` aliases.
- **Manual redeploy, the owner's to run:** Actions → Deploy → Run workflow, from `main`
  (Production) or `staging` (Staging). It uploads that branch's current tip and waits for no
  check, so it ships whatever is there, checked or not. Agents never run it.

## Why `main` stays the default branch

The standard makes `staging` the base branch for PRs and also GitHub's default branch. Here the
default stays `main`, because Keystatic Cloud opens on the repository's default branch, and editors
save to the branch shown in the CMS. With `staging` as the default, saves would land on `staging`
and stop going live. (The `main` ruleset targets `refs/heads/main` by name, so changing the
default would leave its protection where it is.)

So `main` stays the default branch, and `staging` is the documented PR base
(`gh pr create --base staging`). The cost: GitHub acts on `Closes #<n>` only when a PR merges into
the default branch, so merging a PR into `staging` doesn't close its issue. The `Close issues`
workflow does it instead: when a PR into `staging` merges, it closes each issue of this repository
its description names with `Closes`, `Fixes` or `Resolves`, with a comment naming the PR
([`agents/ci-pull-requests.md`](agents/ci-pull-requests.md#close-issues)).

## Repository settings this flow needs

- Squash merging for PRs; merge commits allowed on `main` only, for the occasional diverged
  promotion. Rebase merging off. Default squash message: PR title, blank body.
- `main` and `staging` rulesets: require a PR, the `test` check and up-to-date branches; block
  deletion and force pushes, for everyone except the bypass actors. Bypass actors: the Keystatic
  Cloud app (CMS saves), organization admins (the promotion command and conflict resolution), and
  deploy keys (`RELEASE_DEPLOY_KEY`, used by Sync staging and Promote to Production). A bypass
  skips **every** rule of the ruleset, not just the PR rule: required checks, up-to-date,
  force-push and deletion protection. The workflows never force-push, and Promote to Production
  checks `staging`'s checks itself; an admin pushing by hand has to do the same.
- Secrets:
  - `CLOUDFLARE_API_TOKEN` (repository secret): Cloudflare account API token with Account >
    Cloudflare Pages > Edit permission. Deploy jobs and PR previews receive only this secret.
  - `RELEASE_DEPLOY_KEY` (secret of the `release` environment, whose deployment branches are
    limited to `main` and `staging`): the private half of a deploy key with write access. Only
    Sync staging and Promote to Production use that environment. Workflows push with it, not
    with `GITHUB_TOKEN`, because a `GITHUB_TOKEN` push doesn't start CI, so the pushed branch
    wouldn't deploy.
- Cloudflare Pages doesn't run its own Git builds for this project; GitHub Actions direct-uploads
  `out/`.
