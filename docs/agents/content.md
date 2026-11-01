# Languages and content

The rules for text, translations and the site's content files. How the locales are built (routes,
dictionaries, the data layer, adding a page) is in [`docs/i18n.md`](../i18n.md); the blog's own
rules are in [`blog.md`](blog.md).

## Strings

- **Every visible string comes from `getDictionary(locale)`** or from locale-aware data: JSX text,
  `alt`, `aria-label`, titles, metadata and Open Graph text. The exceptions are brand names
  ("Pitonne"), technical identifiers and `aria-hidden` content.
- `src/lib/i18n/hardcoded-strings.test.ts` fails on visible text in `src/app` and
  `src/components` that doesn't come from the dictionary: JSX text, text attributes and props,
  and metadata.
- **A new key goes into both** `src/lib/i18n/dictionaries/en.json` and
  `src/lib/i18n/dictionaries/ja.json` in the same commit. `src/lib/i18n/dictionaries.test.ts`
  fails when the keys or value types differ, when a Japanese value is empty, or when the FAQ
  lists differ in length.
- Text with a variable part keeps a `{name}` placeholder and is filled with `interpolate()`
  ([`docs/i18n.md`](../i18n.md#ui-strings)); never join translated fragments.
- Run `pnpm test` after changing a dictionary or a content file: the parity tests
  ([`verification.md`](verification.md#tests-that-hold-the-sites-rules)) catch a missing key or
  translation before a push does.

## Japanese copy

- **Don't rewrite reviewed Japanese copy:** content files, dictionary values or frontmatter. Add
  to it instead.
- **Japanese an AI wrote is flagged in the pull request** for a native speaker to review, with
  each new or changed string listed.
- There are no translation review fields (`reviewedBy`, `reviewedAt`, `sourceChecksum`), which
  SERP's
  [Localization](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/web-stack/localization.md#content)
  standard asks for, decided on 2026-10-31. The pull request flag above is the review step
  instead, so a Japanese page is built as soon as its file exists.

## Services and legal pages

- Services are markdown in `content/services/`, with the Japanese file of the same name in
  `content/services/ja/`; legal pages are in `content/pages/legal/` and
  `content/pages/legal/ja/`. A new English file always gets its Japanese counterpart in the same
  change: `src/lib/i18n/content-parity.test.ts` fails when either side is missing.
- A service's frontmatter is checked by the zod schema in `src/lib/data/services.ts`: its
  `kind` (`parent` or `leaf`), its `category`, a leaf's `parentSlug`, and its `canonicalPath`,
  which must be `/services/<slug>/` (`src/lib/data/routes.test.ts`). `metaTitle` and
  `metaDescription` are optional SEO overrides.
- A new service is also added to `BLOG_RELATED_SERVICE_OPTIONS` in `src/lib/blog-rules.ts`, the
  list the CMS offers as a post's related services; `src/lib/data/blog-posts.test.ts` fails when
  the list and `content/services/` differ.
- An absolute `https://pitonne.jp/...` link in this markdown renders on the build's own origin
  (`onSiteOrigin()` in `src/lib/seo.ts`, through `SiteMarkdown`), so on Staging it stays on
  Staging.
- To the docs check these files are docs, since `docs/i18n.md` links them: a root-relative link
  such as `/contact/` would fail it as a missing file, and so would a page over 300 lines at a
  100-character wrap.
- `src/lib/data/content-files.test.ts` fails on WordPress and drafting leftovers from the
  migration.

## Areas, videos and business data

- **Areas** are one TypeScript file per ward in `src/lib/data/wards/`, listed in
  `src/lib/data/areas.ts`, with the `Ward` and `Area` types in `src/lib/data/wards/ward.ts`.
  English and Japanese sit side by side in each record (`name`/`nameJa`,
  `description`/`descriptionJa`, `highlights`/`highlightsJa`, `landmarks`/`landmarksJa`), so a
  new area or ward gets both values inline.
- **Videos** are in `src/lib/data/videos.ts`. `titleJa`, `descriptionJa` and `metaDescriptionJa`
  are optional, and the Japanese pages fall back to the English text without them. `metaTitle`
  and `metaDescription` override the watch page's English title and description, since YouTube
  descriptions are too long for a meta description.
- **Business data** (address, hours, phone, booking link) comes from `getBusinessInfo(locale)` in
  `src/lib/data/site.ts`, never from `businessInfo` directly. `lineUrl`, the clinic's LINE
  account, is set for Japanese only. `src/lib/data/site.test.ts` holds the phone, address and
  booking pages to the business sheet.
- `src/lib/retired-contact-details.test.ts` fails if the clinic's retired email address or phone
  number appears anywhere under `src`, `content` or `public`. It builds both from parts, so a
  search of the repository finds only the test's own absence checks.

## Where content comes from

- The business, service, FAQ and image content was first collected in the Google Sheet the
  [README](../../README.md) links.
- `pnpm audit:sheet-images` compares the sheet's image list with
  `docs/image-audit/sheet-image-manifest.json`, which `src/lib/data/sheet-images.dom.test.tsx`
  also reads.
- `pnpm drafts:fetch` downloads the Google Docs tabs listed in `scripts/google-docs-blog-drafts.mjs`
  as markdown blog drafts for review.
- `pnpm translate` drafts Japanese files for English services and posts with DeepL
  ([`docs/i18n.md`](../i18n.md#translation-workflow)). It needs a `DEEPL_API_KEY` environment
  variable, skips a file whose Japanese version exists unless given `--force`, and waits 200 ms
  between files to stay under DeepL's rate limit. What it writes is AI-written Japanese, flagged
  as above.
