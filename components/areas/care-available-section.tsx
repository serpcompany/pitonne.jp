import Link from "next/link"
import { getServicesFromSlugs, serviceCategorySections } from "@/lib/data/services"

const careAvailable = serviceCategorySections.map((section) => ({
  title: section.title,
  href: section.href,
  items: getServicesFromSlugs(section.serviceSlugs).map((service) => ({
    title: service.name,
    href: service.canonicalPath,
  })),
}))

export function CareAvailableSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center font-serif text-3xl text-foreground">Care Available</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {careAvailable.map((group) => (
              <div key={group.title} className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-foreground">
                  <Link href={group.href} className="transition-colors hover:text-[#7A8F87] hover:underline">
                    {group.title}
                  </Link>
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {group.items.map((item) => (
                    <li key={item.title} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7A8F87]" />
                      <Link href={item.href} className="transition-colors hover:text-[#7A8F87] hover:underline">
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
