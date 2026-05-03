import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "ED Medication | Pitonne",
  description: "Discreet ED medication services in Tokyo. Confidential consultations and prescription delivery to your location.",
}

export default function EDMedicationPage() {
  return (
    <div className="bg-[#faf9f7]">
      {/* Hero Section */}
      <section className="relative py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm uppercase tracking-widest text-[#4AA69D] mb-4">Medications</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-6">
            ED Medication
          </h1>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            Discreet, professional consultation and medication services for erectile dysfunction.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-serif text-3xl text-[#1a1a1a] mb-6">Confidential Care</h2>
            <p className="text-[#666] mb-6">
              We understand that discussing erectile dysfunction can be sensitive. Our service provides 
              a discreet, professional approach to ED treatment with confidential consultations and 
              medication delivery directly to your hotel or residence in Tokyo.
            </p>
            
            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Our Approach</h3>
            <ul className="space-y-3 text-[#666]">
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Private, confidential consultation with licensed physician</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Comprehensive health assessment</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Personalized treatment recommendations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Discreet medication delivery</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#4AA69D] mt-1">&#10003;</span>
                <span>Follow-up support available</span>
              </li>
            </ul>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Available Medications</h3>
            <p className="text-[#666] mb-6">
              Following consultation, our physicians may prescribe appropriate ED medications based on 
              your health profile and needs. All medications are sourced from licensed pharmacies in Japan.
            </p>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">How It Works</h3>
            <ol className="space-y-3 text-[#666] list-decimal list-inside">
              <li>Contact us to schedule a confidential consultation</li>
              <li>Complete a health questionnaire</li>
              <li>Consult with our licensed physician</li>
              <li>Receive your prescription and medication discreetly</li>
            </ol>

            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Privacy Guaranteed</h3>
            <p className="text-[#666] mb-6">
              Your privacy is our priority. All consultations are completely confidential, and 
              medications are delivered in discreet packaging with no identifying labels.
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
          <h2 className="font-serif text-3xl text-[#1a1a1a] mb-8 text-center">Other Services</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Medications", href: "/services/medication" },
              { name: "IV Therapy", href: "/services/iv-therapy" },
              { name: "Wellness Services", href: "/services" },
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
