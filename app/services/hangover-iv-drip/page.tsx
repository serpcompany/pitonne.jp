import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Hangover IV Drip | Pitonne",
  description: "Fast hangover relief with IV therapy in Tokyo. Rehydrate, replenish vitamins, and feel better quickly with our mobile IV service.",
}

export default function HangoverIVDripPage() {
  return (
    <div className="bg-[#faf9f7]">
      {/* Hero Section */}
      <section className="relative py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm uppercase tracking-widest text-[#4AA69D] mb-4">IV Therapy</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-6">
            Hangover IV Drip
          </h1>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            Fast, effective relief when you need it most. Get back to feeling your best.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-serif text-3xl text-[#1a1a1a] mb-6">Rapid Hangover Recovery</h2>
            <p className="text-[#666] mb-6">
              Our Hangover IV Drip is specially formulated to combat the effects of alcohol consumption. 
              Delivered directly to your hotel room or home in Tokyo, this treatment provides fast relief 
              from dehydration, headaches, nausea, and fatigue.
            </p>
            
            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">What&apos;s Included</h3>
            <ul className="space-y-3 text-[#666]">
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>IV fluids for rapid rehydration</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>B-complex vitamins to restore depleted nutrients</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Anti-nausea medication (if needed)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Anti-inflammatory medication for headache relief</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Electrolytes to restore balance</span>
              </li>
            </ul>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">How It Works</h3>
            <p className="text-[#666] mb-6">
              Contact us and we&apos;ll dispatch a licensed medical professional to your location in Tokyo. 
              The treatment typically takes 30-45 minutes, and most clients feel significantly better 
              within an hour of completion.
            </p>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Perfect For</h3>
            <p className="text-[#666] mb-6">
              Business travelers, tourists, or anyone who needs to recover quickly after a night out. 
              Our discreet service comes directly to you, so you can recover in comfort.
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
              { name: "Energy & Fatigue Recovery", href: "/services/energy-fatigue-recovery-iv" },
              { name: "Immune Boost IV", href: "/services/immune-boost-iv-therapy" },
              { name: "IV Vitamin Therapy", href: "/services/iv-vitamin-therapy" },
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
