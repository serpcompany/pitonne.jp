import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Energy & Fatigue Recovery IV | Pitonne",
  description: "Combat fatigue and boost energy with IV therapy in Tokyo. Restore vitality with our specialized energy recovery treatment.",
}

export default function EnergyFatigueRecoveryPage() {
  return (
    <div className="bg-[#faf9f7]">
      {/* Hero Section */}
      <section className="relative py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm uppercase tracking-widest text-[#4AA69D] mb-4">IV Therapy</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-6">
            Energy & Fatigue Recovery IV
          </h1>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            Restore your energy and combat chronic fatigue with our specialized IV treatment.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-serif text-3xl text-[#1a1a1a] mb-6">Reclaim Your Energy</h2>
            <p className="text-[#666] mb-6">
              Our Energy & Fatigue Recovery IV is designed for busy professionals, frequent travelers, 
              and anyone experiencing chronic tiredness. This treatment delivers a powerful blend of 
              energy-boosting nutrients directly into your bloodstream for fast, effective results.
            </p>
            
            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Key Ingredients</h3>
            <ul className="space-y-3 text-[#666]">
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>High-dose B12 for sustained energy</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>B-Complex vitamins for cellular energy production</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Magnesium for muscle function and relaxation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Amino acids for physical recovery</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Hydrating fluids and electrolytes</span>
              </li>
            </ul>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Benefits</h3>
            <p className="text-[#666] mb-6">
              Experience improved energy levels, better mental clarity, reduced fatigue, enhanced physical 
              performance, and improved sleep quality. Many clients report feeling energized within hours 
              of treatment.
            </p>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Ideal For</h3>
            <p className="text-[#666] mb-6">
              Business travelers dealing with jet lag, professionals with demanding schedules, 
              anyone recovering from illness or physical exertion, or those experiencing chronic fatigue.
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
              { name: "IV Vitamin Therapy", href: "/services/iv-vitamin-therapy" },
              { name: "Hangover IV Drip", href: "/services/hangover-iv-drip" },
              { name: "Immune Boost IV", href: "/services/immune-boost-iv-therapy" },
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
