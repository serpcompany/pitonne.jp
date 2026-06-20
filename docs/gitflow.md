1. Work on a feature branch:
- feat/*
- fix/*
- chore/*

2. Open PR into staging.
- staging is protected.
- Requires PR.
- Requires GitHub Actions test.

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
    - www.pitonne.jp redirects to apex.

Deployment source of truth:
- Build and deploy commands live in `.github/workflows/deploy.yml`.
- Cloudflare Pages should not run its own Git build pipeline for this project once the workflow has a valid `CLOUDFLARE_API_TOKEN` repository secret.
- Required GitHub secret:
    - `CLOUDFLARE_API_TOKEN`: Cloudflare account API token with Account > Cloudflare Pages > Edit permission.
