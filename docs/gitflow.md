1. Work on a feature branch:
- feat/*
- fix/*
- chore/*

2. Open PR into staging.
- staging is protected.
- Requires PR.
- Requires GitHub Actions test.
- Same-repository PRs receive an automatic Cloudflare Pages preview after the full `test` job passes.
- The preview uses a stable, collision-free alias based on the PR number (`pr-<number>.pitonne-jp.pages.dev`). New commits replace that alias, and the Cloudflare Pages integration updates its existing PR comment with the stable URL, immutable deployment URL, and deployed SHA.
- PR preview builds use `DEPLOY_ENV=preview` and `NEXT_PUBLIC_DEPLOY_ENV=preview`; verify `robots.txt` contains `Disallow: /` before sharing the URL.
- Forked PRs run validation without receiving Cloudflare secrets or a deployment. PR previews never use the `staging`, `main`, `staging.pitonne.jp`, or `pitonne.jp` aliases.

3. Merge to staging.
- GitHub Actions runs `.github/workflows/deploy.yml`.
- The workflow builds with preview environment flags and direct-uploads `out/` to Cloudflare Pages.
- QA URL:
    - https://staging.pitonne.jp
    - backup alias: https://staging.pitonne-jp.pages.dev

4. Open PR from staging into main.
5. Merge to main.
- main is protected.
- Requires PR.
- Requires GitHub Actions test.
- GitHub Actions runs `.github/workflows/deploy.yml`.
- The workflow builds with production environment flags and direct-uploads `out/` to Cloudflare Pages.
- Production URLs:
    - https://pitonne.jp
    - www.pitonne.jp redirects to apex (a Cloudflare zone redirect rule, which should answer 308).
    - `pitonne-jp.pages.dev`, its branch aliases and its deployment URLs return 308 to the same path and query on
      `https://pitonne.jp` (`functions/_middleware.ts`). The `pr-<n>` and `staging` aliases, and requests with the
      `x-pitonne-smoke-test` header, are served as is. A `_redirects` rule is folded into the same hop
      (`pitonne-jp.pages.dev/en/` → `https://pitonne.jp/`). `public/_routes.json` keeps static files (`/_next/*`,
      `/images/*`, icons) off the Function; those paths still answer 200 on pages.dev. After each production deploy,
      `scripts/smoke-canonical-host.mjs` checks these redirects, and that `_redirects`, `_headers` and 404s still work
      behind the Function.

Deployment source of truth:
- Push/manual build and deploy commands live in `.github/workflows/deploy.yml`; validated PR preview deployment lives in `.github/workflows/ci.yml`.
- Cloudflare Pages should not run its own Git build pipeline for this project once the workflow has a valid `CLOUDFLARE_API_TOKEN` repository secret.
- Required GitHub secret:
    - `CLOUDFLARE_API_TOKEN`: Cloudflare account API token with Account > Cloudflare Pages > Edit permission.

Lighthouse CI keeps the best-practices threshold at `0.95`. Collection skips only the accepted `third-party-cookies` best-practices audit caused by the current LeadConnector integration (in addition to the pre-existing color-contrast exclusion); inspector issues, console errors, and all other best-practices audits remain enabled. Removing the underlying cookies is tracked separately in [GitHub issue #51](https://github.com/serpcompany/pitonne.jp/issues/51).
