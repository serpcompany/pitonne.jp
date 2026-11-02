# The CMS

What editors get from Keystatic, the CMS at https://pitonne.jp/keystatic: what they can edit, the
rules it shows them, and how a save reaches the live site. The steps for each task are in the
editors' guide, [`docs/cms.md`](../cms.md#for-editors); how the CMS fits the static site is in
[`docs/agents/blog.md`](../agents/blog.md#keystatic). What readers then see is in
[Blog](blog.md). How a check is named is in
[How behavior is verified](index.md#how-behavior-is-verified).

## Editing

**What editors edit.** Editors sign in through Keystatic Cloud, by invitation, with no GitHub
account, and edit the blog: its posts, in English and in Japanese, and its categories. Services,
legal pages, areas, videos and the site's own text are changed in code, by pull request. The CMS
answers at every URL under `/keystatic/`
([Hosts and redirects](hosts-and-redirects.md#behind-the-function)).

- Source: [ADR 0001](../adr/0001-blog-cms.md); [#64](https://github.com/serpcompany/pitonne.jp/issues/64).
- Check: smoke (`scripts/smoke-canonical-host.mjs`),
  `https://pitonne-jp.pages.dev/keystatic/branch/main (with x-pitonne-smoke-test): 200 [text/html]`;
  `src/lib/keystatic-config.test.ts`, "the CMS > signs editors in through Keystatic Cloud, to edit
  the blog in two languages and its categories" and "edits local files only when started for
  that".

**The rules on each field.** The editor shows the site's rules on each field before a save: a
title; a slug of lowercase words and hyphens; an excerpt of 70 to 160 characters; an optional SEO
title and meta description, empty or within the ranges the audits use; a category; and a
published date. The body offers headings of levels 2 to 4 only, and a pasted heading of another
level becomes one of those. The build checks the same rules, so a file that breaks one fails the
build, and the live site stays as it was.

- Check: `src/lib/data/blog-posts.test.ts`, "blog content model > rejects %s", "rejects a slug
  that does not match the filename" and "rejects a publishedAt timestamp instead of shifting it to
  another day"; `src/lib/keystatic-config.test.ts`, "the CMS > refuses an excerpt, meta
  description or category description outside the build’s limits" and "offers headings of levels
  2 to 4 only in a post’s body, and turns a heading of another level, pasted or loaded, into the
  nearest of those", which loads Keystatic's browser build, the one the editor runs and the patch
  changes.

**Translations.** An English post and a Japanese post with the same slug are each other's
translation: the language switcher and hreflang then link them. A post without one is published in
its one language ([Blog](blog.md#languages-and-drafts)).

- Check: `src/lib/i18n/content-parity.test.ts`, "i18n content file parity > pairs blog
  translations by identical filename and slug".

**Categories.** Editors add and change categories, each with an English and a Japanese name and
description, of 110 to 160 characters, and optional text for its page's contact section. A post
must name an existing category: deleting or renaming one that posts still use stops every build
until those posts move to another.

- Check: `src/lib/data/blog-posts.test.ts`, "blog content model > keeps every category file valid
  and every post's categorySlug pointing at one, in both locales", "rejects a category file with
  %s", "rejects a category file that is not valid JSON or not named by a kebab-case slug" and
  "localizes the category name from categorySlug and rejects unknown categories".

**Related services.** Editors pick a post's related services from a list of every service, and
each one they pick shows on the post in both languages.

- Check: `src/lib/data/blog-posts.test.ts`, "blog content model > offers every service as a CMS
  related-service option, and resolves each option and each post’s related services to a service
  in both languages".

**Feature images.** An uploaded feature image is stored in its post's own folder, apart for each
language, so changing one language's image never replaces the other's. Images are served as
uploaded, unresized, and CI's SEO audit fails on one over 5 MB, which alerts the owner as a failed
test does (below).

- Check: `src/lib/data/blog-posts.test.ts`, "blog content model > keeps every feature image file in
  place, with a separate folder per locale"; `src/lib/data/sheet-images.dom.test.tsx`, "sheet image
  integration > stores blog feature images in Keystatic's per-slug folders";
  `scripts/audit-seo-build.mjs`, "image is … MB (max … MB)".

## Publishing

**A save goes live.** Saving a post or a category commits it to `main`, and Production deploys it
as soon as the site builds, with no promotion and no wait for the tests. Every save goes live, the
newest last, even when several come in quick succession. If the build fails, the live site doesn't
change; if the tests fail afterwards, an issue alerts the owner, and later saves keep publishing.
Staging then receives the same content.

- Source: [`docs/gitflow.md`](../gitflow.md#content-cms-saves-go-straight-to-main), one of the
  differences from SERP's standards in
  [`deviations.md`](../agents/deviations.md#branches-deploys-and-ci).
- Check: `tools/checks/deploy-workflows.test.ts`, "CI and deploy workflows > deploys CMS content as
  soon as it builds, whatever any test result says" and "alerts the owner when a check or a
  Production deploy fails on main instead of blocking publishing", and "staging sync and promotion
  workflows > merges main into staging after every push to main, and only ever pushes staging";
  `scripts/deploy-target.test.mjs`, "deploy target > deploys the tip for every queued older run,
  so rapid CMS saves all go live and nothing older overwrites newer";
  `scripts/draft-only-change.test.mjs`, "CMS content-only change detection > treats blog posts,
  categories and blog images as content".

**Drafts.** A post saved with Draft ticked is kept but never shown, in any environment, and a save
that only changes drafts deploys nothing. Unticking Draft and saving publishes the post.

- Source: [ADR 0001](../adr/0001-blog-cms.md).
- Check: `scripts/draft-only-change.test.mjs`, "draft-only change detection > skips saves that keep
  blog posts as drafts" and "deploys when a post is published, unpublished, or anything else
  changes"; `src/lib/data/blog-posts.test.ts`, "blog content model > excludes draft posts".
