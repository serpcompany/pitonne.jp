import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

const areaData: Record<string, Record<string, { name: string; ward: string; wardName: string; description: string }>> = {
  minato: {
    roppongi: { name: "Roppongi", ward: "minato", wardName: "Minato", description: "Roppongi is Tokyo's premier entertainment district, known for its vibrant nightlife, international dining, and luxury hotels." },
    "azabu-juban": { name: "Azabu Juban", ward: "minato", wardName: "Minato", description: "Azabu Juban is an upscale residential area with charming streets, boutique shops, and excellent restaurants." },
    hiroo: { name: "Hiroo", ward: "minato", wardName: "Minato", description: "Hiroo is a quiet, upscale neighborhood popular with expatriates, featuring international shops and cafes." },
    akasaka: { name: "Akasaka", ward: "minato", wardName: "Minato", description: "Akasaka is a bustling business and entertainment district with numerous hotels and restaurants." },
    toranomon: { name: "Toranomon", ward: "minato", wardName: "Minato", description: "Toranomon is a rapidly developing business district with modern skyscrapers and luxury hotels." },
    shimbashi: { name: "Shimbashi", ward: "minato", wardName: "Minato", description: "Shimbashi is a major transportation hub and business district, popular with salarymen." },
  },
  shibuya: {
    ebisu: { name: "Ebisu", ward: "shibuya", wardName: "Shibuya", description: "Ebisu is a trendy neighborhood known for its sophisticated dining scene and Yebisu Garden Place." },
    daikanyama: { name: "Daikanyama", ward: "shibuya", wardName: "Shibuya", description: "Daikanyama is an upscale, fashionable area with designer boutiques and stylish cafes." },
    hiroo: { name: "Hiroo", ward: "shibuya", wardName: "Shibuya", description: "Hiroo borders Shibuya and Minato wards, offering a peaceful residential atmosphere." },
    omotesando: { name: "Omotesando", ward: "shibuya", wardName: "Shibuya", description: "Omotesando is Tokyo's premier fashion boulevard, lined with flagship stores and architectural landmarks." },
    harajuku: { name: "Harajuku", ward: "shibuya", wardName: "Shibuya", description: "Harajuku is famous for its youth culture, street fashion, and the iconic Takeshita Street." },
    yoyogi: { name: "Yoyogi", ward: "shibuya", wardName: "Shibuya", description: "Yoyogi is home to the beautiful Yoyogi Park and the historic Meiji Shrine." },
    "yoyogi-uehara": { name: "Yoyogi Uehara", ward: "shibuya", wardName: "Shibuya", description: "Yoyogi Uehara is a quiet residential area with charming local shops and cafes." },
    sendagaya: { name: "Sendagaya", ward: "shibuya", wardName: "Shibuya", description: "Sendagaya is a mixed residential and commercial area near Shinjuku Gyoen." },
  },
  chuo: {
    ginza: { name: "Ginza", ward: "chuo", wardName: "Chuo", description: "Ginza is Tokyo's most famous upscale shopping district, featuring luxury brands and fine dining." },
    nihonbashi: { name: "Nihonbashi", ward: "chuo", wardName: "Chuo", description: "Nihonbashi is Tokyo's historic commercial center with traditional shops and modern department stores." },
    tsukiji: { name: "Tsukiji", ward: "chuo", wardName: "Chuo", description: "Tsukiji is famous for its outer market and fresh seafood restaurants." },
    hatchobori: { name: "Hatchobori", ward: "chuo", wardName: "Chuo", description: "Hatchobori is a business district with excellent transportation connections." },
  },
  chiyoda: {
    "tokyo-station": { name: "Tokyo Station", ward: "chiyoda", wardName: "Chiyoda", description: "Tokyo Station is Japan's central railway hub, surrounded by major hotels and the Marunouchi business district." },
    otemachi: { name: "Otemachi", ward: "chiyoda", wardName: "Chiyoda", description: "Otemachi is Tokyo's financial center, home to major corporations and luxury hotels." },
    kanda: { name: "Kanda", ward: "chiyoda", wardName: "Chiyoda", description: "Kanda is a historic area known for its bookshops, universities, and traditional atmosphere." },
    akihabara: { name: "Akihabara", ward: "chiyoda", wardName: "Chiyoda", description: "Akihabara is Tokyo's electronics and anime district, attracting visitors from around the world." },
    iidabashi: { name: "Iidabashi", ward: "chiyoda", wardName: "Chiyoda", description: "Iidabashi is a mixed residential and commercial area with excellent transportation links." },
  },
  shinagawa: {
    gotanda: { name: "Gotanda", ward: "shinagawa", wardName: "Shinagawa", description: "Gotanda is a business and entertainment district south of central Tokyo." },
    osaki: { name: "Osaki", ward: "shinagawa", wardName: "Shinagawa", description: "Osaki is a developing business district with modern office buildings and hotels." },
    takanawa: { name: "Takanawa", ward: "shinagawa", wardName: "Shinagawa", description: "Takanawa is an upscale residential area with historic temples and luxury hotels." },
  },
}

