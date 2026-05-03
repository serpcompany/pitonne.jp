import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Services | Pitonne Stem Cell & IV Therapy",
  description: "Explore physician-guided medications, premium IV Therapy, blood testing and regenerative wellness services. Designed for busy professionals, travelers, and health-conscious clients in Tokyo.",
}

const ivTherapyServices = [
  {
    title: "Exosome IV Drip",
    description: "Regenerative IV support using stem cell supernatant-derived factors for recovery and vitality.",
    href: "/services/iv-therapy",
  },
  {
    title: "Hangover IV Drip",
    description: "Rapid hydration and electrolyte support to help ease common post-drinking symptoms.",
    href: "/services/iv-therapy",
  },
  {
    title: "Energy & Fatigue Recovery IV",
    description: "Hydration and nutrients designed to support energy, focus, and everyday recovery.",
    href: "/services/iv-therapy",
  },
  {
    title: "Skin Brightening IV Drip",
    description: "Antioxidant-rich IV support for skin wellness, recovery, and brighter-looking skin.",
    href: "/services/iv-therapy",
  },
  {
    title: "Immune Boost IV Therapy",
    description: "Vitamin and hydration support designed to help maintain immune resilience and recovery.",
    href: "/services/iv-therapy",
  },
  {
    title: "IV Vitamin Therapy",
    description: "Essential vitamins and hydration delivered directly for efficient absorption and wellness support.",
    href: "/services/iv-therapy",
  },
]

const stemCellServices = [
  {
    title: "Stem Cell Nasal Spray",
    description: "A convenient regenerative option designed to support cognitive wellness and daily recovery.",
    href: "/services/stem-cell-therapy",
  },
]

const medicationServices = [
  {
    title: "ED Medication",
    description: "Discreet prescription treatment options tailored to individual needs and physician review.",
    href: "/services/medications",
  },
]

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[#faf9f7] overflow-hidden py-16 lg:py-20">
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
            <span>Services</span>
          </nav>
          
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Our Services</h1>
          <p className="max-w-3xl text-muted-foreground">
            Explore physician-guided medications, premium IV Therapy, blood testing and regenerative wellness services. Designed for busy professionals, travelers, and health-conscious clients seeking discreet, personalized care in Tokyo.
          </p>
        </div>
      </section>

      {/* IV Therapy Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif mb-8">IV Therapy</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ivTherapyServices.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group block"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-[#f5ebe0] to-[#e8d4c8] rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-8 h-8 rounded-full bg-[#d4c4a8]" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#4AA69D] transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stem Cell Therapy Section */}
      <section className="py-16 lg:py-20 bg-[#faf9f7]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif mb-8">Stem Cell Therapy</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stemCellServices.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group block"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-[#e8d4c8] to-[#d4c4a8] rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-8 h-8 rounded-full bg-[#8bb3b0]" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#4AA69D] transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Medications Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif mb-8">Medications</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicationServices.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group block"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-[#f5ebe0] to-[#e8d4c8] rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-8 h-8 rounded-full bg-[#d4c4a8]" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#4AA69D] transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">
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
