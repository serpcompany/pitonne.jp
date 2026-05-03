import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "IV Therapy | Pitonne Stem Cell & IV Therapy",
  description: "Premium IV therapy services in Tokyo including Exosome IV, Hangover IV, Energy Recovery, Skin Brightening, Immune Boost, and Vitamin IV therapy.",
}

const treatments = [
  {
    title: "Exosome IV Drip",
    description: "Regenerative IV support using stem cell supernatant-derived factors for recovery and vitality. This treatment delivers concentrated growth factors and signaling molecules that may support cellular renewal and overall wellness.",
    benefits: ["Cellular regeneration support", "Recovery enhancement", "Vitality boost"],
  },
  {
    title: "Hangover IV Drip",
    description: "Rapid hydration and electrolyte support to help ease common post-drinking symptoms. Our hangover IV delivers fluids, vitamins, and anti-nausea support directly to help you recover faster.",
    benefits: ["Rapid rehydration", "Electrolyte restoration", "Nausea relief support"],
  },
  {
    title: "Energy & Fatigue Recovery IV",
    description: "Hydration and nutrients designed to support energy, focus, and everyday recovery. Ideal for busy professionals and those experiencing fatigue from travel or demanding schedules.",
    benefits: ["Energy restoration", "Mental clarity support", "Physical recovery"],
  },
  {
    title: "Skin Brightening IV Drip",
    description: "Antioxidant-rich IV support for skin wellness, recovery, and brighter-looking skin. This treatment combines glutathione and vitamin C to support skin health from within.",
    benefits: ["Antioxidant delivery", "Skin radiance support", "Complexion enhancement"],
  },
  {
    title: "Immune Boost IV Therapy",
    description: "Vitamin and hydration support designed to help maintain immune resilience and recovery. A blend of vitamin C, zinc, and other immune-supporting nutrients delivered directly.",
    benefits: ["Immune system support", "Vitamin C infusion", "Wellness maintenance"],
  },
  {
    title: "IV Vitamin Therapy",
    description: "Essential vitamins and hydration delivered directly for efficient absorption and wellness support. Customizable vitamin blends to address your specific wellness goals.",
    benefits: ["Direct vitamin delivery", "Optimal absorption", "Personalized blends"],
  },
]

export default function IVTherapyPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[#faf9f7] overflow-hidden py-16 lg:py-20">
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
            <Link href="/services" className="hover:text-foreground">Services</Link>
            <span className="mx-2">&gt;</span>
            <span>IV Therapy</span>
          </nav>
          
          <h1 className="text-4xl md:text-5xl font-serif mb-6">IV Therapy</h1>
          <p className="max-w-3xl text-muted-foreground">
            Our IV therapy services deliver hydration, vitamins, and nutrients directly into your bloodstream for maximum absorption and faster results. Each treatment is administered by registered nurses in the comfort of your home or hotel.
          </p>
        </div>
      </section>

      {/* Treatments Grid */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {treatments.map((treatment) => (
              <div 
                key={treatment.title}
                className="bg-[#faf9f7] rounded-lg p-8 border border-border"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f5ebe0] to-[#d4c4a8] mb-6 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#4AA69D]" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{treatment.title}</h3>
                <p className="text-muted-foreground mb-6">{treatment.description}</p>
                <ul className="space-y-2">
                  {treatment.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4AA69D]" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">
            Book Your IV Therapy Session
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
            Our registered nurses provide professional IV therapy in the comfort of your home or hotel. Contact us to schedule your session.
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
