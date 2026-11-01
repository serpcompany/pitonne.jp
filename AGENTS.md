# AGENTS.md

Stage: ship

pitonne.jp is a live, bilingual (English and Japanese) clinic website with real visitors. Only the
owner adds or changes the `Stage:` line. There is no `Agents may merge` line, so agents never
merge.

This file only routes: open the doc that matches the task. SERP's
[engineering standards](https://github.com/serpcompany/serp/tree/main/docs/engineering/standards)
apply; where this repository differs, the last section says so, and it wins.

## Setup

- Node 24 (`.node-version`) and the pnpm version `packageManager` names in `package.json`.
- `@serpcompany/verify` comes from GitHub Packages. The committed `.npmrc` sends the
  `@serpcompany` scope there, and each machine needs a personal access token (classic) with
  `read:packages` in its own `~/.npmrc`, as `//npm.pkg.github.com/:_authToken=<token>`. Never
  commit the token.
- `pnpm install --frozen-lockfile`, which also installs lefthook's git hooks.

## Commands

- **Inner loop:** `pnpm exec vitest related --run <files>`, `pnpm exec vitest run <test-file>`,
  `pnpm typecheck`, `pnpm exec biome check <files>`, and `pnpm verify [checks] [paths]` for SERP's
  shared checks on some paths.
- **The site:** `pnpm dev` serves http://localhost:3000 (and `/ja/`); `pnpm cms` serves Keystatic
  on your local files at http://127.0.0.1:3000/keystatic.
- **Finish gate:** `pnpm check`, once per state: `pnpm verify` first, then lint, typecheck, tests,
  `audit:meta`, the production build, `audit:out` and `audit:seo`, in that order, in about two
  minutes.
- **Git hooks:** before a commit, Biome and the comment, size and secrets checks on the staged
  files; before a push, the full `serp-verify`, and `pnpm lint`, `pnpm typecheck` and `pnpm test`.
- **Agent hooks:** `.claude/settings.json` checks each file an agent edits and the turn's changes
  before it ends, and asks before deploys, pushes to `main` or `staging`, and GitHub writes
  ([`verification.md`](docs/agents/verification.md#agent-hooks)).
- **CI:** `ci.yml` lists those steps itself, plus Lighthouse, and doesn't run `pnpm verify` yet.
  CI on the final commit is the record ([`ci.md`](docs/agents/ci.md)).
- **Proof in the running site:** the [`verify-site`](.claude/skills/verify-site/SKILL.md) skill runs
  the dev server, the local CMS or the production-like preview, and checks it with `curl -I` and
  screenshots.
- What each level runs, how to wait, and the evidence each kind of change needs:
  [`verification.md`](docs/agents/verification.md).

## Git workflow

- The base branch is `staging` (https://staging.pitonne.jp); `main` is Production
  (https://pitonne.jp) and receives code only by fast-forward promotion. GitHub's default branch
  is still `main`, so open a pull request with `gh pr create --base staging`.
- One issue, one branch (`issue-<n>-<slug>`, in its own worktree), one pull request with a
  Conventional Commit title, starting `Closes #<n>`, with each evidence level reported apart.
- A fresh agent reviews once CI is green. The owner merges (squash) and promotes; agents do
  neither. Before starting and when handing back, check the latest runs on both branches.
- Agents run `gh` and push only as the organization's app
  ([Agent GitHub Identity](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/agent-harness/agent-github-identity.md)).
- The whole flow, what CI deploys, and the repository settings: [`gitflow.md`](docs/gitflow.md).

## Where things are

| Doc | Read it for |
| --- | --- |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | How the site is built and served, from content to the deployed environments |
| [`CONTEXT.md`](CONTEXT.md) | Terms that are easy to confuse, such as canonical route, promotion and the content fast path |
| [`content.md`](docs/agents/content.md) | Text and dictionaries, Japanese copy, services and legal pages, areas, videos and business data |
| [`docs/i18n.md`](docs/i18n.md) | How the two locales are built: routes, dictionaries, the data layer, adding a page |
| [`blog.md`](docs/agents/blog.md) | Blog posts, their frontmatter and categories, and Keystatic |
| [`docs/cms.md`](docs/cms.md) | The editors' guide to the CMS, and its publishing flow |
| [`seo.md`](docs/agents/seo.md) | URLs, metadata, structured data, sitemaps and the SEO audits |
| [`environments.md`](docs/agents/environments.md) | `DEPLOY_ENV`, what each environment builds, the Staging gate, PR previews |
| [`hosts.md`](docs/agents/hosts.md) | The hosts, their redirects and the Pages Function |
| [`code.md`](docs/agents/code.md) | Where code lives, the layers, conventions, tests and SERP's checks |
| [`exceptions.md`](docs/agents/exceptions.md) | Each lint rule turned off in a config file, and why |
| [`verification.md`](docs/agents/verification.md) | Commands, the finish gate, git hooks, evidence, and the tests that hold the rules |
| [`ci.md`](docs/agents/ci.md) | Each GitHub Actions workflow: what starts it, what it runs, and why |
| [`gitflow.md`](docs/gitflow.md) | Branches, promotion, CMS saves, deploys and the repository settings |
| [`docs/adr/`](docs/adr/) | Decisions and their reasons: Keystatic for the blog, no Payload on D1, the static export, the layout |

Staging's password gate exempts only smoke-test header requests and `/robots.txt`; the site
receives no webhooks ([`environments.md`](docs/agents/environments.md#the-staging-gate)).

## Where this differs from SERP's standards

- **A static export on Cloudflare Pages,** not Workers through OpenNext
  ([ADR 0003](docs/adr/0003-static-export-on-cloudflare-pages.md)).
- **Code in `src/` at the root,** with `content/`, `public/` and `keystatic.config.ts` beside it,
  not in `apps/web/` ([ADR 0004](docs/adr/0004-repository-layout.md)).
- **CMS saves go straight to Production:** Keystatic commits to `main`, which deploys without a
  promotion and without waiting for `test`
  ([`gitflow.md`](docs/gitflow.md#content-cms-saves-go-straight-to-main),
  [`cms.md`](docs/cms.md#for-developers)).
- **GitHub's default branch stays `main`** while pull requests target `staging`
  ([`gitflow.md`](docs/gitflow.md#why-main-stays-the-default-branch)).
- **No translation review fields:** Japanese that an AI wrote is flagged in the pull request for
  native review instead ([`content.md`](docs/agents/content.md#japanese-copy)).
- **shadcn's `new-york` style on Radix,** not `base-nova` on Base UI
  ([`code.md`](docs/agents/code.md#ui-kit)).
- **No Sentry:** error reporting waits for the owner's decision
  ([`environments.md`](docs/agents/environments.md#what-each-environment-builds)).
- **Trailing slashes:** on Production and previews, the slashed form of a path
  `public/_routes.json` excludes answers 404, and `/keystatic/*` is left as requested
  ([`hosts.md`](docs/agents/hosts.md#exceptions-to-the-trailing-slash-standard)).
