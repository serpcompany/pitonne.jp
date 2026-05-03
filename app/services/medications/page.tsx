import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Medications | Pitonne Stem Cell & IV Therapy",
  description: "Discreet prescription medication services in Tokyo. ED medication and other prescription treatments with physician consultation.",
}

export default function MedicationsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[#faf9f7] overflow-hidden py-16 lg:py-20">
        <div className="absolute right-0 top-10 w-24 h-32 opacity-30">
          <svg viewBox="0 0 100 130" className="w-full h-full text-[#d4c4a8]">
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
            <span>Medications</span>
          </nav>
          
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Medications</h1>
          <p className="max-w-3xl text-muted-foreground">
            Pitonne offers discreet access to prescription medications with physician consultation. Our services are designed for clients who value privacy, convenience, and professional medical guidance.
          </p>
        </div>
      </section>

      {/* ED Medication Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image placeholder */}
            <div className="aspect-[4/3] bg-gradient-to-br from-[#f5ebe0] to-[#e8d4c8] rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/50 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#d4c4a8]" />
                </div>
                <p className="text-sm">Treatment Image</p>
              </div>
            </div>

            {/* Content */}
            <div>
              <h2 className="text-3xl font-serif mb-6">ED Medication</h2>
              <p className="text-muted-foreground mb-6">
                Discreet prescription treatment options tailored to individual needs and physician review. We understand the sensitivity of this topic and provide a comfortable, private consultation process.
              </p>
              <h3 className="font-semibold mb-4">Our Process:</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#4AA69D] text-white text-sm flex items-center justify-center">1</span>
                  <span>Private consultation with our physician</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#4AA69D] text-white text-sm flex items-center justify-center">2</span>
                  <span>Medical history review and assessment</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#4AA69D] text-white text-sm flex items-center justify-center">3</span>
                  <span>Personalized treatment recommendation</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#4AA69D] text-white text-sm flex items-center justify-center">4</span>
                  <span>Discreet prescription and delivery</span>
                </li>
              </ul>
              <Link 
                href="/contact"
                className="inline-block bg-[#4AA69D] text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#3d8a83] transition-colors"
              >
                Schedule Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-16 lg:py-20 bg-[#faf9f7]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif mb-6">Your Privacy Matters</h2>
            <p className="text-muted-foreground mb-8">
              We understand that seeking medication support can be a personal decision. Pitonne is committed to providing a discreet, judgment-free environment where your privacy is always protected.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-2">Private Consultations</h3>
                <p className="text-sm text-muted-foreground">
                  One-on-one meetings with our physician in a comfortable setting.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-2">Discreet Service</h3>
                <p className="text-sm text-muted-foreground">
                  All communications and deliveries are handled with complete discretion.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-2">Secure Records</h3>
                <p className="text-sm text-muted-foreground">
                  Your medical information is protected and kept strictly confidential.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">
            Start Your Private Consultation
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
            Contact us to schedule a confidential consultation with our physician. We&apos;re here to help you find the right solution.
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
