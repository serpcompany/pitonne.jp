import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Skin Brightening IV Drip | Pitonne",
  description: "Achieve radiant, glowing skin with our Skin Brightening IV Drip in Tokyo. Glutathione and vitamin C for luminous complexion.",
}

export default function SkinBrighteningIVPage() {
  return (
    <div className="bg-[#faf9f7]">
      {/* Hero Section */}
      <section className="relative py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm uppercase tracking-widest text-[#4AA69D] mb-4">IV Therapy</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-6">
            Skin Brightening IV Drip
          </h1>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            Achieve a radiant, luminous complexion from the inside out.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-serif text-3xl text-[#1a1a1a] mb-6">Glow From Within</h2>
            <p className="text-[#666] mb-6">
              Our Skin Brightening IV Drip delivers powerful antioxidants and skin-loving nutrients directly 
              into your bloodstream, promoting a clearer, more radiant complexion. This treatment is popular 
              among those seeking to improve skin tone, reduce signs of aging, and achieve a healthy glow.
            </p>
            
            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Key Ingredients</h3>
            <ul className="space-y-3 text-[#666]">
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Glutathione - the master antioxidant for skin brightening</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>High-dose Vitamin C for collagen production</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Biotin for healthy skin, hair, and nails</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Alpha Lipoic Acid for anti-aging benefits</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>B-vitamins for cellular renewal</span>
              </li>
            </ul>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Benefits</h3>
            <p className="text-[#666] mb-6">
              Experience brighter, more even skin tone, reduced appearance of dark spots and hyperpigmentation, 
              improved skin elasticity, protection against environmental damage, and an overall healthy, 
              youthful glow.
            </p>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Treatment Protocol</h3>
            <p className="text-[#666] mb-6">
              For best results, we recommend a series of treatments. Our medical professionals will create 
              a personalized treatment plan based on your skin goals and current condition.
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
              { name: "Exosome IV Drip", href: "/services/exosome-iv-drip" },
              { name: "IV Vitamin Therapy", href: "/services/iv-vitamin-therapy" },
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
