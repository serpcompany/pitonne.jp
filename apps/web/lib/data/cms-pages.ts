import { getCmsPage, type CmsPageContent, type CmsPageKey } from "@/lib/cms/payload"
import type { Locale } from "@/lib/i18n/config"

export type CorePageKey = CmsPageKey
export type CorePageContent = CmsPageContent

export async function getCorePageContent(key: CorePageKey, locale: Locale = "en"): Promise<CorePageContent | null> {
  return getCmsPage(key, locale)
}
