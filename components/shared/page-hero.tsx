import type { ReactNode } from "react"
import { Breadcrumbs, type BreadcrumbItem } from "@/components/shared/breadcrumbs"

type PageHeroSize = "standard" | "compact"

export interface PageHeroProps {
  breadcrumbs?: BreadcrumbItem[]
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  size?: PageHeroSize
  className?: string
}

const sectionPadding: Record<PageHeroSize, string> = {
  standard: "py-16 md:py-20",
  compact: "py-12 md:py-16",
}

export function PageHero({
  breadcrumbs,
  eyebrow,
  title,
  description,
  meta,
  actions,
  children,
  size = "standard",
  className = "",
}: PageHeroProps) {
  return (
    <section className={`bg-[#faf9f7] ${sectionPadding[size]} ${className}`}>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
          {eyebrow && <div className="mb-4 text-sm uppercase tracking-widest text-[#2D766F]">{eyebrow}</div>}
          {meta && <div className="mb-4 text-sm text-muted-foreground">{meta}</div>}
          <h1 className="mb-6 font-serif text-4xl text-foreground md:text-5xl">{title}</h1>
          {description && <div className="max-w-3xl text-lg text-muted-foreground">{description}</div>}
          {children && <div className="mt-6">{children}</div>}
          {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
        </div>
      </div>
    </section>
  )
}
