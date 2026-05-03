import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PageHero } from "@/components/shared/page-hero"
import { getWard, wards } from "@/lib/data/areas"

export async function generateStaticParams() {
  return wards.map((ward) => ({ ward: ward.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ ward: string }> }): Promise<Metadata> {
  const { ward: wardSlug } = await params
  const ward = getWard(wardSlug)
  if (!ward) return { title: "Area Not Found | Pitonne" }
  
  return {
    title: `IV Therapy & Wellness in ${ward.name}, Tokyo | Pitonne`,
    description: `Premium IV therapy and stem cell services in ${ward.name} Ward (${ward.nameJa}), Tokyo. ${ward.description}`,
  }
}

export default async function WardPage({ params }: { params: Promise<{ ward: string }> }) {
  const { ward: wardSlug } = await params
  const ward = getWard(wardSlug)
  
  if (!ward) {
    notFound()
  }

  const mapQuery = encodeURIComponent(`${ward.name}, Tokyo, Japan`)
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`

  return (
    <div className="bg-background">
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Areas Served", href: "/areas-served/" },
          { label: ward.name },
        ]}
        eyebrow={ward.nameJa}
        title={`Stem Cell & IV Therapy in ${ward.name}, Tokyo`}
        description={ward.description}
      />

      {/* Areas Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-serif text-3xl text-foreground mb-8 text-center">
            Neighborhoods in {ward.name}
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {ward.areas.map((area) => (
              <Link
                key={area.slug}
                href={`/areas-served/${ward.slug}/${area.slug}`}
                className="bg-card p-6 rounded-lg border border-border hover:shadow-md hover:border-[#4AA69D] transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-[#f5ebe0] rounded-full flex items-center justify-center group-hover:bg-[#4AA69D] transition-colors">
                    <svg className="w-6 h-6 text-[#4AA69D] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{area.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{area.nameJa}</p>
                    <p className="text-sm text-[#4AA69D]">View services &rarr;</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8 text-center">
            <h2 className="font-serif text-3xl text-foreground mb-4">
              Map of {ward.name}, Tokyo
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Use this map to orient around {ward.name} Ward and the neighborhoods Pitonne serves in central Tokyo.
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-background">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="360"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${ward.name}, Tokyo map`}
              className="block w-full"
            />
          </div>
        </div>
      </section>

      {/* Care Available */}
      <section className="py-16 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-3xl text-foreground mb-8 text-center">
            Care Available in {ward.name}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card p-8 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-4">Services We Offer</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                  <span className="text-muted-foreground">IV therapy and wellness consultation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                  <span className="text-muted-foreground">Stem cell related treatment planning</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                  <span className="text-muted-foreground">Online medication consultation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                  <span className="text-muted-foreground">In-home or hotel visit coordination</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                  <span className="text-muted-foreground">Private follow-up for international visitors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                  <span className="text-muted-foreground">Concierge scheduling from Nishiazabu</span>
                </li>
              </ul>
            </div>
            <div className="bg-card p-8 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-4">Ideal For</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                  <span className="text-muted-foreground">Busy schedule around {ward.name}, Tokyo</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                  <span className="text-muted-foreground">Hotel or residence coordination</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                  <span className="text-muted-foreground">English-friendly care planning before a visit</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                  <span className="text-muted-foreground">Wellness support after travel or work fatigue</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                  <span className="text-muted-foreground">Private consultation before choosing a service</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How to Get Started */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-serif text-3xl text-foreground mb-6">
            How To Get Started
          </h2>
          <p className="text-muted-foreground mb-8">
            Use the consultation form to share your {ward.name}, Tokyo location, preferred timing, 
            and the type of care you want to discuss. Pitonne will confirm the appropriate next step 
            and whether a clinic visit, in-home visit, hotel visit, or online consultation is suitable.
          </p>
          <Link 
            href="/contact" 
            className="inline-block bg-[#4AA69D] text-white px-8 py-4 rounded-full hover:bg-[#3d8b83] transition-colors"
          >
            Contact Pitonne
          </Link>
        </div>
      </section>

      {/* Back Link */}
      <section className="py-8 border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Link href="/areas-served" className="text-[#4AA69D] hover:underline">
            &larr; View all areas served
          </Link>
        </div>
      </section>
    </div>
  )
}
