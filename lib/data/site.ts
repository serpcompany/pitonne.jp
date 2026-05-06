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

export const businessInfo = {
  name: "Pitonne",
  seoName: "Pitonne | Stem Cell & IV Therapy",
  addressLine1: "106-0031 Tokyo, Minato City, Nishiazabu",
  addressLine2: "3 Chome−17−22 モダンフォルム西麻布 1階",
  phone: "070-2194-0199",
  email: "pitonne.am@gmail.com",
  siteUrl: "https://pitonne.jp",
  bookingUrl: "https://ssv.onemorehand.jp/hic_pitonne/",
  hours: businessHours.map((item) => ({ day: item.day, hours: formatBusinessHours(item) })),
  description:
    "Pitonne is a concierge wellness service based in Nishi Azabu, Tokyo, specializing in premium IV therapy, stem cell related wellness support, and personalized in home or hotel visit care.",
}
