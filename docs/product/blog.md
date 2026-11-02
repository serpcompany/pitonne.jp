# Blog

What readers get from the blog: the index, the posts and the categories, in each language a post
is published in. Editors write the posts in the CMS ([The CMS](cms.md)); the rules for posts'
files are in [`docs/agents/blog.md`](../agents/blog.md). How a check is named is in
[How behavior is verified](index.md#how-behavior-is-verified).

## The index

**Blog index.** `/blog/` shows the categories as chips, All first and marked, then each category
that has a post in the page's language. The newest post is featured, large, with its image; the
rest follow, newest first, each with its image, category, date, reading time and excerpt. The
page ends with a contact button, and has no pagination. Which post is featured doesn't depend on
the editor's Featured box: it's always the newest.

- Check: `src/app/[locale]/blog/page.dom.test.tsx`, "blog index page > renders supplied featured
  images with descriptive alt text and accessible active category contrast" and "does not render
  the standalone top image below the hero"; `e2e/pages.spec.ts`, "a blog post opens from the blog
  index, and a category lists posts that open". The order, and the Featured box having no effect:
  no automated check yet.

## Posts

**Post pages.** `/blog/<slug>/` has breadcrumbs back to the blog, the post's category as a link to
its page, the date and reading time, and the author, then the feature image and the body. A box
of the post's related services and a contact box sit before the post's closing "Final Takeaway"
section, or after the body when it has none. A sidebar holds a booking box, the related services
and up to three other posts in the same category, and the page ends with the three newest other
posts.

- Check: `src/components/blog/blog-post-template.dom.test.tsx`, "blog post parity > renders
  markdown prose plus live discovery sections around the final takeaway";
  `src/app/[locale]/blog/[post]/page.dom.test.tsx`, "blog post body > renders %s (%s) inside the
  blog prose styles"; `e2e/pages.spec.ts`, "a blog post opens from the blog index, and a category
  lists posts that open".

**Related services.** The sidebar lists the services the post names, and so does the box in the
body, where a post in the IV therapy category that names none lists IV Therapy. A post with no
service to list shows neither.

- Check: `src/lib/data/blog-posts.test.ts`, "blog content model > offers every service as a CMS
  related-service option and only links existing services", which checks the services a post may
  name, not what the page shows. The sidebar's list, the box's and the IV Therapy default: no
  automated check yet.

**Reading time and date.** The reading time is computed from the body, at 200 words a minute in
English and 500 characters a minute in Japanese, unless the post's `readingTime` sets it. The date
is the day the post was published, whatever the time zone of the machine that built the site.

- Check: `src/lib/data/blog-posts.test.ts`, "blog content model > computes reading time from the
  body, by words in English and characters in Japanese", "keeps readingTime frontmatter as an
  optional override" and "rejects a publishedAt timestamp
  instead of shifting it to another day"; `src/lib/post-date.test.ts`, "formatPostDate > shows the
  published day on a build machine west of UTC".

**One heading.** The post's title is its page's only `<h1>`. A body that starts with its own
title heading has that line dropped, and any other top-level heading in it shows as a
second-level one.

- Check: `src/lib/data/blog-posts.test.ts`, "blog content model > drops a leading title heading
  from the body"; `scripts/audit-seo-build.mjs`, "<h1> tags (want 1)".

**Feature images.** A post may have no feature image. One that has an image without alt text is
described by the post's title.

- Check: `src/lib/data/blog-posts.test.ts`, "blog content model > uses the post title as alt text
  when a feature image has none" and "allows a post without a feature image or alt text";
  `src/components/blog/blog-post-template.dom.test.tsx`, "blog post parity > renders a
  descriptive localized alt text for a supplied featured image".

**Links in a post.** A link to another page of the site stays in the post's language: in a
Japanese post it opens the Japanese page, except a link to a post with no Japanese version, which
opens the English one. A full `https://pitonne.jp/...` link opens the same page on the site the
reader is on.

- Check: `src/components/blog/blog-post-template.dom.test.tsx`, "blog post parity > renders full
  pitonne.jp links as relative, localized paths" and "resolves relative links in Japanese posts to
  Japanese pages"; `src/lib/data/blog-posts.test.ts`, "single-locale blog posts > localizes
  relative links in Japanese content except to posts without a Japanese version".

**Videos in a post.** A video marker in the body shows that video in YouTube's privacy-enhanced
player, captioned with its title, which links to its watch page.

- Check: `src/components/blog/blog-post-template.dom.test.tsx`, "blog post parity > renders blog
  video markers as YouTube embeds" and "keeps blog video markers mapped to known Pitonne videos".

## Categories

**Category pages.** `/blog/category/<slug>/` shows the category's name and description, the
chips with this category's marked, its posts in the page's language, and a contact section with
the category's own text, or the blog's general text when it has none. A category has a page in a
language once a published post in that language uses it.

- Check: `src/lib/data/routes.test.ts`, "routes > builds blog post and category pages only for
  published posts, in their own locale"; `src/lib/data/blog-posts.test.ts`, "blog content model >
  localizes category names and descriptions from the category file"; `e2e/pages.spec.ts`, "a blog
  post opens from the blog index, and a category lists posts that open".

## Languages and drafts

**Posts in one language.** A post may be published in English only or Japanese only. Its other
language then has no page for it, no entry in the index or a category, no hreflang alternate and no
sitemap URL. The language switcher on such a post, or on a category with posts in one language
only, opens the other language's blog index. A translation pairs with its original by slug.

- Source: [ADR 0001](../adr/0001-blog-cms.md).
- Check: `src/lib/data/blog-posts.test.ts`, "single-locale blog posts > emits hreflang only for the
  locales a page exists in" and "lists only the published locale in the sitemap";
  `src/lib/sitemaps.test.ts`, "sitemap URLs > lists blog posts only in the locales they are
  published in, with no alternate for a missing translation"; `src/lib/data/routes.test.ts`,
  "routes > builds blog post and category pages only for published posts, in their own locale";
  `src/lib/i18n/content-parity.test.ts`, "i18n content file parity > pairs blog translations by
  identical filename and slug". The switcher opening the blog index: no automated check yet.

**Drafts.** A post saved as a draft is in no build, in any environment: no page, no index or
category entry, no sitemap URL.

- Source: [ADR 0001](../adr/0001-blog-cms.md).
- Check: `src/lib/data/blog-posts.test.ts`, "blog content model > excludes draft posts";
  `src/lib/sitemaps.test.ts`, "sitemap URLs > leaves out draft posts".
