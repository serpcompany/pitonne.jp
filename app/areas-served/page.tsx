import Link from "next/link"
import type { Metadata } from "next"
import { MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "Areas Served | Pitonne Stem Cell & IV Therapy",
  description: "Pitonne provides concierge wellness services throughout Tokyo including Roppongi, Azabu, Shibuya, Ginza, and surrounding areas.",
}

const areas = [
  { name: "Roppongi", slug: "roppongi", ward: "Minato" },
  { name: "Azabu Juban", slug: "azabu-juban", ward: "Minato" },
  { name: "Hiroo", slug: "hiroo", ward: "Minato" },
  { name: "Akasaka", slug: "akasaka", ward: "Minato" },
  { name: "Nishi-Azabu", slug: "nishi-azabu", ward: "Minato" },
  { name: "Mita", slug: "mita", ward: "Minato" },
  { name: "Shibuya", slug: "shibuya", ward: "Shibuya" },
  { name: "Ebisu", slug: "ebisu", ward: "Shibuya" },
  { name: "Daikanyama", slug: "daikanyama", ward: "Shibuya" },
  { name: "Harajuku", slug: "harajuku", ward: "Shibuya" },
  { name: "Omotesando", slug: "omotesando", ward: "Shibuya" },
  { name: "Ginza", slug: "ginza", ward: "Chuo" },
  { name: "Marunouchi", slug: "marunouchi", ward: "Chiyoda" },
  { name: "Otemachi", slug: "otemachi", ward: "Chiyoda" },
  { name: "Shinagawa", slug: "shinagawa", ward: "Shinagawa" },
  { name: "Meguro", slug: "meguro", ward: "Meguro" },
  { name: "Nakameguro", slug: "nakameguro", ward: "Meguro" },
  { name: "Shinjuku", slug: "shinjuku", ward: "Shinjuku" },
  { name: "Yotsuya", slug: "yotsuya", ward: "Shinjuku" },
  { name: "Ikebukuro", slug: "ikebukuro", ward: "Toshima" },
  { name: "Aoyama", slug: "aoyama", ward: "Minato" },
  { name: "Toranomon", slug: "toranomon", ward: "Minato" },
  { name: "Shimbashi", slug: "shimbashi", ward: "Minato" },
  { name: "Odaiba", slug: "odaiba", ward: "Minato" },
  { name: "Toyosu", slug: "toyosu", ward: "Koto" },
  { name: "Nihonbashi", slug: "nihonbashi", ward: "Chuo" },
  { name: "Tsukiji", slug: "tsukiji", ward: "Chuo" },
  { name: "Roppongi Hills", slug: "roppongi-hills", ward: "Minato" },
]

export default function AreasServedPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[#faf9f7] overflow-hidden py-16 lg:py-20">
        <div className="absolute left-0 bottom-0 w-32 h-32 opacity-50">
          <svg viewBox="0 0 120 120" className="w-full h-full text-[#8bb3b0]">
            <ellipse cx="30" cy="90" rx="50" ry="40" fill="currentColor" opacity="0.3" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <nav className="text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">&gt;</span>
            <span>Areas Served</span>
          </nav>
          
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Areas Served</h1>
          <p className="max-w-3xl text-muted-foreground">
            Pitonne provides concierge wellness services throughout central Tokyo. Our registered nurses travel to your home or hotel to deliver premium IV therapy, stem cell treatments, and wellness consultations.
          </p>
        </div>
      </section>

      {/* Areas Grid */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {areas.map((area) => (
              <Link
                key={area.slug}
                href={`/areas-served/${area.slug}`}
                className="group flex items-center gap-3 p-4 rounded-lg border border-border bg-[#faf9f7] hover:bg-[#f5ebe0] hover:border-[#d4c4a8] transition-all"
              >
                <MapPin className="h-5 w-5 text-[#4AA69D] shrink-0" />
                <div>
                  <p className="font-medium group-hover:text-[#4AA69D] transition-colors">{area.name}</p>
                  <p className="text-xs text-muted-foreground">{area.ward} Ward</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas Info */}
      <section className="py-16 lg:py-20 bg-[#faf9f7]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif mb-6">Mobile Wellness Services</h2>
            <p className="text-muted-foreground mb-8">
              Our team travels to locations throughout Tokyo to provide in-home and hotel-based wellness services. We primarily serve central Tokyo areas within a reasonable distance from our Nishi-Azabu clinic.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-white rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-2">Home Visits</h3>
                <p className="text-sm text-muted-foreground">
                  Receive IV therapy and wellness services in the comfort of your own home.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-2">Hotel Service</h3>
                <p className="text-sm text-muted-foreground">
                  Perfect for travelers and business visitors staying in Tokyo hotels.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-2">Office Visits</h3>
                <p className="text-sm text-muted-foreground">
                  Corporate wellness services available at your workplace.
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
            Not Sure If We Serve Your Area?
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
            Contact us to confirm service availability in your location. We may be able to accommodate areas not listed above.
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-[#4AA69D] text-white px-8 py-3 rounded-md text-sm font-medium hover:bg-[#3d8a83] transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </>
  )
}
