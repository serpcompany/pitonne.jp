# Pull request checks, issue closing and code review

The workflows that read a pull request rather than build the site: `pull-request.yml`,
`close-issues.yml` and `code-review.yml`. The workflow list, and what a merge waits for, are in
[`ci.md`](ci.md).

## Pull request

`.github/workflows/pull-request.yml` runs SERP's four
[pull request checks](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/verification/pull-request-checks/README.md),
each as a job of its own, named for its check, so each can be required on its own:

- **`title`:** the title is a Conventional Commit: a type (`feat`, `fix`, `perf`, `refactor`,
  `docs`, `test`, `build`, `ci` or `chore`), an optional lowercase scope in brackets, an optional
  `!`, a colon, a space and the outcome.
- **`issue-link`:** the pull request closes the issue it finishes, or a line of its body says
  `No issue: <reason>`. Into `staging`, the base branch, the check reads the closing keywords
  (`Closes #12`, `Fixes #12`, `Resolves #12`, one line per issue) itself and asks GitHub that each
  names an issue of this repository: GitHub links keywords only on pull requests into the default
  branch, which is `main` ([`gitflow.md`](../gitflow.md#why-main-stays-the-default-branch)), and
  the [Close issues](#close-issues) workflow closes them at the merge. An issue already closed
  passes with a warning beside an open one, and fails when every issue named is closed, since the
  pull request then finishes none. One in another repository named beside one of this
  repository's passes with a warning, since it has to be closed by hand. Into `main`, it asks
  GitHub which issues it linked, three times, five seconds apart, since GitHub links them a
  moment after the event. A stacked pull request is told why nothing links until it's retargeted.
- **`fix-test`:** a pull request titled `fix:`, or from a `fix/` branch, changes a file that
  `verify.json`'s `tests.patterns` counts as a test: a `*.test.*` or `*.spec.*` file, or a smoke
  script (`scripts/smoke-*.mjs`). Deleted files don't count.
- **`text`:** the title and body name no path on someone's machine (a home folder, a temporary
  folder, a scratchpad, an agent's worktree), unless a line says why: `Local paths: <reason>`.

Pull requests from `dependabot[bot]` and `renovate[bot]` pass all four without being read;
release-please's, and promotions and merge-backs between this repository's `main` and
`staging`, pass `issue-link`. The organization's agent app is never exempt.

**Why it's vendored.** The checks are SERP's, and serp ships them as a composite action and in
`@serpcompany/verify`. This repository is public and serp is private, so it can't call serp's
action, and the packaged `issue-link` asks only GitHub's closing-issue links, which fail every
pull request into `staging`. So `tools/checks/pull-request.mjs` holds the four rules, word for word
from `@serpcompany/verify`'s `dist/pull-request/rules.js` but for three things: the `staging`
case; a closing keyword in a quote (`> Closes #12`, and a line that continues the quote with no
blank line between) or in a `<code>` tag, which counts for neither `issue-link` nor the closing;
and an `issue-link` that names only closed issues, which fails. Indented text still counts, since
it can be a list item's second line as well as code. Its tests are in
`tools/checks/pull-request.test.ts`. Update it when the package's rules change.

**How it runs.** Each job checks out that one script (and `verify.json` for `fix-test`) and runs
it with the runner's Node: no install, so it reports in seconds and works before the
repository's own install does. The script reads the pull request from the event file GitHub
writes, so a title or body never reaches a shell. It runs again when the title or body is edited,
and only reads (`contents`, `pull-requests` and `issues`). The alignment rule
`ci-pull-request-checks` stays failing, since it looks for serp's action
([`AGENTS.md`](../../AGENTS.md#where-this-differs-from-serps-standards)).

## Close issues

`.github/workflows/close-issues.yml` closes, when a pull request into `staging` merges, each issue
of this repository its description names with a closing keyword, with a comment that names the
pull request and its commit. GitHub does that only for pull requests into the default branch,
`main`, so without it every issue a merged pull request finishes would stay open.

- It starts on each push to `staging` and runs the pushed commit's own
  `tools/checks/close-issues.mjs`, checking out nothing else. For each pushed commit it asks
  GitHub which pull requests the commit belongs to, and keeps one only when it merged into
  `staging` as that very commit, as a squash merge does. A sync from `main`, a CMS save or a
  hotfix that comes back from `main` closes nothing.
- GitHub can take a moment to link a merge to its commit. When a commit's subject ends with
  `(#N)`, as a squash merge's does, and GitHub links no merge of #N into `staging` to it, it asks
  again, four times in all, ten seconds apart, then fails naming #N, so a missed close is a red
  run rather than a quiet one.
- It doesn't start on `pull_request_target`: since 2025-12-08 that event always runs the default
  branch's copy of a workflow, so it would run `main`'s, which has no such job until a promotion.
- Its job reads the pull requests and writes issues, with the job's own token.
- An issue already closed, a number that isn't an issue, and an issue in another repository are
  left alone, with a note in the log. When an issue can't be closed, it goes on with the rest,
  names each failure and fails at the end. It never sends the request that posts a comment twice,
  so no issue gets two. The keywords are read as `issue-link` reads them, in the same script, so
  what the check accepted is what closes.

## Code review

`.github/workflows/code-review.yml` reviews each push to a pull request with Claude, as SERP's
[code review](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/verification/code-review/README.md)
standard sets, after serp's own `review.yml`, which this repository can't call.

- **Whose:** every push to a pull request from this repository that isn't a draft, a person's or
  the `serp-agent` app's, including one that changes `code-review.yml`, which reviews it with its
  own copy. Drafts, forks (which get no secrets), `claude[bot]`, Dependabot and Renovate are
  skipped. A new push cancels the review of the one before.
- **Once the fast checks pass:** the review job waits, up to 20 minutes, for `verify` and `test`
  on the pull request's head commit, so no tokens go to a change that fails lint, types or the
  tests. When either fails it reviews nothing and says so; the next push that passes is reviewed.
  It doesn't wait for `e2e` or `lighthouse`, so findings arrive while they run.
- **The scripts** that gather the review's context, post its summary and judge it come from
  `@serpcompany/verify`'s `dist/review/`, from the package the default branch's lockfile pins: the
  job downloads that tarball with its own token and checks it against the lockfile's integrity
  hash before running it. Nothing the pull request changes runs with the job's token. The
  reviewer can write files, so after the review the job deletes the scripts and takes them again,
  checked against the hash it read before, for the steps that post. What it can't take again,
  the runner's Node and the actions those steps use, the reviewer could still reach.
- **The context:** `AGENTS.md`, `ARCHITECTURE.md`, `CONTEXT.md` and `docs/agents/code.md` as they
  are on the base branch; the change as one patch per file, since the last reviewed commit after
  the first review; the issue it closes, read from its closing keywords on a pull request into
  `staging`; and the findings already posted, so none is posted twice.
- **The reviewer**, after [Models and Effort](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/agent-harness/models-and-effort.md):
  a first review runs on Opus at high effort, or at xhigh when the change touches the workflows,
  the Function, the host rules and Staging gate (`src/lib/canonical-host.ts`), `wrangler.toml` or
  `public/_headers`, `_redirects` or `_routes.json`. A re-review of the commits since the last
  review, and the only review of a small change (under 50 changed lines outside docs, content,
  dictionaries and tests), run on Sonnet at medium effort.
- **What it does:** it reads every patch, starts three reviewers in parallel (bugs, the
  repository's rules, and the issue, tests and docs), keeps the real new findings, posts each as
  a comment on its line, marked **blocking** or **suggestion**, and writes a summary that says
  how many of the changed files it read. The workflow posts the summary, or updates the earlier one,
  as `github-actions[bot]`, and keeps the transcript for a week.
- **Time and failure:** the wait has 25 minutes and the review 20, inside the job's 60. The job
  fails only when no review ran or its summary couldn't be posted; findings never turn it red.
  Every review thread is resolved before the pull request merges.
- **Permissions:** it reads contents, checks, issues and packages and writes pull request
  comments. `claude-code-action` gets the job's own token (`github_token`), so it exchanges no
  OIDC token for the Claude app's, checks no workflow file, and posts the findings, like the
  summary, as `github-actions[bot]`. It needs the `CLAUDE_CODE_OAUTH_TOKEN` secret, and notes
  that it skipped without it.
- **What the reviewer can do:** it loads only user settings (`--setting-sources user`), never
  the checkout's `.claude/` hooks, which run `node_modules/.bin/serp-verify`, a file a pull
  request can add. Its tools are those of zenbujapanese-monorepo's review: reading files; viewing
  the pull request, its diff and its issue with the GitHub CLI; the line-comment tool; writing the
  summary; and reviewers of its own. It runs no git, whose `--output=` could write
  `.git/config`. `.git` and `/proc` are denied to it (`--disallowedTools`): the action writes its
  token into `.git/config` as the remote's URL, whatever the checkout does
  (`persist-credentials: false`), and `/proc` holds the process's environment, with the Claude
  token.
- **Where it differs from zenbujapanese-monorepo's review,** which posts as `claude[bot]` with
  the Claude app's token: here a token limited to the job's permissions, which expires with the
  job, posts, so a reviewer steered by text injected into a pull request or its issue can
  comment, but can't push, open a pull request or edit an issue. The issue's text still reaches
  the reviewer's system prompt, through `@serpcompany/verify`'s context script: marking it as
  untrusted there is an upstream ask.
