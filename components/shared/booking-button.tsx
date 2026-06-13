import Link from "next/link"
import { businessInfo } from "@/lib/data/site"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"

export function BookingButton({ className = "", locale = "en" as Locale }: { className?: string; locale?: Locale }) {
  const dict = getDictionary(locale)
  return (
    <Link
      href={businessInfo.bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-md bg-[#7A8F87] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#245f5a] ${className}`}
    >
      {dict.common.bookConsultation}
    </Link>
  )
}
