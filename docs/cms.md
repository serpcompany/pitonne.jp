# Blog CMS

The blog is edited in [Keystatic](https://keystatic.com) at **https://pitonne.jp/keystatic**. Background and the
decision record are in [ADR 0001](adr/0001-blog-cms.md).

## For editors

### Signing in

Open https://pitonne.jp/keystatic and choose **Log in with Keystatic Cloud**. You need an invitation to the
Keystatic Cloud team; no GitHub account is needed.

### Writing and publishing a post

1. Choose **Blog (English)** or **Blog (Japanese)**, then **Add**.
2. When Keystatic asks to create a branch, give it a short name such as `new-jet-lag-post`. Every change is saved on its
   own branch first; the live site is never edited directly.
3. Fill in the fields. Keystatic shows a message under any field that needs fixing:
   - **Title**: about 60 characters.
   - **Slug**: becomes the web address. Use the same slug for the English and Japanese versions of a post, and don't
     change it after publishing.
   - **Excerpt**: 70–160 characters, shown on blog cards and in search results. If it's under 110 characters, also
     fill in **Meta description override** (110–160 characters).
   - **Category**: pick one (see [Categories](#categories)).
   - **Feature image**: optional; keep images under 1 MB. **Alt text** (optional) describes the image for screen
     readers; if it's empty, the post title is used.
   - **Draft**: tick it to save without publishing.
4. Choose **Save**. The site checks the change and publishes it automatically, usually within 10 minutes. If a check
   fails, the change is not published; ask a developer.
5. To make another change after publishing, start again from the `main` branch (step 2 creates a new branch).

### Translations

English and Japanese posts are separate entries paired by slug. A post can exist in one language only; the other
language simply has no page for it until a translation with the same slug is published.

### Categories

Categories are managed under **Blog categories**, with English and Japanese names and descriptions. A category gets its
page once a post uses it. Don't delete or rename a category that posts still use: the site won't publish until those
posts are moved to another category.

## For developers

- **Local editing**: `pnpm cms` edits files in your checkout; `pnpm cms:cloud` uses Keystatic Cloud and commits to
  GitHub. Open http://127.0.0.1:3000/keystatic (Keystatic switches `localhost` to `127.0.0.1`).
- **Publishing flow**: Keystatic Cloud commits to `cms/*` branches. CI runs on those pushes, and
  `.github/workflows/cms-publish.yml` opens a PR into `main`, squash-merges the tested commit and runs the deploy
  workflow. A failed CI run leaves the branch unmerged.
- **Undoing a change**: revert the CMS merge commit on `main` (`git revert <sha>`) through a normal PR; history is the
  version record.
- **Access**: editors are managed in the Keystatic Cloud project `serp/pitonne-website` (free plan: up to 3 users per
  team). The project's URLs must include every domain the CMS is opened from (currently `https://pitonne.jp`).
- **Rules**: field limits live in `lib/blog-rules.ts`, shared by `keystatic.config.ts` and the zod schemas in
  `lib/data/blog-posts.ts` and `lib/data/blog-categories.ts`.
