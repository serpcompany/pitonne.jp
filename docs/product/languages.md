# Languages

pitonne.jp is in English and Japanese, as SERP's
[Localization](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/web-stack/localization.md)
standard describes: every page in English at its bare URL, and in Japanese under `/ja/`. How the
two locales are built is in [`docs/i18n.md`](../i18n.md), and the rules for writing their text in
[`docs/agents/content.md`](../agents/content.md). How a check is named is in
[How behavior is verified](index.md#how-behavior-is-verified).

## URLs

**English at bare URLs, Japanese under `/ja/`.** Each page's English URL has no prefix, and its
Japanese URL is the same path under `/ja/`, with the same English slug: `/services/iv-therapy/`
and `/ja/services/iv-therapy/`. The Japanese home page is `/ja/`. Every page is built in both
languages, but for a blog post or category published in one ([Blog](blog.md#languages-and-drafts)).

- Source: SERP's Localization standard,
  [URLs](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/web-stack/localization.md#urls).
- Check: `src/lib/data/routes.test.ts`, "routes > builds a page for every canonical route (%s)";
  `src/lib/seo.test.tsx`, "SEO parity > generates Japanese paths from the locale segment and bare
  paths from English wrappers"; `e2e/language.spec.ts`, "the home page loads in English and in
  Japanese, each in its own language".

**`/en/` is never a public URL.** `/en` and `/en/<path>` answer one 308 to the bare path, and the
build writes no page under `/en/` ([Hosts and redirects](hosts-and-redirects.md#the-en-prefix)).

- Source: SERP's Localization standard,
  [URLs](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/web-stack/localization.md#urls).
- Check: `e2e/environment.spec.ts`, "redirects /en/ to / with one 308" and "redirects
  /en/services/ to /services/ with one 308"; `scripts/audit-out.mjs`, "unexpected out/…".

**No automatic language.** The site never picks a language for a visitor, from the browser, a
cookie or anything else, and never redirects between languages: the URL is the language.

- Source: SERP's Localization standard.
- Check: `src/lib/canonical-host.test.ts`, "Pages middleware > picks no language for a visitor: /
  is served as asked, whatever the browser’s languages or cookies".

## What each language shows

**Interface text.** A Japanese page's header, menus, footer, headings, buttons, labels, image
descriptions, titles and descriptions come from the Japanese dictionary, and an English page's
from the English one. Both dictionaries have the same entries, and no Japanese entry is empty.
Brand names stay as they are.

- Source: SERP's Localization standard,
  [Strings](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/web-stack/localization.md#strings).
- Check: `src/lib/i18n/hardcoded-strings.test.ts`, "user-visible strings > come from the
  dictionary in the site pages and components"; `src/lib/i18n/dictionaries.test.ts`, "i18n
  dictionary parity > en.json and ja.json have identical keys", "value types match between en.json
  and ja.json" and "ja.json has no empty string values"; `src/components/header.dom.test.tsx`,
  "header navigation (%s) > labels the menu toggle with the dictionary text for the locale";
  `src/components/footer.dom.test.tsx`, "footer (%s) > links Videos, Legal and all services with
  the locale's dictionary text and localized paths".

**Services and legal pages in both languages.** Every service and every legal page has its own
Japanese text; none is missing in either language.

- Check: `src/lib/i18n/content-parity.test.ts`, "i18n content file parity > every English service
  page has a Japanese counterpart" and "every English legal page has a Japanese counterpart".

**The clinic's details.** The address, the days and the opening hours show in the page's
language, in the footer and on the contact page.

- Check: `src/components/footer.dom.test.tsx`, "footer (%s) > shows the address, phone and opening
  hours for the locale"; `src/lib/data/site.test.ts`, "business info > shows the same opening
  hours as the structured data (%s)".

**Names shown in both languages.** The areas index and the ward pages name each area in English
with its Japanese name below, on both languages' pages. The header's Areas Served menu names each
ward in the page's language with its name in the other language under it, and each area in the
page's language: Minato over 港区, then Roppongi, on English pages, and 港区 over Minato, then
六本木, on Japanese pages. A video with no Japanese title shows its English title on the Japanese
pages.

- Check: `src/app/[locale]/areas-served/page.dom.test.tsx`, "areas served (%s) > names each area
  of each ward in English and in Japanese on the areas index" and "shows %s with a Google map of
  the ward and each area named in both languages"; `src/components/header.dom.test.tsx`, "header
  navigation (%s) > names each ward and area in the Areas Served %s in this language";
  `src/app/[locale]/videos/page.test.tsx`, "Pitonne video pages > titles a Japanese watch page
  with the video’s Japanese title, or its English one without".

## The language switcher

**Where it is.** From 1280 pixels the header shows the switcher before the Phone dropdown; below
that it is the first item of the phone menu. It is one link, to the other language, named in that
language.

- Check: `e2e/language.spec.ts`, "the language switch leads to the same page in the other language
  and back", at both widths.

**Where it goes.** The link opens the same page in the other language. On a
post or category that isn't published in the other language it opens that language's blog
index, and on the 404 page the Japanese home page.

- Check: `e2e/language.spec.ts`, "the language switch leads to the same page in the other language
  and back"; `src/components/header.dom.test.tsx`, "header navigation (%s) > points the language
  switcher at a given path in the other language" and "the language switcher with posts in one
  language added to a copy of the content > on a %s page at %s, links the other language at
  %s".

## Search engines

**`lang`, canonical and hreflang.** Every page's `<html lang>` is its language, `en` or `ja`, and
its canonical is itself in that language. Its hreflang links name each language the page is
published in, and `x-default`: the English page, or the only one. Each page's translation names it
back, and the sitemaps list the same alternates. The English home page's URLs are the bare
origin, `https://pitonne.jp`.

- Source: SERP's Localization standard,
  [SEO signals](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/web-stack/localization.md#seo-signals);
  how each is written is in [`docs/i18n.md`](../i18n.md#seo-signals).
- Check: `e2e/language.spec.ts`, "the home page loads in English and in Japanese, each in its own
  language"; `src/lib/seo.test.tsx`, "SEO parity > writes the English homepage as the bare origin
  in its canonical, og:url and hreflang tags" and "lists the homepage as the bare origin, with
  hreflang alternates"; `src/lib/data/blog-posts.test.ts`, "single-locale blog posts > emits
  hreflang only for the locales a page exists in"; `src/lib/sitemaps.test.ts`, "sitemap URLs >
  keeps hreflang alternates reciprocal and inside the same sitemap";
  `scripts/audit-seo-build.mjs`, "hreflang alternate is not a page".

**`og:locale`.** Every page names its language for sharing: `en_US` or `ja_JP`.

- Check: `src/lib/seo.test.tsx`, "SEO parity > names each page’s language for sharing, and marks
  a post as an article with its date".

**Translations in structured data.** The business lists English and Japanese among the languages
it speaks. The site and each post name their language, and a post names its translation.

- Check: `src/lib/structured-data.test.tsx`, "structured data parity > renders organization and
  website JSON-LD in the root layout", for the business's two languages, and "names the language
  of the site and of each post". A post naming its translation: no automated check yet.
