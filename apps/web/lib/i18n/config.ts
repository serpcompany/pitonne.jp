export const locales = ["en", "ja"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"
export const nonDefaultLocales = ["ja"] as const satisfies readonly Locale[]

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}
