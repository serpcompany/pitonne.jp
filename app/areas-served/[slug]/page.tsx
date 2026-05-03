import Link from "next/link"
import type { Metadata } from "next"
import { MapPin, Check } from "lucide-react"
import { notFound } from "next/navigation"

const areas: Record<string, { name: string; ward: string; description: string }> = {
  "roppongi": {
    name: "Roppongi",
    ward: "Minato",
    description: "A vibrant district known for its nightlife, entertainment, and international business community. Pitonne provides convenient wellness services to Roppongi residents, hotel guests, and business travelers.",
  },
  "azabu-juban": {
    name: "Azabu Juban",
    ward: "Minato",
    description: "A charming residential neighborhood with a mix of traditional shops and modern amenities. Our team regularly serves clients in Azabu Juban with in-home IV therapy and wellness consultations.",
  },
  "hiroo": {
    name: "Hiroo",
    ward: "Minato",
    description: "An upscale residential area popular with expats and families. Pitonne offers discreet, professional wellness services to Hiroo residents in the comfort of their homes.",
  },
  "shibuya": {
    name: "Shibuya",
    ward: "Shibuya",
    description: "One of Tokyo's busiest commercial and entertainment districts. We provide wellness services to Shibuya hotels and residences for busy professionals and visitors.",
  },
  "ginza": {
    name: "Ginza",
    ward: "Chuo",
    description: "Tokyo's premier shopping and luxury district. Pitonne serves Ginza hotels and residences with premium IV therapy and wellness services.",
  },
  "ebisu": {
    name: "Ebisu",
    ward: "Shibuya",
    description: "A trendy neighborhood known for its restaurants and relaxed atmosphere. Our mobile wellness services are available throughout the Ebisu area.",
  },
}

// Generate metadata dynamically
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const area = areas[slug]
  
  if (!area) {
    return {
      title: "Area Not Found | Pitonne",
    }
  }

  return {
    title: `${area.name} IV Therapy & Wellness | Pitonne`,
    description: `Pitonne provides premium IV therapy, stem cell treatments, and wellness services in ${area.name}, ${area.ward} Ward, Tokyo.`,
  }
}

const services = [
  "IV Therapy (Hangover, Energy, Immune Boost, Vitamin)",
  "Exosome IV Drip",
  "Stem Cell Nasal Spray",
  "Wellness Consultations",
  "Medication Consultations",
]

export default async function AreaPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const area = areas[slug]

  if (!area) {
    notFound()
  }

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
            <Link href="/areas-served" className="hover:text-foreground">Areas Served</Link>
            <span className="mx-2">&gt;</span>
            <span>{area.name}</span>
          </nav>
          
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-6 w-6 text-[#4AA69D]" />
            <span className="text-sm text-muted-foreground">{area.ward} Ward, Tokyo</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif mb-6">
            IV Therapy & Wellness Services in {area.name}
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            {area.description}
          </p>
        </div>
      </section>

      {/* Services Available */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-serif mb-6">Services Available in {area.name}</h2>
              <p className="text-muted-foreground mb-8">
                Our registered nurses travel to your location in {area.name} to provide professional wellness services. All treatments are performed in a comfortable, private setting of your choice.
              </p>
              <ul className="space-y-4">
                {services.map((service) => (
                  <li key={service} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#4AA69D] shrink-0" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#faf9f7] rounded-lg p-8 border border-border">
              <h3 className="text-xl font-semibold mb-4">Book a Visit in {area.name}</h3>
              <p className="text-muted-foreground mb-6">
                Contact us to schedule an in-home or hotel visit in {area.name}. We typically respond within a few hours.
              </p>
              <div className="space-y-4">
                <Link 
                  href="/contact"
                  className="block w-full bg-[#4AA69D] text-white text-center px-6 py-3 rounded-md text-sm font-medium hover:bg-[#3d8a83] transition-colors"
                >
                  Book Consultation
                </Link>
                <a 
                  href="tel:070-2194-0199"
                  className="block w-full border border-[#1a1a1a] text-[#1a1a1a] text-center px-6 py-3 rounded-md text-sm font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors"
                >
                  Call 070-2194-0199
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-20 bg-[#faf9f7]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">How does the home visit work?</h3>
              <p className="text-muted-foreground text-sm">
                After booking, our registered nurse will arrive at your location at the scheduled time with all necessary equipment. The treatment is performed in your home or hotel room for maximum comfort and privacy.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">What should I prepare for the visit?</h3>
              <p className="text-muted-foreground text-sm">
                Please have a comfortable place to sit or recline during treatment. We recommend staying hydrated before your appointment. Our team will bring everything else needed.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">How long does a typical IV therapy session take?</h3>
              <p className="text-muted-foreground text-sm">
                Most IV therapy sessions take between 30-60 minutes depending on the treatment type. Our nurse will explain the expected duration during booking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Other Areas */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif mb-6">Other Areas We Serve</h2>
          <p className="text-muted-foreground mb-8">
            Pitonne provides wellness services throughout central Tokyo.
          </p>
          <Link 
            href="/areas-served"
            className="inline-block border border-[#1a1a1a] text-[#1a1a1a] px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            View All Areas
          </Link>
        </div>
      </section>
    </>
  )
}
