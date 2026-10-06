# Blog CMS

The blog is edited in [Keystatic](https://keystatic.com) at **https://pitonne.jp/keystatic**. Background and the
decision record are in [ADR 0001](adr/0001-blog-cms.md).

## For editors

### Signing in

Open https://pitonne.jp/keystatic and choose **Log in with Keystatic Cloud**. You need an invitation to the
Keystatic Cloud team; no GitHub account is needed.

### Writing and publishing a post

1. Make sure the branch box at the top left says **main**. Always work on `main`; don't create branches (changes on
   another branch are never published).
2. Choose **Blog (English)** or **Blog (Japanese)**, then **Add**.
3. Fill in the fields. Keystatic shows a message under any field that needs fixing:
   - **Title**: about 60 characters.
   - **Slug**: becomes the web address. Use the same slug for the English and Japanese versions of a post, and don't
     change it after publishing.
   - **Excerpt**: 70–160 characters, shown on blog cards and in search results. If it's under 110 characters, search
     results add the post's opening sentences; fill in **Meta description override** (110–160 characters) to choose the wording.
   - **Category**: pick one (see [Categories](#categories)).
   - **Feature image**: optional; keep images under 1 MB. **Alt text** (optional) describes the image for screen
     readers; if it's empty, the post title is used.
   - **Draft**: tick it to keep the post off the site (see [Drafts](#drafts)).
4. Choose **Create** (or **Save** when editing). The site rebuilds and the change is live within a few minutes. If the
   build fails, the live site doesn't change; ask a developer.

### Drafts

A post with **Draft** ticked is saved but never shown on the site, so you can come back to it as often as you like.
To publish it, untick **Draft** and choose **Save**. (Keystatic also keeps unsaved edits in your browser; those are only
on your computer until you save.)

### Translations

English and Japanese posts are separate entries paired by slug:

1. Publish the English post and note its **Slug** (for example `iv-therapy-aftercare-what-to-do-after-a-drip`).
2. Choose **Blog (Japanese)**, then **Add**, and write the Japanese version.
3. In **Slug**, paste the English post's slug exactly. That links the two, including the language switcher.

A post can exist in one language only; the other language simply has no page for it until a translation with the same
slug is published.

### Categories

Categories are managed under **Blog categories**, with English and Japanese names and descriptions. A category gets its
page once a post uses it. Don't delete or rename a category that posts still use: the site won't publish until those
posts are moved to another category.

## For developers

- **Local editing**: `pnpm cms` edits files in your checkout; `pnpm cms:cloud` uses Keystatic Cloud and commits to
  GitHub. Open http://127.0.0.1:3000/keystatic (Keystatic switches `localhost` to `127.0.0.1`).
- **Publishing flow**: the Keystatic Cloud GitHub app is on the `main` ruleset's bypass list, so CMS saves commit
  straight to `main` and deploy to Production without waiting for a promotion. This is the one documented exception to
  the staging → main flow in [gitflow.md](gitflow.md): code goes through Staging, content goes live immediately.
  - A save that changes only CMS files (`content/blog/`, `content/blog-categories/`, `public/images/content/blog/`)
    deploys as soon as the site builds, never waiting for CI's tests; a build that fails isn't deployed. If CI's tests
    then fail on `main`, an issue titled "CI is failing on main" alerts the owner, but later saves keep publishing.
    Saves that only touch drafts don't deploy at all, since drafts are excluded from the build.
  - The Sync staging workflow then merges `main` into `staging`, so Staging gets the content too and promotions stay
    fast-forwards.
  - `main` stays GitHub's default branch because Keystatic Cloud opens on the default branch; making `staging` the
    default would send saves to Staging. Branches created in the CMS are not published.
- **Undoing a change**: revert the CMS commit on `main` (`git revert <sha>`) through a hotfix PR into `main` (a normal
  PR into `staging` wouldn't go live until the next promotion); history is the version record. Undoing a single post is
  usually quicker in the CMS itself.
- **Access**: editors are managed in the Keystatic Cloud project `serp/pitonne-website` (free plan: up to 3 users per
  team). The project's URLs must include every domain the CMS is opened from (currently `https://pitonne.jp`). Open the
  CMS only on https://pitonne.jp: https://staging.pitonne.jp/keystatic would also save to `main`, so it isn't a place
  to try changes.
- **Rules**: field limits live in `lib/blog-rules.ts`, shared by `keystatic.config.ts` and the zod schemas in
  `lib/data/blog-posts.ts` and `lib/data/blog-categories.ts`.
