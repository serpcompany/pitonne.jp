import Link from "next/link"
import { Check } from "lucide-react"

const services = [
  {
    title: "IV Therapy",
    description: "Targeted hydration and nutrient support designed around recovery, energy, immunity, and skin wellness.",
    href: "/services/iv-therapy",
  },
  {
    title: "Stem Cell Therapy",
    description: "Regenerative wellness support focused on practical delivery options and individualized care planning.",
    href: "/services/stem-cell-therapy",
  },
  {
    title: "Medications",
    description: "Prescription-based support delivered with discretion and physician review where appropriate.",
    href: "/services/medications",
  },
  {
    title: "Wellness Consultations",
    description: "Discreet access to medication options supported by careful review and straightforward next steps.",
    href: "/services",
  },
]

const blogPosts = [
  {
    date: "April 29, 2026",
    title: "What Is An Exosome IV Drip? Differences From Stem Cell Conditioned Media, Cost, And Risks Explained",
    href: "/blog/exosome-iv-drip",
  },
  {
    date: "March 16, 2026",
    title: "IV Therapy For Fatigue: When Low Energy May Point To Hydration Support",
    href: "/blog/iv-therapy-fatigue",
  },
  {
    date: "March 16, 2026",
    title: "IV Therapy For Hangover: What It May Help With And What It Cannot Do",
    href: "/blog/iv-therapy-hangover",
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[#faf9f7] overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute left-0 bottom-0 w-48 h-48 opacity-60">
          <svg viewBox="0 0 200 200" className="w-full h-full text-[#8bb3b0]">
            <ellipse cx="50" cy="150" rx="80" ry="60" fill="currentColor" opacity="0.3" />
            <path d="M60 180 Q80 120 70 80 Q90 100 100 60" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M80 170 Q100 130 90 100 Q110 115 115 85" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
          </svg>
        </div>
        <div className="absolute right-0 top-20 w-48 h-64 opacity-40">
          <svg viewBox="0 0 200 300" className="w-full h-full text-[#8bb3b0]">
            <path d="M150 50 Q170 100 160 150 Q180 200 170 250" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M160 80 Q140 100 150 120" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M165 120 Q185 140 175 160" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M155 180 Q135 200 145 220" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="container mx-auto px-4 py-20 lg:py-32 text-center relative z-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Concierge Wellness in Tokyo
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 text-balance">
            Pitonne Stem<br />
            Cell & IV Therapy
          </h1>
          <p className="max-w-xl mx-auto text-muted-foreground mb-8">
            Pitonne is a concierge wellness service based in Nishi Azabu, Tokyo, specializing in premium IV therapy, stem cell related wellness support, and personalized in-home or hotel visit care.
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-[#1a1a1a] text-white px-8 py-3 rounded-md text-sm font-medium hover:bg-[#333] transition-colors"
          >
            Book Consultation
          </Link>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image placeholder */}
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-[#f5ebe0] to-[#e8d4c8] rounded-lg overflow-hidden flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/50 flex items-center justify-center">
                    <span className="text-4xl font-serif text-[#8bb3b0]">P</span>
                  </div>
                  <p className="text-sm">Clinic Interior</p>
                </div>
              </div>
              {/* Decorative leaf */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-32 opacity-30 hidden lg:block">
                <svg viewBox="0 0 60 120" className="w-full h-full text-[#8bb3b0]">
                  <path d="M30 10 Q50 40 40 70 Q30 100 30 110" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M30 30 Q20 45 25 55" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M35 50 Q45 60 40 75" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#4AA69D] mb-4 px-3 py-1.5 bg-[#f5ebe0] rounded-full inline-block">
                Who We Are
              </p>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Concierge Wellness Support, Backed By{" "}
                <span className="italic">Clinical Care.</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Pitonne is a concierge wellness service based in Nishi Azabu, Tokyo, specializing in premium IV therapy, stem cell related wellness support, and personalized in-home or hotel visit care. In-home and hotel visit care. Registered nurse-led support. Central Tokyo concierge service.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#4AA69D]" />
                  <span>In-home and hotel visit care</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#4AA69D]" />
                  <span>Registered nurse-led support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#4AA69D]" />
                  <span>Central Tokyo concierge service</span>
                </li>
              </ul>
              <Link 
                href="/about"
                className="inline-block border border-[#1a1a1a] text-[#1a1a1a] px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors"
              >
                About Pitonne
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 lg:py-28 bg-[#faf9f7]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Our Services
            </p>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Explore All Our <span className="italic">Services</span>
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              From mobile IV therapy support and stem cell treatment consultations to online prescription services, Pitonne offers discreet, personalized care tailored to each client&apos;s needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group bg-white rounded-lg p-6 border border-border hover:shadow-lg transition-all duration-300"
              >
                <div className="h-32 bg-gradient-to-br from-[#f5ebe0] to-[#e8d4c8] rounded-md mb-4 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/70 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-[#d4c4a8]" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#4AA69D] transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
        {/* Decorative leaf */}
        <div className="absolute right-0 top-20 w-32 h-48 opacity-30 hidden lg:block">
          <svg viewBox="0 0 120 180" className="w-full h-full text-[#d4c4a8]">
            <path d="M60 20 Q90 60 80 100 Q70 140 60 170" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M65 40 Q85 50 80 70" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M55 80 Q35 95 45 115" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M70 120 Q90 130 85 150" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-[#4AA69D] mb-4">
              Blog
            </p>
            <h2 className="text-3xl md:text-4xl font-serif">
              Read Our Latest Posts
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-0">
            {blogPosts.map((post, index) => (
              <Link
                key={index}
                href={post.href}
                className="block group"
              >
                <div className="flex items-start gap-4 py-5 border-b border-border">
                  <span className="text-xs text-muted-foreground whitespace-nowrap mt-1 w-24 shrink-0">
                    {post.date}
                  </span>
                  <h3 className="text-base md:text-lg font-medium group-hover:text-[#4AA69D] transition-colors">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link 
              href="/blog"
              className="inline-block border border-[#1a1a1a] text-[#1a1a1a] px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors"
            >
              View All Posts
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
