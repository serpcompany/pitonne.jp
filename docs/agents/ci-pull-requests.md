# Pull request checks and issue closing

The workflows that read a pull request rather than build the site: `pull-request.yml` and
`close-issues.yml`. The workflow list, and what a merge waits for, are in
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
  passes with a warning, and so does one in another repository named beside one of this
  repository's, since it has to be closed by hand. Into `main`, it asks
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
from `@serpcompany/verify`'s `dist/pull-request/rules.js` but for the `staging` case, with its
tests in `tools/checks/pull-request.test.ts`. Update it when the package's rules change.

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

- It starts on `pull_request_target`, so a fork's merged pull request closes its issues too: that
  event runs `staging`'s own copy of the workflow and of `tools/checks/close-issues.mjs`, never
  the pull request's, and the job checks out nothing else and runs nothing from it.
- Its job runs only when the pull request merged, with the job's own token, which may write
  issues and nothing else.
- An issue already closed, a number that isn't an issue, and an issue in another repository are
  left alone, with a note in the log. The keywords are read as `issue-link` reads them, in the
  same script, so what the check accepted is what closes.
