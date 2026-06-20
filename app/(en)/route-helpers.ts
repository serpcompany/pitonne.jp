import type { Locale } from "@/lib/i18n/config"

export const englishLocale: Locale = "en"
export const englishLocaleParams = Promise.resolve({ locale: englishLocale })

export type PageProps<T extends Record<string, string> = Record<string, never>> = {
  params: Promise<T>
}

export function withEnglishLocale<T extends Record<string, string>>(params: Promise<T>) {
  return params.then((resolved) => ({ locale: englishLocale, ...resolved }))
}
