import Link from "next/link"

export function ContactButton({
  className = "",
  children = "Contact Us",
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <Link
      href="/contact/"
      className={`inline-flex items-center justify-center rounded-md bg-[#7A8F87] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#245f5a] ${className}`}
    >
      {children}
    </Link>
  )
}
