import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Medication Services | Pitonne",
  description: "Discreet medication services in Tokyo. Confidential consultations and prescription delivery to your location.",
}

export default function MedicationPage() {
  return (
    <div className="bg-[#faf9f7]">
      {/* Hero Section */}
      <section className="relative py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm uppercase tracking-widest text-[#4AA69D] mb-4">Services</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-6">
            Medication Services
          </h1>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            Discreet, professional medication consultations and delivery in Tokyo.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-serif text-3xl text-[#1a1a1a] mb-6">Professional Medication Services</h2>
            <p className="text-[#666] mb-6">
              Pitonne offers discreet medication consultation and delivery services for visitors and 
              residents of Tokyo. Our licensed physicians provide confidential consultations and can 
              prescribe appropriate medications based on your health needs.
            </p>

            <div className="grid md:grid-cols-1 gap-8 mt-12">
              <Link 
                href="/services/ed-medication"
                className="block bg-white p-8 rounded-lg border border-[#e5e5e5] hover:shadow-md transition-shadow"
              >
                <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4">ED Medication</h3>
                <p className="text-[#666] mb-4">
                  Confidential consultation and discreet delivery of erectile dysfunction medications. 
                  Private appointments with licensed physicians.
                </p>
                <span className="text-[#4AA69D] font-medium">Learn more &rarr;</span>
              </Link>
            </div>
            
            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-12">Our Commitment</h3>
            <ul className="space-y-3 text-[#666]">
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Complete confidentiality</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Licensed medical professionals</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Medications from licensed Japanese pharmacies</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Discreet packaging and delivery</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Available at your hotel or residence</span>
              </li>
            </ul>
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
    </div>
  )
}
