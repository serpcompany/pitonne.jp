import type { CollectionBeforeValidateHook, Option, TypeWithID } from "payload"

type LocaleCode = "en" | "ja"

export const blogCategoryOptions = [
  {
    value: "iv-therapy",
    label: "IV Therapy",
    labels: {
      en: "IV Therapy",
      ja: "点滴療法",
    },
  },
  {
    value: "stem-cell-therapy",
    label: "Stem Cell Therapy",
    labels: {
      en: "Stem Cell Therapy",
      ja: "幹細胞治療",
    },
  },
  {
    value: "medication",
    label: "Medication",
    labels: {
      en: "Medication",
      ja: "薬",
    },
  },
  {
    value: "blood-tests",
    label: "Blood Tests",
    labels: {
      en: "Blood Tests",
      ja: "血液検査",
    },
  },
]

export const blogCategorySelectOptions: Option[] = blogCategoryOptions.map(({ label, value }) => ({
  label,
  value,
}))

export const blogTagOptions: Option[] = [
  "allergies",
  "athletes",
  "beauty",
  "booking",
  "clarity",
  "cold and flu",
  "competition",
  "conditioned media",
  "cost",
  "dehydration",
  "detox",
  "exosome iv",
  "fatigue",
  "focus",
  "glutathione",
  "gut health",
  "hangover iv",
  "hydration",
  "immune health",
  "iv therapy",
  "jet lag",
  "low energy",
  "mobile iv therapy",
  "nausea",
  "nutrition",
  "pricing",
  "private care",
  "recovery",
  "regenerative medicine",
  "relaxation",
  "risks",
  "safety",
  "skin iv",
  "stem cell therapy",
  "stress",
  "tokyo",
  "training recovery",
  "travel",
  "vitamins",
  "weight management",
  "wellness",
  "アレルギー",
  "ウェルネス",
  "エクソソーム IV",
  "グルタチオン",
  "スキン IV",
  "ストレス",
  "デトックス",
  "トレーニング後の回復",
  "ビタミン",
  "リスク",
  "リラクゼーション",
  "予約",
  "二日酔い IV",
  "低エネルギー",
  "体重管理",
  "価格設定",
  "免疫の健康",
  "再生医療",
  "吐き気",
  "回復",
  "在宅介護",
  "安全",
  "幹細胞治療",
  "旅行",
  "明瞭さ",
  "時差ぼけ",
  "東京",
  "栄養",
  "水分補給",
  "焦点",
  "疲労",
  "移動式点滴療法",
  "競技会",
  "美",
  "脱水",
  "腸の健康",
  "調製培地",
  "費用",
  "選手",
  "静脈内療法",
  "風邪とインフルエンザ",
].map((tag) => ({ label: tag, value: tag }))

export const relatedServiceSlugOptions: Option[] = [
  { label: "IV Therapy", value: "iv-therapy" },
  { label: "Exosome IV Drip", value: "exosome-iv-drip" },
  { label: "Hangover IV Drip", value: "hangover-iv-drip" },
  { label: "Energy & Fatigue Recovery IV", value: "energy-fatigue-recovery-iv" },
  { label: "Skin Brightening IV Drip", value: "skin-brightening-iv-drip" },
  { label: "Immune Boost IV Therapy", value: "immune-boost-iv-therapy" },
  { label: "IV Vitamin Therapy", value: "iv-vitamin-therapy" },
  { label: "Stem Cell Therapy", value: "stem-cell-therapy" },
  { label: "Stem Cell Nasal Spray", value: "stem-cell-nasal-spray" },
  { label: "Medication", value: "medication" },
  { label: "ED Medication", value: "ed-medication" },
  { label: "AGA Medication", value: "androgenetic-alopecia-medicine" },
  { label: "Blood Tests", value: "blood-tests" },
  { label: "Hormone Blood Testing", value: "hormone-blood-testing" },
  { label: "Nutrition Blood Testing", value: "nutrition-blood-testing" },
  { label: "Tumor Marker Blood Testing", value: "tumor-marker-blood-testing" },
]

type BlogPostWithCategory = TypeWithID & {
  category?: string | null
  categorySlug?: string | null
}

function getLocaleCode(locale: unknown): LocaleCode {
  return locale === "ja" ? "ja" : "en"
}

export function getBlogCategoryLabel(slug: string, locale: LocaleCode = "en") {
  const category = blogCategoryOptions.find((option) => option.value === slug)
  return category?.labels[locale] ?? category?.label ?? slug
}

export const syncBlogPostCategory: CollectionBeforeValidateHook<BlogPostWithCategory> = ({ data, req }) => {
  if (!data?.categorySlug) {
    return data
  }

  data.category = getBlogCategoryLabel(data.categorySlug, getLocaleCode(req.locale))
  return data
}
