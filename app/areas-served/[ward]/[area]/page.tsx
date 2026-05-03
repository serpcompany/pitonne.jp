import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getArea, getAllAreas } from "@/lib/data/areas"

export async function generateStaticParams() {
  const allAreas = getAllAreas()
  return allAreas.map(({ ward, area }) => ({
    ward: ward.slug,
    area: area.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ ward: string; area: string }> }): Promise<Metadata> {
  const { ward: wardSlug, area: areaSlug } = await params
  const data = getArea(wardSlug, areaSlug)
  if (!data) return { title: "Area Not Found | Pitonne" }
  
  const { ward, area } = data
  return {
    title: `Stem Cell & IV Therapy in ${area.name}, ${ward.name} | Pitonne`,
    description: `Premium IV therapy, stem cell treatments, and wellness services in ${area.name} (${area.nameJa}), ${ward.name} Ward, Tokyo. ${area.description}`,
  }
}

function generateFaqs(areaName: string, wardName: string) {
  return [
    {
      question: `Can I book a consultation if I am staying in ${areaName}, ${wardName}, Tokyo?`,
      answer: `Yes. Patients staying in ${areaName}, ${wardName}, Tokyo can contact Pitonne to ask about consultation options, visit-based care, and the most appropriate next step.`
    },
    {
      question: `What services are available for ${areaName} patients?`,
      answer: "Pitonne can discuss IV therapy, stem cell related care planning, online medication consultation, and concierge wellness support. Availability depends on your goals, timing, and clinical suitability."
    },
    {
      question: `Do you offer hotel or home visits near ${areaName}, ${wardName}, Tokyo?`,
      answer: "In-home and hotel visit coordination may be available in central Tokyo. Share your location, preferred time, and care request so the team can confirm what is possible."
    },
    {
      question: "What should I include when I contact Pitonne?",
      answer: "Please include your current area, whether you prefer a clinic visit or visit-based support, the service you are interested in, and any timing constraints."
    },
    {
      question: `How convenient is ${areaName} for Pitonne patients?`,
      answer: `${areaName} in ${wardName} is part of Pitonne's central Tokyo service area, allowing patients to coordinate consultation timing around home, hotel, office, or travel plans.`
    }
  ]
}

export default async function AreaDetailPage({ params }: { params: Promise<{ ward: string; area: string }> }) {
  const { ward: wardSlug, area: areaSlug } = await params
  const data = getArea(wardSlug, areaSlug)
  
  if (!data) {
    notFound()
  }

  const { ward, area } = data
  const faqs = generateFaqs(area.name, ward.name)

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <nav className="mb-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-[#4AA69D]">Home</Link>
            <span className="mx-2">&gt;</span>
            <Link href="/areas-served" className="hover:text-[#4AA69D]">Areas Served</Link>
            <span className="mx-2">&gt;</span>
            <Link href={`/areas-served/${ward.slug}`} className="hover:text-[#4AA69D]">{ward.name}</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-foreground">{area.name}</span>
          </nav>
          <p className="text-sm uppercase tracking-widest text-[#4AA69D] mb-4">
            {area.nameJa} · {ward.name}, Tokyo
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-6">
            Stem Cell & IV Therapy in {area.name}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {area.description}
          </p>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card p-8 rounded-lg border border-border">
              <h2 className="font-serif text-2xl text-foreground mb-6">Location Highlights</h2>
              <ul className="space-y-3">
                {area.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                    <span className="text-muted-foreground">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card p-8 rounded-lg border border-border">
              <h2 className="font-serif text-2xl text-foreground mb-6">Nearby Landmarks</h2>
              <ul className="space-y-3">
                {area.landmarks.map((landmark, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4AA69D]" />
                    <span className="text-muted-foreground">{landmark}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-serif text-3xl text-foreground mb-4 text-center">
            Care Available in {area.name}
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            We bring premium wellness services directly to your hotel, residence, or office in {area.name}. 
            Our licensed medical professionals provide discreet, professional care at your convenience.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-4">IV Therapy</h3>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Hangover IV Drip</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Energy & Fatigue Recovery</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Immune Boost IV</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Skin Brightening IV</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>IV Vitamin Therapy</span>
                </li>
              </ul>
              <Link href="/services/iv-therapy" className="text-sm text-[#4AA69D] hover:underline">
                Learn more &rarr;
              </Link>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-4">Stem Cell Therapy</h3>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Exosome IV Drip</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Stem Cell Nasal Spray</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Regenerative Treatments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Wellness Consultations</span>
                </li>
              </ul>
              <Link href="/services/stem-cell-therapy" className="text-sm text-[#4AA69D] hover:underline">
                Learn more &rarr;
              </Link>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-4">Medications</h3>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>ED Medication</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Discreet Consultations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Prescription Services</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Follow-Up Support</span>
                </li>
              </ul>
              <Link href="/services/medication" className="text-sm text-[#4AA69D] hover:underline">
                Learn more &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-3xl text-foreground mb-12 text-center">
            How To Get Started
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-[#4AA69D] rounded-full flex items-center justify-center text-white text-xl font-bold">
                1
              </div>
              <h3 className="font-medium text-foreground mb-2">Consultation</h3>
              <p className="text-sm text-muted-foreground">
                Discuss symptoms, goals, and health history
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-[#4AA69D] rounded-full flex items-center justify-center text-white text-xl font-bold">
                2
              </div>
              <h3 className="font-medium text-foreground mb-2">Personalized Plan</h3>
              <p className="text-sm text-muted-foreground">
                Provider recommends the right treatment approach
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-[#4AA69D] rounded-full flex items-center justify-center text-white text-xl font-bold">
                3
              </div>
              <h3 className="font-medium text-foreground mb-2">Treatment</h3>
              <p className="text-sm text-muted-foreground">
                In-clinic, hotel visit, or home visit
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-[#4AA69D] rounded-full flex items-center justify-center text-white text-xl font-bold">
                4
              </div>
              <h3 className="font-medium text-foreground mb-2">Follow-Up</h3>
              <p className="text-sm text-muted-foreground">
                Ongoing guidance and next-step planning
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-3xl text-foreground mb-10 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-3">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-serif text-3xl text-foreground mb-6">
            Ready to Book in {area.name}?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Use the consultation form to share your location in {area.name}, preferred timing, 
            and the type of care you want to discuss.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="inline-block bg-[#4AA69D] text-white px-8 py-4 rounded-full hover:bg-[#3d8b83] transition-colors"
            >
              Contact Pitonne
            </Link>
            <a 
              href="tel:070-2194-0199" 
              className="inline-block bg-transparent border-2 border-foreground text-foreground px-8 py-4 rounded-full hover:bg-foreground hover:text-background transition-colors"
            >
              Call: 070-2194-0199
            </a>
          </div>
        </div>
      </section>

      {/* Other Areas */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <h3 className="font-semibold text-foreground mb-6 text-center">
            Other Areas in {ward.name}
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {ward.areas
              .filter(a => a.slug !== area.slug)
              .map((otherArea) => (
                <Link
                  key={otherArea.slug}
                  href={`/areas-served/${ward.slug}/${otherArea.slug}`}
                  className="px-4 py-2 rounded-full border border-border bg-card text-sm text-muted-foreground hover:border-[#4AA69D] hover:text-[#4AA69D] transition-colors"
                >
                  {otherArea.name}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}
