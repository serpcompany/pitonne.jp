import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Stem Cell Therapy | Pitonne Stem Cell & IV Therapy",
  description: "Regenerative stem cell therapy services in Tokyo. Explore our Stem Cell Nasal Spray for cognitive wellness and daily recovery support.",
}

export default function StemCellTherapyPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[#faf9f7] overflow-hidden py-16 lg:py-20">
        <div className="absolute right-0 top-10 w-24 h-32 opacity-30">
          <svg viewBox="0 0 100 130" className="w-full h-full text-[#8bb3b0]">
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
            <span>Stem Cell Therapy</span>
          </nav>
          
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Stem Cell Therapy</h1>
          <p className="max-w-3xl text-muted-foreground">
            Our stem cell therapy services offer regenerative wellness support using advanced stem cell-derived products. These treatments are designed to support cellular renewal, cognitive function, and overall vitality.
          </p>
        </div>
      </section>

      {/* Main Treatment */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image placeholder */}
            <div className="aspect-[4/3] bg-gradient-to-br from-[#e8d4c8] to-[#d4c4a8] rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/50 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#8bb3b0]" />
                </div>
                <p className="text-sm">Treatment Image</p>
              </div>
            </div>

            {/* Content */}
            <div>
              <h2 className="text-3xl font-serif mb-6">Stem Cell Nasal Spray</h2>
              <p className="text-muted-foreground mb-6">
                A convenient regenerative option designed to support cognitive wellness and daily recovery. Our stem cell nasal spray delivers stem cell-derived factors directly through the nasal passage for efficient absorption.
              </p>
              <h3 className="font-semibold mb-4">Potential Benefits:</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#4AA69D]" />
                  <span>Cognitive function support</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#4AA69D]" />
                  <span>Daily recovery enhancement</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#4AA69D]" />
                  <span>Convenient at-home use</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#4AA69D]" />
                  <span>Non-invasive delivery method</span>
                </li>
              </ul>
              <Link 
                href="/contact"
                className="inline-block bg-[#4AA69D] text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#3d8a83] transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-16 lg:py-20 bg-[#faf9f7]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif mb-6 text-center">About Stem Cell Therapy</h2>
            <div className="space-y-6 text-muted-foreground">
              <p>
                Stem cell therapy represents an emerging field in regenerative medicine. At Pitonne, we offer stem cell-derived products that have been carefully selected for quality and safety.
              </p>
              <p>
                Our treatments use stem cell conditioned media and exosome-based products, which contain growth factors and signaling molecules derived from stem cells. These products are designed to support the body&apos;s natural regenerative processes.
              </p>
              <p>
                All treatments are provided under physician guidance, and we take time to discuss realistic expectations and potential benefits with each client during consultation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">
            Schedule a Consultation
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
            Learn more about how stem cell therapy may support your wellness goals. Our team is here to answer your questions.
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
