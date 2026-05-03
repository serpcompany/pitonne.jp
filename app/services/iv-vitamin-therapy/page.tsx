import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "IV Vitamin Therapy | Pitonne",
  description: "IV Vitamin Therapy in Tokyo. Replenish essential vitamins and minerals with direct bloodstream delivery for maximum absorption.",
}

export default function IVVitaminTherapyPage() {
  return (
    <div className="bg-[#faf9f7]">
      {/* Hero Section */}
      <section className="relative py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm uppercase tracking-widest text-[#4AA69D] mb-4">IV Therapy</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-6">
            IV Vitamin Therapy
          </h1>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            Replenish your body with essential vitamins and minerals for optimal health and vitality.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-serif text-3xl text-[#1a1a1a] mb-6">Essential Vitamin Infusion</h2>
            <p className="text-[#666] mb-6">
              IV Vitamin Therapy bypasses the digestive system to deliver essential nutrients directly into your 
              bloodstream, ensuring 100% absorption. This treatment is customized to your specific needs and 
              health goals.
            </p>
            
            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">What&apos;s Included</h3>
            <ul className="space-y-3 text-[#666]">
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Vitamin B12 for energy and neurological health</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>B-Complex vitamins for metabolism support</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Vitamin C for immune support and skin health</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Magnesium for muscle and nerve function</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Essential minerals and electrolytes</span>
              </li>
            </ul>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Benefits</h3>
            <p className="text-[#666] mb-6">
              Regular IV vitamin therapy can help improve energy levels, support immune function, 
              enhance mental clarity, improve skin health, and address nutrient deficiencies that 
              may result from busy lifestyles or dietary restrictions.
            </p>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Ideal For</h3>
            <p className="text-[#666] mb-6">
              Anyone looking to optimize their health, busy professionals who may have nutritional gaps, 
              athletes seeking enhanced recovery, or individuals with absorption issues.
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
              { name: "Immune Boost IV", href: "/services/immune-boost-iv-therapy" },
              { name: "Energy & Fatigue Recovery", href: "/services/energy-fatigue-recovery-iv" },
              { name: "Skin Brightening IV", href: "/services/skin-brightening-iv-drip" },
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
