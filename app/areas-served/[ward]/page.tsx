import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PageHero } from "@/components/shared/page-hero"
import { CareAvailableSection } from "@/components/areas/care-available-section"
import { HowToGetStartedSection } from "@/components/areas/how-to-get-started-section"
import { LatestPostsSection } from "@/components/shared/latest-posts-section"
import { getWard, wards } from "@/lib/data/areas"
import { canonicalUrl } from "@/lib/seo"

export async function generateStaticParams() {
  return wards.map((ward) => ({ ward: ward.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ ward: string }> }): Promise<Metadata> {
  const { ward: wardSlug } = await params
  const ward = getWard(wardSlug)
  if (!ward) return { title: "Area Not Found | Pitonne" }
  
  const seoTitle = `IV Therapy, Stem Cells & Blood Tests in ${ward.name} | Tokyo`
  const seoDescription = `IV therapy, stem cell treatments, medications, and blood testing in ${ward.name} Ward (${ward.nameJa}), Tokyo. Mobile and in-clinic wellness care from Pitonne.`

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: canonicalUrl(`/areas-served/${ward.slug}/`),
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonicalUrl(`/areas-served/${ward.slug}/`),
    },
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
        title={`IV Therapy, Stem Cells, Medications & Blood Testing in ${ward.name}, Tokyo`}
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
                className="bg-card p-6 rounded-lg border border-border hover:shadow-md hover:border-[#7A8F87] transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-[#f5ebe0] rounded-full flex items-center justify-center group-hover:bg-[#7A8F87] transition-colors">
                    <svg className="w-6 h-6 text-[#7A8F87] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{area.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{area.nameJa}</p>
                    <p className="text-sm text-[#7A8F87]">View services &rarr;</p>
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

      <CareAvailableSection />
      <HowToGetStartedSection locationLabel={`${ward.name}, Tokyo`} />
      <LatestPostsSection />

      {/* Back Link */}
      <section className="py-8 border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Link href="/areas-served" className="text-[#7A8F87] hover:underline">
            &larr; View all areas served
          </Link>
        </div>
      </section>
    </div>
  )
}
