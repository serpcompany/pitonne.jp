import Link from 'next/link'
import { localizedRoute } from '@/lib/data/routes'
import type { Locale } from '@/lib/i18n/config'

export function ContactButton({
  className = '',
  children,
  locale,
  onClick
}: {
  className?: string
  children: React.ReactNode
  locale: Locale
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}) {
  const href = localizedRoute('/contact/', locale)
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-md bg-[#7A8F87] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#245f5a] ${className}`}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}
