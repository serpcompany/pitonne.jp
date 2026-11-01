# AGENTS.md

Stage: ship

pitonne.jp is a live site with real visitors. Only the owner adds or changes the `Stage:` line. There is no
`Agents may merge` line, so agents never merge.

Project rules (i18n, content, blog/CMS, SEO) are routed from [CLAUDE.md](CLAUDE.md). This file covers how to work,
following the SERP standards
[Verification Cadence](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/verification-cadence.md)
and [Git Workflow](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/git-workflow.md).

## Setup

Node 24 and pnpm 10.14.0 (`packageManager` in `package.json`), then `pnpm install --frozen-lockfile`.

## Commands and evidence

The finish gate is `pnpm check`. The inner-loop commands, what `pnpm check` runs, the git hooks and the evidence
each kind of change needs are in [docs/agents/verification.md](docs/agents/verification.md).

## Git workflow

The base branch is `staging`; `main` is Production and receives code only by promotion. The steps, from the issue
to the promotion, and what CI deploys, are in [docs/gitflow.md](docs/gitflow.md). The owner merges and promotes;
agents do neither. An agent runs `gh` only as the organization's app
([Agent GitHub Identity](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/agent-harness/agent-github-identity.md)).

## Rules

- Trailing-slash exceptions to the [URL trailing-slash standard](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/url-trailing-slash.md)
  are in [docs/agents/hosts.md](docs/agents/hosts.md#exceptions-to-the-trailing-slash-standard).
- Staging's password gate exempts only smoke-test header requests and `/robots.txt`; the site receives no webhooks
  ([docs/agents/environments.md](docs/agents/environments.md#the-staging-gate)).
- Don't rewrite reviewed Japanese copy ([docs/agents/content.md](docs/agents/content.md#japanese-copy)).
