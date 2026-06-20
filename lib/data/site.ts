import type { Locale } from "@/lib/i18n/config"

export type BusinessDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday"

export type OpenBusinessHours = {
  day: BusinessDay
  opens: string
  closes: string
}

export type ClosedBusinessHours = {
  day: BusinessDay
  closed: true
}

export type BusinessHoursEntry = OpenBusinessHours | ClosedBusinessHours

export const businessHours: readonly BusinessHoursEntry[] = [
  { day: "Monday", opens: "09:00", closes: "17:00" },
  { day: "Tuesday", opens: "09:00", closes: "17:00" },
  { day: "Wednesday", opens: "09:00", closes: "17:00" },
  { day: "Thursday", opens: "09:00", closes: "17:00" },
  { day: "Friday", opens: "09:00", closes: "17:00" },
  { day: "Saturday", opens: "09:00", closes: "13:00" },
  { day: "Sunday", closed: true },
]

export function isOpenBusinessHours(entry: BusinessHoursEntry): entry is OpenBusinessHours {
  return !("closed" in entry)
}

function formatEnglishTime(time: string) {
  const [rawHour, minute] = time.split(":").map(Number)
  const period = rawHour >= 12 ? "PM" : "AM"
  const hour = rawHour % 12 || 12
  return `${hour}:${minute.toString().padStart(2, "0")} ${period}`
}

export function formatBusinessHours(entry: BusinessHoursEntry) {
  return isOpenBusinessHours(entry) ? `${formatEnglishTime(entry.opens)} - ${formatEnglishTime(entry.closes)}` : "Closed"
}

export const businessHoursDisplay = [
  { day: "Monday - Friday", hours: "9:00 AM - 5:00 PM" },
  { day: "Saturday", hours: "9:00 AM - 1:00 PM" },
  { day: "Sunday & Public Holidays", hours: "Closed" },
] as const

const businessHoursDisplayJa = [
  { day: "月曜日 - 金曜日", hours: "9:00 - 17:00" },
  { day: "土曜日", hours: "9:00 - 13:00" },
  { day: "日曜日・祝日", hours: "休診" },
] as const

export const businessInfo = {
  name: "Pitonne",
  seoName: "Pitonne | Stem Cell & IV Therapy",
  addressLine1: "106-0031 Tokyo, Minato City, Nishiazabu",
  addressLine2: "3 Chome−17−22 モダンフォルム西麻布 1階",
  phone: "03-6821-8285",
  email: "pitonne.am@gmail.com",
  siteUrl: "https://pitonne.jp",
  bookingUrl: "https://ssv.onemorehand.jp/hic_pitonne/reserve/index?preview=on&lang=en",
  hours: businessHoursDisplay,
  description:
    "Pitonne is a concierge wellness service based in Nishi Azabu, Tokyo, specializing in premium IV therapy, stem cell related wellness support, and personalized in home or hotel visit care.",
}

const businessInfoJa = {
  ...businessInfo,
  addressLine1: "〒106-0031 東京都港区西麻布",
  addressLine2: "3丁目17-22 モダンフォルム西麻布 1階",
  bookingUrl: "https://ssv.onemorehand.jp/hic_pitonne/reserve/index?preview=on&lang=ja",
  hours: businessHoursDisplayJa,
  description:
    "Pitonneは、東京・西麻布を拠点とするコンシェルジュ型ウェルネスサービスです。プレミアム点滴療法、幹細胞関連のウェルネスサポート、ご自宅やホテルへの出張ケアを専門としています。",
}

export function getBusinessInfo(locale: Locale = "en") {
  return locale === "ja" ? businessInfoJa : businessInfo
}
