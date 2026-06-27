import Link from "next/link"
import type { Service } from "@/lib/data/services"

export function ServiceCardGrid({
  services,
  cardClassName = "bg-background",
}: {
  services: Service[]
  cardClassName?: string
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <Link
          key={service.slug}
          href={service.canonicalPath}
          aria-label={service.name}
          className={`group block overflow-hidden rounded-lg border border-border transition-all hover:border-[#7A8F87] hover:shadow-md ${cardClassName}`}
        >
          {service.image && (
            <div className="h-40 overflow-hidden">
              <img
                src={service.image}
                alt={service.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
          <div className="p-6">
            <h3 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-[#7A8F87]">
              {service.name}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">{service.shortDescription}</p>
            <ul className="space-y-1">
              {service.keyPoints.slice(0, 3).map((point) => (
                <li key={point} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#7A8F87]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </Link>
      ))}
    </div>
  )
}
