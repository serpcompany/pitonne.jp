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
  { day: "Monday", opens: "10:00", closes: "19:00" },
  { day: "Tuesday", opens: "10:00", closes: "19:00" },
  { day: "Wednesday", opens: "10:00", closes: "19:00" },
  { day: "Thursday", opens: "10:00", closes: "19:00" },
  { day: "Friday", opens: "10:00", closes: "19:00" },
  { day: "Saturday", opens: "10:00", closes: "13:00" },
  { day: "Sunday", closed: true },
]

export function isOpenBusinessHours(entry: BusinessHoursEntry): entry is OpenBusinessHours {
  return !("closed" in entry)
}

export function formatBusinessHours(entry: BusinessHoursEntry) {
  return isOpenBusinessHours(entry) ? `${entry.opens} - ${entry.closes}` : "Closed"
}

const dayNamesJa: Record<BusinessDay, string> = {
  Monday: "月曜日",
  Tuesday: "火曜日",
  Wednesday: "水曜日",
  Thursday: "木曜日",
  Friday: "金曜日",
  Saturday: "土曜日",
  Sunday: "日曜日",
}

function formatBusinessHoursJa(entry: BusinessHoursEntry) {
  return isOpenBusinessHours(entry) ? `${entry.opens} - ${entry.closes}` : "休診"
}

export const businessInfo = {
  name: "Pitonne",
  seoName: "Pitonne | Stem Cell & IV Therapy",
  addressLine1: "106-0031 Tokyo, Minato City, Nishiazabu",
  addressLine2: "3 Chome−17−22 モダンフォルム西麻布 1階",
  phone: "070-2194-0199",
  email: "pitonne.am@gmail.com",
  siteUrl: "https://pitonne.jp",
  bookingUrl: "https://ssv.onemorehand.jp/hic_pitonne/reserve/index?preview=on&lang=en",
  hours: businessHours.map((item) => ({ day: item.day, hours: formatBusinessHours(item) })),
  description:
    "Pitonne is a concierge wellness service based in Nishi Azabu, Tokyo, specializing in premium IV therapy, stem cell related wellness support, and personalized in home or hotel visit care.",
}

const businessInfoJa = {
  ...businessInfo,
  bookingUrl: "https://ssv.onemorehand.jp/hic_pitonne/reserve/index?preview=on&lang=ja",
  hours: businessHours.map((item) => ({ day: dayNamesJa[item.day], hours: formatBusinessHoursJa(item) })),
  description:
    "Pitonneは、東京・西麻布を拠点とするコンシェルジュ型ウェルネスサービスです。プレミアム点滴療法、幹細胞関連のウェルネスサポート、ご自宅やホテルへの出張ケアを専門としています。",
}

export function getBusinessInfo(locale: Locale = "en") {
  return locale === "ja" ? businessInfoJa : businessInfo
}
