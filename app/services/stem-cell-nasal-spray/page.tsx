import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Stem Cell Nasal Spray | Pitonne",
  description: "Stem Cell Nasal Spray therapy in Tokyo. Non-invasive stem cell delivery for cognitive enhancement and neurological support.",
}

export default function StemCellNasalSprayPage() {
  return (
    <div className="bg-[#faf9f7]">
      {/* Hero Section */}
      <section className="relative py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm uppercase tracking-widest text-[#4AA69D] mb-4">Stem Cell Therapy</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-6">
            Stem Cell Nasal Spray
          </h1>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            Non-invasive stem cell delivery for cognitive enhancement and neurological support.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-serif text-3xl text-[#1a1a1a] mb-6">Advanced Stem Cell Delivery</h2>
            <p className="text-[#666] mb-6">
              Our Stem Cell Nasal Spray offers a non-invasive method of delivering stem cell-derived 
              growth factors and exosomes directly to the brain via the nasal passage. This innovative 
              approach bypasses the blood-brain barrier for enhanced neurological benefits.
            </p>
            
            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">How It Works</h3>
            <p className="text-[#666] mb-6">
              The nasal cavity provides a direct pathway to the brain through the olfactory and trigeminal 
              nerve pathways. Our stem cell nasal spray contains concentrated growth factors and signaling 
              molecules that can support neurological health and cognitive function.
            </p>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Potential Benefits</h3>
            <ul className="space-y-3 text-[#666]">
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Support for cognitive function and mental clarity</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Neuroprotective properties</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>May support mood regulation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Non-invasive administration</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Quick and convenient treatment</span>
              </li>
            </ul>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Treatment Process</h3>
            <p className="text-[#666] mb-6">
              The treatment is quick and painless, administered by our trained medical professionals. 
              A personalized treatment protocol will be developed based on your health goals and needs.
            </p>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Ideal For</h3>
            <p className="text-[#666] mb-6">
              Individuals seeking cognitive support, those interested in neurological wellness, 
              or anyone looking for non-invasive regenerative therapy options.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link 
              href="/contact" 
              className="inline-block bg-[#4AA69D] text-white px-8 py-4 rounded-full hover:bg-[#3d8b83] transition-colors"
            >
              Schedule a Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-16 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-3xl text-[#1a1a1a] mb-8 text-center">Related Services</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Exosome IV Drip", href: "/services/exosome-iv-drip" },
              { name: "Stem Cell Therapy", href: "/services/stem-cell-therapy" },
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