export async function generateStaticParams() {
  const params: { ward: string; area: string }[] = []
  for (const [ward, areas] of Object.entries(areaData)) {
    for (const area of Object.keys(areas)) {
      params.push({ ward, area })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ ward: string; area: string }> }): Promise<Metadata> {
  const { ward, area } = await params
  const data = areaData[ward]?.[area]
  if (!data) return { title: "Area Not Found | Pitonne" }
  
  return {
    title: `IV Therapy & Wellness in ${data.name}, ${data.wardName} | Pitonne`,
    description: `Premium IV therapy, stem cell treatments, and wellness services in ${data.name}, ${data.wardName} Ward, Tokyo. Mobile services to your hotel or residence.`,
  }
}

export default async function AreaDetailPage({ params }: { params: Promise<{ ward: string; area: string }> }) {
  const { ward, area } = await params
  const data = areaData[ward]?.[area]
  
  if (!data) {
    notFound()
  }

  return (
    <div className="bg-[#faf9f7]">
      {/* Hero Section */}
      <section className="relative py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm uppercase tracking-widest text-[#4AA69D] mb-4">
            {data.wardName} Ward
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-6">
            IV Therapy in {data.name}
          </h1>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            {data.description}
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-3xl text-[#1a1a1a] mb-8 text-center">
            Our Services in {data.name}
          </h2>
          <p className="text-[#666] text-center mb-12 max-w-2xl mx-auto">
            We bring premium wellness services directly to your hotel, residence, or office in {data.name}. 
            Our licensed medical professionals provide discreet, professional care at your convenience.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg border border-[#e5e5e5]">
              <h3 className="font-serif text-xl text-[#1a1a1a] mb-4">IV Therapy</h3>
              <ul className="space-y-3 text-[#666]">
                <li className="flex items-start gap-3">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Hangover IV Drip</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Energy & Fatigue Recovery</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Immune Boost IV</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Skin Brightening IV</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>IV Vitamin Therapy</span>
                </li>
              </ul>
              <Link href="/services/iv-therapy" className="inline-block mt-6 text-[#4AA69D] hover:underline">
                Learn more about IV Therapy &rarr;
              </Link>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-[#e5e5e5]">
              <h3 className="font-serif text-xl text-[#1a1a1a] mb-4">Stem Cell & Other Services</h3>
              <ul className="space-y-3 text-[#666]">
                <li className="flex items-start gap-3">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Exosome IV Drip</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Stem Cell Nasal Spray</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Medication Services</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#4AA69D]">&#10003;</span>
                  <span>Wellness Consultations</span>
                </li>
              </ul>
              <Link href="/services" className="inline-block mt-6 text-[#4AA69D] hover:underline">
                View all services &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-3xl text-[#1a1a1a] mb-12 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#4AA69D] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                1
              </div>
              <h3 className="font-medium text-[#1a1a1a] mb-2">Contact Us</h3>
              <p className="text-sm text-[#666]">
                Reach out via phone or our contact form to schedule your appointment in {data.name}.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#4AA69D] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                2
              </div>
              <h3 className="font-medium text-[#1a1a1a] mb-2">We Come to You</h3>
              <p className="text-sm text-[#666]">
                Our medical professional arrives at your hotel or residence with all necessary equipment.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#4AA69D] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                3
              </div>
              <h3 className="font-medium text-[#1a1a1a] mb-2">Feel Better</h3>
              <p className="text-sm text-[#666]">
                Relax and enjoy your treatment in the comfort of your own space.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-serif text-3xl text-[#1a1a1a] mb-6">
            Ready to Book in {data.name}?
          </h2>
          <p className="text-[#666] mb-8 max-w-2xl mx-auto">
            Contact us today to schedule your wellness treatment. We typically respond within 1 hour.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="inline-block bg-[#4AA69D] text-white px-8 py-4 rounded-full hover:bg-[#3d8b83] transition-colors"
            >
              Book Now
            </Link>
            <a 
              href="tel:070-2194-0199" 
              className="inline-block bg-transparent border-2 border-[#1a1a1a] text-[#1a1a1a] px-8 py-4 rounded-full hover:bg-[#1a1a1a] hover:text-white transition-colors"
            >
              Call: 070-2194-0199
            </a>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="py-8 border-t border-[#e5e5e5]">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav className="flex items-center gap-2 text-sm text-[#666]">
            <Link href="/areas-served" className="hover:text-[#4AA69D]">Areas Served</Link>
            <span>/</span>
            <Link href={`/areas-served/${ward}`} className="hover:text-[#4AA69D]">{data.wardName}</Link>
            <span>/</span>
            <span className="text-[#1a1a1a]">{data.name}</span>
          </nav>
        </div>
      </section>
    </div>
  )
}
