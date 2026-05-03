import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Exosome IV Drip | Pitonne",
  description: "Exosome IV Drip therapy in Tokyo. Harness the regenerative power of exosomes for cellular rejuvenation, anti-aging, and overall wellness.",
}

export default function ExosomeIVDripPage() {
  return (
    <div className="bg-[#faf9f7]">
      {/* Hero Section */}
      <section className="relative py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm uppercase tracking-widest text-[#4AA69D] mb-4">IV Therapy</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-6">
            Exosome IV Drip
          </h1>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            Harness the regenerative power of exosomes for cellular rejuvenation and anti-aging benefits.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-serif text-3xl text-[#1a1a1a] mb-6">What is Exosome IV Therapy?</h2>
            <p className="text-[#666] mb-6">
              Exosome IV Drip therapy delivers powerful cellular messengers directly into your bloodstream. 
              Exosomes are tiny vesicles released by cells that carry proteins, lipids, and genetic material, 
              playing a crucial role in cell-to-cell communication and tissue regeneration.
            </p>
            
            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Benefits</h3>
            <ul className="space-y-3 text-[#666]">
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Promotes cellular regeneration and repair</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Anti-aging effects on skin and overall vitality</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Supports immune system function</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>May improve cognitive function</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Reduces inflammation throughout the body</span>
              </li>
            </ul>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">What to Expect</h3>
            <p className="text-[#666] mb-6">
              The treatment takes approximately 30-60 minutes and is administered by our licensed medical professionals 
              at your preferred location in Tokyo. Most clients report feeling refreshed and rejuvenated following the treatment.
            </p>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Ideal For</h3>
            <p className="text-[#666] mb-6">
              This treatment is ideal for those seeking anti-aging benefits, improved skin health, 
              enhanced recovery from physical exertion, or overall cellular rejuvenation.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link 
              href="/contact" 
              className="inline-block bg-[#4AA69D] text-white px-8 py-4 rounded-full hover:bg-[#3d8b83] transition-colors"
            >
              Book Your Session
            </Link>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-16 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-3xl text-[#1a1a1a] mb-8 text-center">Other IV Therapies</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Hangover IV Drip", href: "/services/hangover-iv-drip" },
              { name: "Immune Boost IV", href: "/services/immune-boost-iv-therapy" },
              { name: "Energy & Fatigue Recovery", href: "/services/energy-fatigue-recovery-iv" },
            ].map((service) => (
              <Link 
                key={service.name}
                href={service.href}
                className="bg-white p-6 rounded-lg text-center hover:shadow-md transition-shadow"
              >
                <p className="font-medium text-[#1a1a1a]">{service.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
