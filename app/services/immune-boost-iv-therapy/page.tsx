import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Immune Boost IV Therapy | Pitonne",
  description: "Strengthen your immune system with IV therapy in Tokyo. High-dose vitamin C and essential nutrients delivered directly to your bloodstream.",
}

export default function ImmuneBoostIVPage() {
  return (
    <div className="bg-[#faf9f7]">
      {/* Hero Section */}
      <section className="relative py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm uppercase tracking-widest text-[#4AA69D] mb-4">IV Therapy</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-6">
            Immune Boost IV Therapy
          </h1>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            Fortify your body&apos;s natural defenses with our powerful immune-supporting IV treatment.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-serif text-3xl text-[#1a1a1a] mb-6">Strengthen Your Immune System</h2>
            <p className="text-[#666] mb-6">
              Our Immune Boost IV Therapy delivers a powerful combination of vitamins, minerals, and antioxidants 
              directly into your bloodstream for maximum absorption. This treatment is designed to support and 
              enhance your body&apos;s natural immune response.
            </p>
            
            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Key Ingredients</h3>
            <ul className="space-y-3 text-[#666]">
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>High-dose Vitamin C for immune support</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Zinc to support immune cell function</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>B-complex vitamins for energy and cellular health</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Glutathione for powerful antioxidant protection</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Selenium to support immune function</span>
              </li>
            </ul>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Benefits</h3>
            <p className="text-[#666] mb-6">
              This treatment helps strengthen your immune system, reduce the duration and severity of illness, 
              protect against oxidative stress, and improve overall energy levels. It&apos;s particularly beneficial 
              during cold and flu season or when traveling.
            </p>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Ideal For</h3>
            <p className="text-[#666] mb-6">
              Frequent travelers, busy professionals, anyone recovering from illness, or those looking to 
              proactively support their immune health.
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
              { name: "Energy & Fatigue Recovery", href: "/services/energy-fatigue-recovery-iv" },
              { name: "Exosome IV Drip", href: "/services/exosome-iv-drip" },
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
