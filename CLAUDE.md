# Pitonne.jp — Project Instructions

## i18n Rules

- Every user-visible string in JSX must come from `getDictionary(locale)`, never hardcoded.
  Exception: brand names ("Pitonne"), technical identifiers, and `aria-hidden` content.
- When adding a new UI string, add the key to BOTH `lib/i18n/dictionaries/en.json` and
  `lib/i18n/dictionaries/ja.json` in the same commit. Never add a key to only one file.
- Components receive `locale` as a prop. Call `getDictionary(locale)` at the component level.
- All `<Link href>` values must use `localizedRoute(path, locale)`.
- All content files (blog, services, legal) must exist in both `content/*/` and `content/*/ja/`.
  When creating a new English content file, always create the Japanese counterpart.
- The area data model uses co-located fields (`name`/`nameJa`, `description`/`descriptionJa`).
  When adding a new area, provide both English and Japanese values inline.
- Metadata (`title`, `description`, `openGraph`) must use dictionary values or locale-aware
  data, never hardcoded English.
- Business data (address, hours, phone) must come from `getBusinessInfo(locale)`, not `businessInfo` directly.
- Run `pnpm test` before committing to catch dictionary key sync and content parity issues.
- Run `pnpm audit:strings` to check for hardcoded English in components.

## Architecture Quick Reference

- **Locale config**: `lib/i18n/config.ts`
- **Dictionaries**: `lib/i18n/dictionaries/{en,ja}.json`
- **Dictionary loader**: `lib/i18n/dictionaries.ts` — `getDictionary(locale)`
- **Route localization**: `lib/data/routes.ts` — `localizedRoute(path, locale)`
- **Business data**: `lib/data/site.ts` — `getBusinessInfo(locale)`
- **Content data**: `lib/data/blog-posts.ts`, `lib/data/services.ts` (accept `locale` param)
- **Area data**: `lib/data/areas.ts` (co-located en/ja fields)
- **i18n docs**: `docs/i18n.md`

## CI Pipeline

Tests run on every PR: `pnpm lint` → `pnpm test` → `pnpm audit:strings` → `pnpm build` → `pnpm test:lighthouse`

Key parity tests in `tests/parity/`:
- `i18n-dictionaries.test.ts` — en.json and ja.json must have identical keys
- `i18n-content-parity.test.ts` — blog, services, legal must exist in both locales

## Conventions

- Pages use Next.js App Router with `[locale]` dynamic segment
- Components are in `components/`, page templates in `app/[locale]/`
- Shared components (`components/shared/`) accept `locale` prop
- Content is markdown in `content/{blog,services,pages}/` with `ja/` subdirectories
- Use `canonicalRoutes` from `lib/data/routes.ts` for all internal paths
- SEO helpers in `lib/seo.ts`: `localizedCanonicalUrl`, `localizedHreflangAlternates`
