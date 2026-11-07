---
name: verify-site
description: Check a pitonne.jp change in the running site, at the evidence level the change needs. Runs the dev server in both locales, the local Keystatic CMS, or the production-like preview (the static export served by wrangler with the Pages Function, _redirects, _headers and _routes.json), including the Staging password gate, then checks it with curl -I and screenshots at desktop and phone widths. Use after changing pages, components, dictionary text, redirects, headers, the Function, robots or sitemaps, the CMS config or the deploy config, and to reproduce a site bug before fixing it.
---

# Check a change in the running site

Which evidence a change needs is in `docs/agents/verification.md` (Evidence); this is how to get
it. Report each level you reached apart: the build and tests, the running site, the deployed
site.

## 1. Pick the setup

| The change | Run | Check |
| --- | --- | --- |
| A page, component or dictionary text | The dev server | `/x/` and `/ja/x/`, with screenshots at desktop and phone widths |
| `public/_redirects`, `public/_headers`, `public/_routes.json`, the Function, trailing slashes, the `/keystatic/*` fallback, robots or sitemaps | The production-like preview | `curl -I` on each affected URL; for routing, the same URLs on https://pitonne.jp before the change and after the Production deploy |
| The Staging gate or `DEPLOY_ENV` handling | A Staging build, served locally | The `curl -I` answers in step 2 |
| `keystatic.config.ts`, `src/lib/blog-rules.ts`, the Keystatic patch, the post or category schemas | The local CMS | The editor flow the change touches |

## 2. Run it

**The dev server.** `pnpm dev` serves http://localhost:3000/ and http://localhost:3000/ja/. Each
route compiles on its first request, which on a Windows machine can take a minute or more, so
wait for the first page before judging it. It doesn't run the Function or apply `_redirects` and
`_headers`, and its sitemaps list `localhost` URLs.

**The local CMS.** `pnpm cms` serves Keystatic at http://127.0.0.1:3000/keystatic, editing the
files in this checkout: `git status` and `git diff` show what a save wrote, and restoring or
deleting those files undoes a test save. Never try changes with `pnpm cms:cloud`: it commits to `main`, which deploys
Production.

**The production-like preview.** Build, then serve `out/` from the repository root, which is where
`functions/` is. The commands are POSIX shell (Git Bash on Windows;
[`verification.md`](../../../docs/agents/verification.md) gives the PowerShell form):

```sh
DEPLOY_ENV=production pnpm build
pnpm preview
```

`pnpm preview` is `wrangler pages dev out`, with the wrangler version the deploy uploads with. It
serves http://127.0.0.1:8788 as Pages does (`--port <n>` picks another port). On 2026-11-01 it
answered:

```sh
curl -sI http://127.0.0.1:8788/about            # 308, Location: /about/
curl -sI http://127.0.0.1:8788/robots.txt/      # 308 to /robots.txt
curl -sI http://127.0.0.1:8788/en/about/        # 301, Location: /about/
curl -sI http://127.0.0.1:8788/no-such-page/    # 404
curl -sI http://127.0.0.1:8788/404/             # 404, as are /404, /404.html and /_not-found/
curl -sI http://127.0.0.1:8788/images/x.jpg/    # 404, the _routes.json exception
```

`pnpm start` serves the files alone, with none of this. `pnpm audit:out` and
`DEPLOY_ENV=production pnpm audit:seo` check the same build, and `DEPLOY_ENV=production
pnpm test:e2e` runs the browser journeys on it (`docs/agents/verification.md`, Browser journeys).

- **A build made on Windows** writes each page's RSC payload files into nested folders
  (`out/about/__next.!KGVuKQ/about/__PAGE__.txt`), where a Linux build, CI's, writes one flat name
  per file. Served locally, the client's requests for the flat names answer 404, so client-side
  navigation and prefetching differ from the deployed site, and the browser journeys that
  navigate fail. The HTML is the same, so check pages by loading them.
- **A busy port:** wrangler takes 8788 unless given `--port <n>`. A new server can start on a port
  an old one still holds while the old one answers, so first confirm that the build answering is
  yours, for example from its `robots.txt`.

**A Staging build, served locally.** The Function gates every host outside `pitonne-jp.pages.dev`
as it gates `staging.pitonne.jp`, `127.0.0.1` among them, and sends the `pitonne-jp.pages.dev`
ones to `staging.pitonne.jp`:

```sh
DEPLOY_ENV=staging pnpm build
pnpm preview --binding CF_PAGES_BRANCH=staging --binding STAGING_PASSWORD=stagingpassword
curl -sI http://127.0.0.1:8788/                                    # 401, Basic challenge, no-store, noindex
curl -sI -u any:stagingpassword http://127.0.0.1:8788/ja/          # 200, private, no-store, no X-Robots-Tag
curl -sI http://127.0.0.1:8788/robots.txt                          # 200, private, no-store, noindex
curl -sI -H "x-pitonne-smoke-test: 1" http://127.0.0.1:8788/       # 200, private, no-store, noindex
curl -sI -H "Host: staging.pitonne-jp.pages.dev" http://127.0.0.1:8788/   # 308 to https://staging.pitonne.jp/
```

Leaving out `STAGING_PASSWORD` shows the gate failing closed: every request but the exemptions
gets the 401.

## 3. Screenshots

Use the session's browser tool if it has one; otherwise the installed Playwright's command line.
Its browser is a large download, so point `PLAYWRIGHT_BROWSERS_PATH` at a disk with room if the
default one is full.

```sh
pnpm exec playwright install chromium
pnpm exec playwright screenshot --viewport-size "1440, 900" http://localhost:3000/ en-desktop.png
pnpm exec playwright screenshot --viewport-size "390, 844" --full-page http://localhost:3000/ja/ ja-phone.png
```

Take each changed page in both locales, at both widths, once the owner's changes are in. Keep the
files out of the repository. A dev page shows the Next.js dev indicator in a corner; the
deployed site doesn't.

## 4. After the deploy

The deploy's smoke test checks the basics of each environment (`docs/agents/ci.md`). For a
routing change, `curl -sI` the affected URLs on https://pitonne.jp after the Production deploy,
as before it. Staging needs the password: `curl -sI -u any:stagingpassword
https://staging.pitonne.jp/<path>`. The branded hosts can challenge scripted requests (a
`cf-mitigated` header); a challenge says nothing about the site.

## 5. Report

Say which setup, URLs and widths you checked and what each showed, in words. A check you
couldn't run is reported as not run, not as passed. Stop every server you started with its whole
process tree: wrangler leaves `workerd` processes that keep the port.
