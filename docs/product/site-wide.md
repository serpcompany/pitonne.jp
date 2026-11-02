# Site-wide

What every page of pitonne.jp shares: the header and phone menu, the footer, breadcrumbs, the
booking and contact buttons, the phone number and LINE, images, analytics, and the quality bars
every page is held to. How a check is named is in
[How behavior is verified](index.md#how-behavior-is-verified).

## Header

**Header.** Every page has a header pinned to the top as the page scrolls, with the logo linking
home. From 1280 pixels it shows Home, About, Services, Areas Served, Blog and Videos, then the
language switcher ([Languages](languages.md#the-language-switcher)), a Phone dropdown, on
Japanese pages the LINE icon ([LINE](#buttons-and-contact)), and a Contact Us button that opens
the contact page. Its links change the page without a full reload. Below 1280 pixels it shows
the logo and a menu button.

- Source: [#112](https://github.com/serpcompany/pitonne.jp/issues/112), which moved the full
  header to 1280 pixels because it wrapped between 1024 and 1279.
- Check: `e2e/navigation.spec.ts`, "the header links each section, one page after another, without
  reloading" (desktop), for the six section links; `src/components/header.dom.test.tsx`, "header
  navigation (%s) > links Videos from the primary navigation and the mobile menu" and "opens the
  contact page in this language from Contact Us". The header staying pinned, the switch at 1280
  pixels, the logo's link and where the switcher sits: no automated check yet.

**Header menus.** About, Services and Areas Served are links to their pages, and each opens a menu
while the pointer is over it: About lists About and FAQs; Services, each service category, linking
its page, with its services, and a link to all services; Areas Served, each ward, linking its page,
with its areas, and a link to all areas. The Phone dropdown opens the same way and lists the
clinic's number. These menus open on hover only, not by click or keyboard, and their links are in
the page only while open.

- Check: `src/components/header.dom.test.tsx`, "header navigation (%s) > keeps FAQs out of the
  primary navigation and reveals it only in the desktop About dropdown", "lists each service
  category with its services, and each ward with its areas, in its desktop menus" and "offers
  only the Japan number in the phone menu and the mobile menu". That the menus open on hover only:
  no automated check yet.

**Phone menu.** Below 1280 pixels the menu button, named for screen readers, opens a menu under
the header: the language switcher first, then the sections, where About, Services and Areas Served
each open to list their pages, then the clinic's number, LINE on Japanese pages, and Contact Us.
Following a link closes the menu.

- Check: `e2e/navigation.spec.ts`, "the phone menu opens each section, its sections expanding to
  their pages" (phone); `src/components/header.dom.test.tsx`, "header navigation (%s) > keeps FAQs
  out of the mobile menu until the About section is expanded", "links Videos from the primary
  navigation and the mobile menu" and "labels the menu toggle with the dictionary text for the
  locale".

## Footer

**Footer.** Every page ends with a map of the clinic and a link for directions; the logo, the
clinic's name, address and phone, and the opening hours with a note on care outside them; quick
links to Home, About, Services, Blog, Videos, FAQs, Contact and Legal; the service categories, with
a link to all services; eight areas, with a link to all areas; nine social links, Google Maps
among them, and four podcast listings, each opening in a new tab; and the copyright line.

- Check: `src/components/footer.dom.test.tsx`, "footer (%s) > links Videos, Legal and all services
  with the locale's dictionary text and localized paths" and "shows the address, phone and opening
  hours for the locale", and "shows a map of the clinic, eight areas, and its social and podcast
  accounts, each in a new tab".

**Opening hours.** Monday to Friday 9:00 to 17:00, Saturday 9:00 to 13:00, closed on Sunday. The
footer, the contact page and the business's structured data show the same hours.

- Check: `src/components/footer.dom.test.tsx`, "footer and CTA data parity > uses live business
  hours and legal routes"; `src/lib/data/site.test.ts`, "business info > shows the same opening
  hours as the structured data (%s)".

## Every page

**Breadcrumbs and one heading.** Every page but the home page and the 404 page opens with
breadcrumbs from Home to the page, the current page last and unlinked, and every page has exactly
one `<h1>`.

- Check: `src/components/shared/page-hero.dom.test.tsx`, "shared page hero > renders the %s page
  (%s) through the shared hero"; `scripts/audit-seo-build.mjs`, "<h1> tags (want 1)".

**Images.** The photos and logos a page shows are the site's own files: none comes from Google
Drive, and no demo template's image or brand remains. The videos' thumbnails come from YouTube.
No image is over 5 MB.

- Check: `src/lib/data/sheet-images.dom.test.tsx`, "rendered site images > renders only local
  image files on the %s page (%s)" and "shows no demo template assets on the %s page (%s)", and
  "sheet image integration > keeps every image the site renders from data as a local file rather
  than a Google Drive link", and "Google Drive images > are named in no file of the site’s code
  or content" and "are on no %s page (%s), style attributes included";
  `scripts/audit-seo-build.mjs`, "image is … MB (max … MB)".

**No errors in the browser.** No page logs a console error or throws an uncaught error while a
visitor loads it, follows its links or opens its menus.

- Check: every journey in `e2e/`, through `e2e/fixtures.ts`, "the page logs no console error and
  throws no error"; `tools/checks/e2e.test.ts`, "the browser journeys > fail a journey on a
  console error or an uncaught page error".

**Quality bars.** On Lighthouse's desktop preset, the home page, the blog, IV therapy, a post, an
area, a watch page, the contact page and the Japanese home page score at least 0.95 for
accessibility and best practices and 0.9 for SEO; a performance score under 0.5 is a warning.
Lighthouse's colour-contrast audit is skipped, for the brand green under white text.

- Check: CI's `lighthouse` job, with the assertions in `lighthouserc.cjs`;
  `tools/checks/lighthouse-ci.test.ts`, "Lighthouse CI setup > audits the home page and blog with
  the agreed skipped audits and best-practices threshold";
  `src/components/shared/brand-color.dom.test.tsx`, "brand color > does not fail Lighthouse on the
  brand color contrast audit".

## Buttons and contact

**Booking.** Every booking button opens LeadConnector's booking calendar in a new tab: the English
calendar from English pages and the Japanese one from Japanese pages. Booking buttons are on the
home page, About, the contact page, and the service and post sidebars, in the brand green.

- Source: [#48](https://github.com/serpcompany/pitonne.jp/issues/48).
- Check: `src/app/[locale]/page.dom.test.tsx`, "home page > uses an accessible green CTA style and
  opens the hero booking link in a new tab"; `src/lib/data/site.test.ts`, "business info > uses
  the clinic phone, address and booking pages from the business sheet";
  `src/components/shared/brand-color.dom.test.tsx`, "brand color > keeps the Pitonne green on the
  contact and booking buttons (%s)".

**Contact buttons.** Every contact button, in the header, the phone menu, the blog index, posts,
categories, the areas pages and the legal index, opens the contact page in the page's language.

- Check: `src/components/shared/contact-button.dom.test.tsx`, "contact button > opens the contact
  page in the page’s language (%s)"; `src/components/header.dom.test.tsx`, "header navigation (%s)
  > opens the contact page in this language from Contact Us";
  `src/components/shared/brand-color.dom.test.tsx`, "brand color > keeps the Pitonne green on the
  contact and booking buttons (%s)".

**The phone number.** The site shows one number, the clinic's Japan number, as a link that calls
it: in the header's Phone dropdown, the phone menu, the footer and the contact page. The U.S.
number it once showed appears nowhere.

- Source: [#115](https://github.com/serpcompany/pitonne.jp/issues/115).
- Check: `src/components/header.dom.test.tsx`, "header navigation (%s) > offers only the Japan
  number in the phone menu and the mobile menu"; `src/app/[locale]/contact/page.dom.test.tsx`,
  "contact page > renders only the Japan phone number as a callable link (%s)";
  `src/lib/retired-contact-details.test.ts`, "retired contact details > does not appear in any site
  file as the retired U.S. phone number"; `e2e/pages.spec.ts`, "the contact page offers the
  clinic’s phone and opens and closes the message form".

**LINE.** Japanese pages offer the clinic's LINE account: an icon in the header from 1280 pixels,
a LINE row in the phone menu, and a LINE row on the contact page, each opening LINE in a new tab.
English pages have no LINE link.

- Source: [#112](https://github.com/serpcompany/pitonne.jp/issues/112).
- Check: `src/components/header.dom.test.tsx`, "header navigation (%s) > offers the clinic’s LINE
  account in a new tab on Japanese pages only, beside the phone and in the phone menu";
  `src/app/[locale]/contact/page.dom.test.tsx`, "contact page > offers the clinic’s LINE account
  in a new tab on the Japanese page only (%s)".

## Analytics

**Analytics.** Production pages load Google Tag Manager. Staging, pull request previews and local
builds load no analytics.

- Check: `src/lib/seo.test.tsx`, "SEO parity > renders Google Tag Manager only for production
  deployments"; `src/lib/site-origin.test.tsx`, "staging pages > are indexable and load no
  analytics".
