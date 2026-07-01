import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { localizedRoute } from "@/lib/data/routes"

export function ContactButton({
  className = "",
  children,
  locale,
  onClick,
}: {
  className?: string
  children?: React.ReactNode
  locale?: Locale
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}) {
  const dict = getDictionary(locale ?? "en")
  const href = locale ? localizedRoute("/contact/", locale) : "/contact/"
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-md bg-[#7A8F87] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#245f5a] ${className}`}
      onClick={onClick}
    >
      {children ?? dict.common.contactUs}
    </Link>
  )
}
