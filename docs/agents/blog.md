# The blog and the CMS

The rules for blog posts and categories, and how the Keystatic CMS fits the static site. The
editors' guide, the publishing flow and the CMS's access are in [`docs/cms.md`](../cms.md);
why the blog is on Keystatic is in [ADR 0001](../adr/0001-blog-cms.md), and why not Payload on D1
in [ADR 0002](../adr/0002-payload-d1.md).

## Posts in two languages

- English posts are `content/blog/<slug>.md` and Japanese posts `content/blog/ja/<slug>.md`. A
  translation pairs with its original by an identical filename, which is the slug.
- **A post may exist in one language only.** The other language then has no page, blog index or
  category entry, hreflang alternate or sitemap URL for it. `getBlogPostLocales`,
  `getBlogCategoryLocales` and `getUntranslatedBlogPaths` in `src/lib/data/blog-posts.ts` answer
  which languages a post or category is published in, and every consumer asks them. On a page
  with no translation, the header's language switcher goes to the other language's blog index.
- **`draft: true` posts are left out of every build:** Production, Staging and PR previews. Don't
  link to a draft. A push that changes only drafts deploys nothing ([`ci.md`](ci.md#ciyml)).

## Frontmatter

The zod schema in `src/lib/data/blog-posts.ts` checks every post when the site builds, with the
limits in `src/lib/blog-rules.ts`, which `keystatic.config.ts` shares so the CMS shows the same
rules. `src/lib/blog-rules.ts` imports no Node module, because the CMS config also runs in the
browser.

- **`excerpt`:** 70–160 characters. It is also the default meta, Open Graph and Twitter
  description.
- **A short excerpt never fails a save.** Under 110 characters and with no `metaDescription`, the
  build extends the meta description with the post's own opening sentences, verbatim and in the
  post's language (`fallbackMetaDescription`). When no whole sentence fits, the next one is cut
  at 160 characters and ends with an ellipsis.
- **`metaTitle` and `metaDescription`** are optional SEO overrides, for an on-page title or
  excerpt that is too long or too short. They have the ranges `pnpm audit:meta` checks: 110–160
  characters for the description, and a title that fits 15–70 characters once " | Pitonne" is
  added. Keystatic applies a minimum length even to an empty field, so in the CMS these fields
  accept empty or at least the minimum.
- **The slug is the filename.** Don't add a `slug:` key; a slug that differs from the filename is
  rejected.
- **`readingTime` is computed** when the site builds: 200 words a minute in English and 500
  characters a minute in Japanese, which has no spaces between words. Don't add it to a new post;
  the key stays only as an override.
- **`publishedAt`** is a date, `YYYY-MM-DD`. Keystatic writes it as an unquoted YAML date, which
  the schema turns back into that string. A value with a time or timezone is rejected rather than
  converted, since converting could move it to another day.
- **`featureImageAlt`** is optional: an image without it is described by the post's title.
- **`categorySlug`** names a file in `content/blog-categories/`. Every post is checked when it
  loads, drafts included, and the error names the post and the slug.
- **`relatedServiceSlugs`** name services in `content/services/`
  (`src/lib/data/blog-posts.test.ts`).

## The body

- **The post's title is the page's only `<h1>`.** The CMS offers headings 2 to 4 only, and
  `patches/@keystatic__core@0.6.9.patch` clamps a pasted heading to those levels, so pasting
  `# Title` can't make an `<h1>`. A body that still starts with its own `# Title` line has that
  line dropped (`withoutLeadingTitleHeading`), and any other markdown `<h1>` renders as an
  `<h2>` (`src/components/blog/blog-post-template.tsx`).
- **Internal links are locale-neutral relative paths,** such as `/blog/<slug>/` and `/contact/`,
  never `https://pitonne.jp/...` or `/ja/...`. A Japanese post resolves them to `/ja/...` when it
  renders, except a link to a post with no Japanese version, which stays on the English page. A
  pasted `https://pitonne.jp/...` link loses its origin (`localizeBlogContentHref`).

## Categories

- Each category is `content/blog-categories/<slug>.json`, with `name`/`nameJa` and
  `description`/`descriptionJa`, and optional `ctaDescription`/`ctaDescriptionJa` for the
  category page's contact section, which uses the site's general contact text without them.
  Posts store only `categorySlug`. Editors change categories in the CMS.
- `description` is the category page's meta description, so it has the same 110–160 range.
- A category has a page in a language once a published post in that language uses it.
- Deleting or renaming a category that posts still use fails the build until those posts move to
  another category.

## Images

Feature images live in `public/images/content/blog/<slug>/` for English posts and
`public/images/content/blog/ja/<slug>/` for Japanese ones. Each language keeps its own folder, so
editing one never replaces the other's image. The site serves images unoptimized, so keep each
under 1 MB.

## Keystatic

- **The CMS is a single-page app at `/keystatic`.** The export has only `/keystatic/`, and
  `public/_redirects` serves it for every `/keystatic/*` path (`/keystatic/* /keystatic/ 200`),
  so Keystatic's own router reads the URL. `src/app/keystatic/[[...params]]/page.tsx` keeps
  dynamic params on, so the dev server also serves deep `/keystatic/*` URLs on reload.
  `robots.txt` disallows `/keystatic/`.
- **Saving.** The deployed CMS, and `pnpm cms:cloud`, sign in through Keystatic Cloud (project
  `serp/pitonne-website`) and commit straight to `main`, which deploys Production without a
  promotion. This is the one exception to the staging → main flow; Sync staging then merges `main`
  into `staging` ([`docs/gitflow.md`](../gitflow.md#content-cms-saves-go-straight-to-main)).
  Editors keep work back with the Draft checkbox, never with branches.
- **Locally,** `pnpm cms` edits the files in your checkout, and `pnpm cms:cloud` uses Keystatic
  Cloud and commits to GitHub; both serve http://127.0.0.1:3000/keystatic.
- **The dev modes** (`next.config.mjs`). Both CMS scripts set `KEYSTATIC=1`, which turns off the
  static export, so Keystatic's API route can run: `src/app/api/keystatic/[...params]/route.keystatic.ts`
  loads only then, through `pageExtensions`, and `pnpm dev` and builds keep the export's checks.
  Keystatic Cloud sends `localhost` to `127.0.0.1`, which `allowedDevOrigins` admits. Keystatic's
  router reads a trailing slash as an extra segment, which breaks its OAuth callback, so the CMS
  dev server sets `skipTrailingSlashRedirect` rather than turning `trailingSlash` off, which
  would leave cached redirect loops when switching between `pnpm dev` and `pnpm cms`.
