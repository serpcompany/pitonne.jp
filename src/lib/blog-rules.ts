// Blog content rules shared by the zod schema (lib/data/blog-posts.ts) and the Keystatic config.
// No Node imports: keystatic.config.ts also runs in the browser.
import seoLimits from "@/lib/seo-limits.json"
import type { Locale } from "@/lib/i18n/config"

export const BLOG_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const EXCERPT_MIN_LENGTH = 70
export const EXCERPT_MAX_LENGTH = 160

// The rendered meta description (metaDescription ?? excerpt) must fit the audit:meta range
export const META_DESCRIPTION_MIN_LENGTH = seoLimits.description.min
export const META_DESCRIPTION_MAX_LENGTH = seoLimits.description.max
// metaTitle is rendered with the " | Pitonne" suffix, which counts toward the audit:meta range
export const META_TITLE_MIN_LENGTH = seoLimits.title.min - seoLimits.titleSuffix.length
export const META_TITLE_MAX_LENGTH = seoLimits.title.max - seoLimits.titleSuffix.length

export const BLOG_AUTHOR_DEFAULTS: Record<Locale, { name: string; role: string }> = {
  en: { name: "Pitonne Medical Team", role: "Wellness Experts" },
  ja: { name: "ピトン・メディカル・チーム", role: "ウェルネス専門家" },
}

// Must list every file in content/services (checked by tests/parity/blog-content-model.test.ts)
export const BLOG_RELATED_SERVICE_OPTIONS = [
  { label: "AGA Medication", value: "androgenetic-alopecia" },
  { label: "Blood Tests", value: "blood-tests" },
  { label: "Custom Vitamin IV & Injection", value: "iv-vitamin-therapy" },
  { label: "ED Medication", value: "ed-medication" },
  { label: "Energy & Fatigue Recovery IV", value: "energy-fatigue-recovery-iv" },
  { label: "Exosome IV Drip", value: "exosome-iv-drip" },
  { label: "Hangover IV Drip", value: "hangover-iv-drip" },
  { label: "High Dose Vitamin C IV Therapy", value: "high-dose-vitamin-c-iv-therapy" },
  { label: "Hormone Blood Testing", value: "hormone-blood-testing" },
  { label: "Immune Boost IV Therapy", value: "immune-boost-iv-therapy" },
  { label: "IV Therapy", value: "iv-therapy" },
  { label: "Medication", value: "medication" },
  { label: "NMN IV Therapy", value: "nmn-iv-therapy" },
  { label: "Nutrition Blood Testing", value: "nutrition-blood-testing" },
  { label: "Skin Brightening IV Drip", value: "skin-brightening-iv-drip" },
  { label: "Stem Cell Nasal Spray", value: "stem-cell-nasal-spray" },
  { label: "Stem Cell Therapy", value: "stem-cell-therapy" },
  { label: "Tumor Marker Blood Testing", value: "tumor-marker-blood-testing" },
]
