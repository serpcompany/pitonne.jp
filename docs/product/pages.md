# Pages

What each page of pitonne.jp shows: the home page, About, FAQs, the services, the areas served,
the videos, Contact, the legal pages and the 404 page. Each is at its English URL and again under
`/ja/` ([Languages](languages.md)). The blog is in [Blog](blog.md), and the header, footer,
breadcrumbs and buttons every page shares are in [Site-wide](site-wide.md). How a check is named
is in [How behavior is verified](index.md#how-behavior-is-verified).

## Home

**Home page.** `/` opens with the clinic's headline and a booking button. Then come who Pitonne
is, with a link to About; four cards, for IV therapy, stem cell therapy, medications and blood
tests, each opening its service page; and the three newest posts in the page's language, with a
link to the blog. The Japanese home page, `/ja/`, adds a section on why to choose Pitonne after the
service cards, which the English page doesn't have.

- Check: `src/app/[locale]/page.dom.test.tsx`, "home page > uses an accessible green CTA style
  and opens the hero booking link in a new tab"; `e2e/language.spec.ts`, "the home page loads in
  English and in Japanese, each in its own language". The service cards, the newest posts and the
  Japanese-only section: no automated check yet.

**The first screen.** The headline and the booking button fill the first screen at every width,
and the clinic photo below them isn't fetched ahead of them.

- Check: `src/app/[locale]/page.dom.test.tsx`, "home page > keeps the supporting homepage image
  out of the mobile LCP path".

## About and FAQs

**About.** `/about/`: why the clinic exists, how its visit-based care works, with a booking
button, and the three members of its team with their roles and bios.

- Check: No automated check yet.

**FAQs.** `/faqs/`: the clinic's questions, each a heading with its answer, the same questions in
both languages. The header reaches the page only through the About menu, and the phone menu's
About section; the footer and the 404 page link it directly. Search engines get the questions as
`FAQPage` structured data.

- Check: `src/app/[locale]/faqs/page.dom.test.tsx`, "FAQs page > renders the requested FAQ
  content" and "exposes FAQ metadata and sitemap entry"; `src/lib/i18n/dictionaries.test.ts`,
  "i18n dictionary parity > faqs.items arrays have the same length";
  `src/components/header.dom.test.tsx`, "header navigation (%s) > keeps FAQs out of the primary
  navigation and reveals it only in the desktop About dropdown" and "keeps FAQs out of the mobile
  menu until the About section is expanded". The `FAQPage` data: no automated check yet.

## Services

**Services index.** `/services/`: a photo, how a visit works, the price list with its notes, and
then one section per category, in this order: IV therapy, stem cell therapy, medications and blood
tests. Each section shows its services as cards and links the category's own page.

- Check: `src/components/services/service-templates.dom.test.tsx`, "service page parity > matches
  live service index grouping and card order" and "renders services index pricing and
  how-it-works sections in Japanese"; `src/lib/data/sheet-images.dom.test.tsx`, "sheet images on
  rendered templates (%s) > shows the sheet services image on the services index".

**Category pages.** Each category has a page of its own: `/services/iv-therapy/`,
`/services/stem-cell-therapy/`, `/services/medication/` and `/services/blood-tests/`. Each shows
its photo and text, then its treatments as cards, and links to all services.

- Check: `src/components/services/service-templates.dom.test.tsx`, "service page parity > renders
  parent services with markdown content and available treatments";
  `src/lib/data/sheet-images.dom.test.tsx`, "sheet images on rendered templates (%s) > shows each
  parent service's own image in its hero".

**Service pages.** Each service, at `/services/<slug>/`, has breadcrumbs back through its category
to Services and a plain heading with no photo. Below come its text and FAQs, beside a sidebar with
a booking box, its related services, and up to three posts: those that name the service as
related, or the three newest when none does. The old `/services/medications/` redirects to
`/services/medication/` ([Moved URLs](hosts-and-redirects.md#moved-urls)).

- Check: `src/components/services/service-templates.dom.test.tsx`, "service page parity > renders
  leaf services with breadcrumbs, sidebar, and the live booking URL" and "keeps leaf service
  sidebars focused on specific related services";
  `src/app/[locale]/services/[service]/page.dom.test.tsx`, "service page hero > is a plain hero
  with breadcrumbs back to Services on %s (%s)";
  `src/lib/data/routes.test.ts`, "routes > serves every service at its canonical path (%s)";
  `e2e/pages.spec.ts`, "a service page opens from the services index and leads back to it". The
  newest-posts fallback: no automated check yet.

## Areas served

**Areas index.** `/areas-served/` lists the five wards the clinic serves, Minato, Shibuya, Chuo,
Chiyoda and Shinagawa, each with a link to its page and its areas, each area named in English
with its Japanese name below. Then come the three kinds of visit, at home, at a hotel and at an
office, and a contact button for an area that isn't listed.

- Check: `e2e/pages.spec.ts`, "an area page opens from its ward, which opens from the areas
  index".

**Ward pages.** `/areas-served/<ward>/`: the ward's description, its areas as cards, a Google map
of the ward, every service category and service as links, the steps to get started with a contact
button, the latest posts, and a link back to all areas.

- Check: `e2e/pages.spec.ts`, "an area page opens from its ward, which opens from the areas
  index". The ward's map: no automated check yet.

**Area pages.** `/areas-served/<ward>/<area>/` has breadcrumbs through its ward, then every
service category and service as links; how to get started, with a contact button; the area's
notes, nearby landmarks and a Google map of it; the area FAQs; the latest posts; and links to the
ward's other areas. Tokyo Station has no area page.

- Check: `src/components/area-detail-page.dom.test.tsx`, "area detail parity > renders the
  live-style area template with map, local access, and contact actions", "links every care
  available category and real service page", "embeds a Google map of %s (%s)" and "does not treat
  Tokyo Station as a Chiyoda area"; `src/lib/data/routes.test.ts`, "routes > does not treat Tokyo
  Station as an area".

## Videos

**Videos index.** `/videos/` lists the clinic's YouTube videos, each with its thumbnail and title,
opening its watch page.

- Check: `src/app/[locale]/videos/page.test.tsx`, "Pitonne video pages > renders a videos index
  and watch page with embedded YouTube players" and "keeps exact public YouTube metadata for the
  channel videos".

**Watch pages.** `/watch/<slug>/` has breadcrumbs back to Videos, the video's title, the video in
YouTube's privacy-enhanced player (`youtube-nocookie.com`), and up to three other videos. A
Japanese page shows a video's Japanese title where it has one, and its English title otherwise.

- Check: `src/app/[locale]/videos/page.test.tsx`, "Pitonne video pages > renders a videos index
  and watch page with embedded YouTube players", "builds watch paths, embed URLs, and lookups from
  slugs" and "generates static params and metadata for watch pages". The Japanese title's
  fallback: no automated check yet.

## Contact

**Contact page.** `/contact/` has a booking button; the clinic's phone, as a link that calls it;
the address; and the opening hours, with a note on care outside them. No email address appears
on it, or anywhere on the site.

- Source: [#48](https://github.com/serpcompany/pitonne.jp/issues/48) (the booking calendar, no
  email address); [#115](https://github.com/serpcompany/pitonne.jp/issues/115) (only the Japan
  number).
- Check: `src/app/[locale]/contact/page.dom.test.tsx`, "contact page > renders only the Japan
  phone number as a callable link (%s)" and "does not expose the retired Gmail address";
  `src/lib/retired-contact-details.test.ts`, "retired contact details > does not appear in any
  site file as the retired Gmail address"; `e2e/pages.spec.ts`, "the contact page offers the
  clinic’s phone and opens and closes the message form".

**The message form.** The English contact page has a Send a message button that opens
LeadConnector's contact form in a dialog, with a close button; the form loads only once the
dialog opens. The Japanese contact page has no form, and offers LINE instead
([LINE](site-wide.md#buttons-and-contact)).

- Source: [#48](https://github.com/serpcompany/pitonne.jp/issues/48).
- Check: `src/app/[locale]/contact/page.dom.test.tsx`, "contact page > opens the secure GHL
  contact form instead of linking to the legacy inquiry site" and "does not offer the
  English-only contact form on the Japanese contact page"; `e2e/pages.spec.ts`, "the contact page
  offers the clinic’s phone and opens and closes the message form".

## Legal

**Legal pages.** `/legal/` links the Privacy Policy at `/legal/privacy-policy/`, the Terms of Use
at `/legal/terms-conditions/` and the Medical Disclaimer at `/legal/disclaimer/`, and ends with a
contact button. Each legal page shows its text in the page's language.

- Check: `src/lib/seo.test.tsx`, "SEO parity > serves no legacy legal URL: no page, no Next.js
  redirect and no Cloudflare Pages redirect", which also requires the three pages;
  `src/lib/i18n/content-parity.test.ts`, "i18n content file parity > every English legal page has
  a Japanese counterpart".

**Retired legal URLs.** `/privacy-policy/`, `/terms-of-use/`, `/medical-disclaimer/` and
`/legal/terms-and-conditions/`, in either language, answer 404: they have no page and no redirect.

- Check: `src/lib/data/routes.test.ts`, "routes > has no page or redirect for the retired legal
  URLs"; `src/lib/seo.test.tsx`, "SEO parity > serves no legacy legal URL: no page, no Next.js
  redirect and no Cloudflare Pages redirect".

## The 404 page

**Missing pages.** A URL with no page answers 404 with the site's 404 page: one heading and one
sentence saying the page doesn't exist; links to the home page, Services, Blog, Areas Served,
Videos and FAQs; and every service category and every blog category with posts. It carries one
robots tag, `noindex`, and no link to an HTML sitemap, since the site has none. A missing URL
under `/ja/` gets the same English page, whose language switcher opens `/ja/`; why is in
[`docs/i18n.md`](../i18n.md#the-404-page).

- Source: SERP's
  [404 Pages](https://github.com/serpcompany/serp/blob/main/docs/engineering/standards/web-stack/404-pages.md)
  standard.
- Check: `src/components/not-found-page.dom.test.tsx`, "not-found page (%s) > says the page does
  not exist in one heading and one sentence", "links to the home page and every section index in
  this locale", "links to every service category in the header menu and every blog category with
  posts" and "has no link to an HTML sitemap"; `src/app/global-not-found.test.ts`, "global
  not-found page > takes its title from the dictionary and leaves the single noindex tag to
  Next.js"; `e2e/environment.spec.ts`, "answers a missing page with the 404 page, which no
  environment indexes"; `scripts/audit-out.mjs`, "has no <html lang=…>", "robots meta tags,
  expected one with noindex" and "has no link to …" for `out/404.html`;
  `scripts/smoke-environment.mjs`, "has no link to the home page" and "expected one with noindex"
  for `/no-such-page-smoke-test/`.
