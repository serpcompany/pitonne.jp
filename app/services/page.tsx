import Link from "next/link"
import type { Metadata } from "next"
import { services, getServicesByCategory } from "@/lib/data/services"
import { ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Our Services | Pitonne Stem Cell & IV Therapy Tokyo",
  description: "Explore physician-guided medications, premium IV Therapy, blood testing and regenerative wellness services. Designed for busy professionals, travelers, and health-conscious clients in Tokyo.",
}

export default function ServicesPage() {
  const ivServices = getServicesByCategory("iv-therapy")
  const stemCellServices = getServicesByCategory("stem-cell")
  const medicationServices = getServicesByCategory("medication")

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-background overflow-hidden py-16 lg:py-20">
        {/* Decorative Elements */}
        <div className="absolute left-0 bottom-0 w-32 h-32 opacity-50">
          <svg viewBox="0 0 120 120" className="w-full h-full text-[#8bb3b0]">
            <ellipse cx="30" cy="90" rx="50" ry="40" fill="currentColor" opacity="0.3" />
          </svg>
        </div>
        <div className="absolute right-0 top-10 w-24 h-32 opacity-30">
          <svg viewBox="0 0 100 130" className="w-full h-full text-[#8bb3b0]">
            <path d="M50 10 Q70 40 60 70 Q50 100 50 120" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M55 30 Q70 40 65 55" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <nav className="text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-foreground">Services</span>
          </nav>
          
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6">Our Services</h1>
          <p className="max-w-3xl text-muted-foreground text-lg">
            Explore physician-guided medications, premium IV Therapy, blood testing and regenerative wellness services. Designed for busy professionals, travelers, and health-conscious clients seeking discreet, personalized care in Tokyo.
          </p>
        </div>
      </section>

      {/* IV Therapy Section */}
      <section className="py-16 lg:py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground">IV Therapy</h2>
            <Link href="/services/iv-therapy" className="text-[#4AA69D] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ivServices.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group block bg-background rounded-lg border border-border overflow-hidden hover:border-[#4AA69D] hover:shadow-md transition-all"
              >
                {service.image && (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#4AA69D] transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {service.shortDescription}
                  </p>
                  <ul className="space-y-1">
                    {service.keyPoints.slice(0, 3).map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stem Cell Therapy Section */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground">Stem Cell Therapy</h2>
            <Link href="/services/stem-cell-therapy" className="text-[#4AA69D] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stemCellServices.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group block bg-card rounded-lg border border-border overflow-hidden hover:border-[#4AA69D] hover:shadow-md transition-all"
              >
                {service.image && (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#4AA69D] transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {service.shortDescription}
                  </p>
                  <ul className="space-y-1">
                    {service.keyPoints.slice(0, 3).map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}

            {/* Exosome IV Drip (also stem cell related) */}
            {services.filter(s => s.slug === 'exosome-iv-drip').map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group block bg-card rounded-lg border border-border overflow-hidden hover:border-[#4AA69D] hover:shadow-md transition-all"
              >
                {service.image && (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#4AA69D] transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {service.shortDescription}
                  </p>
                  <ul className="space-y-1">
                    {service.keyPoints.slice(0, 3).map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Medications Section */}
      <section className="py-16 lg:py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground">Medications</h2>
            <Link href="/services/medication" className="text-[#4AA69D] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicationServices.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group block bg-background rounded-lg border border-border overflow-hidden hover:border-[#4AA69D] hover:shadow-md transition-all"
              >
                {service.image && (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#4AA69D] transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {service.shortDescription}
                  </p>
                  <ul className="space-y-1">
                    {service.keyPoints.slice(0, 3).map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-6">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
            Contact us for a consultation and learn how our personalized wellness services can support your health goals.
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-[#4AA69D] text-white px-8 py-3 rounded-md text-sm font-medium hover:bg-[#3d8a83] transition-colors"
          >
            Book Consultation
          </Link>
        </div>
      </section>
    </>
  )
}
