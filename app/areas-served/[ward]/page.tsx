import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

const wardData: Record<string, { name: string; description: string; areas: { slug: string; name: string }[] }> = {
  minato: {
    name: "Minato",
    description: "Minato Ward is home to many of Tokyo's most prestigious neighborhoods including Roppongi, Azabu, and Akasaka.",
    areas: [
      { slug: "roppongi", name: "Roppongi" },
      { slug: "azabu-juban", name: "Azabu Juban" },
      { slug: "hiroo", name: "Hiroo" },
      { slug: "akasaka", name: "Akasaka" },
      { slug: "toranomon", name: "Toranomon" },
      { slug: "shimbashi", name: "Shimbashi" },
    ]
  },
  shibuya: {
    name: "Shibuya",
    description: "Shibuya Ward encompasses trendy neighborhoods like Ebisu, Daikanyama, and Harajuku.",
    areas: [
      { slug: "ebisu", name: "Ebisu" },
      { slug: "daikanyama", name: "Daikanyama" },
      { slug: "hiroo", name: "Hiroo" },
      { slug: "omotesando", name: "Omotesando" },
      { slug: "harajuku", name: "Harajuku" },
      { slug: "yoyogi", name: "Yoyogi" },
      { slug: "yoyogi-uehara", name: "Yoyogi Uehara" },
      { slug: "sendagaya", name: "Sendagaya" },
    ]
  },
  chuo: {
    name: "Chuo",
    description: "Chuo Ward is the commercial heart of Tokyo, featuring Ginza, Nihonbashi, and Tsukiji.",
    areas: [
      { slug: "ginza", name: "Ginza" },
      { slug: "nihonbashi", name: "Nihonbashi" },
      { slug: "tsukiji", name: "Tsukiji" },
      { slug: "hatchobori", name: "Hatchobori" },
    ]
  },
  chiyoda: {
    name: "Chiyoda",
    description: "Chiyoda Ward is Tokyo's political and business center, home to Tokyo Station and the Imperial Palace.",
    areas: [
      { slug: "tokyo-station", name: "Tokyo Station" },
      { slug: "otemachi", name: "Otemachi" },
      { slug: "kanda", name: "Kanda" },
      { slug: "akihabara", name: "Akihabara" },
      { slug: "iidabashi", name: "Iidabashi" },
    ]
  },
  shinagawa: {
    name: "Shinagawa",
    description: "Shinagawa Ward is a major transport hub with areas like Gotanda and Takanawa.",
    areas: [
      { slug: "gotanda", name: "Gotanda" },
      { slug: "osaki", name: "Osaki" },
      { slug: "takanawa", name: "Takanawa" },
    ]
  },
}

export async function generateStaticParams() {
  return Object.keys(wardData).map((ward) => ({ ward }))
}

export async function generateMetadata({ params }: { params: Promise<{ ward: string }> }): Promise<Metadata> {
  const { ward } = await params
  const data = wardData[ward]
  if (!data) return { title: "Area Not Found | Pitonne" }
  
  return {
    title: `IV Therapy & Wellness in ${data.name} | Pitonne`,
    description: `Premium IV therapy and stem cell services in ${data.name}, Tokyo. We serve ${data.areas.map(a => a.name).join(', ')}.`,
  }
}

export default async function WardPage({ params }: { params: Promise<{ ward: string }> }) {
  const { ward } = await params
  const data = wardData[ward]
  
  if (!data) {
    notFound()
  }

  return (
    <div className="bg-[#faf9f7]">
      {/* Hero Section */}
      <section className="relative py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm uppercase tracking-widest text-[#4AA69D] mb-4">Areas We Serve</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-6">
            {data.name} Ward
          </h1>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            {data.description}
          </p>
        </div>
      </section>

      {/* Areas Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-3xl text-[#1a1a1a] mb-8 text-center">
            Neighborhoods in {data.name}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {data.areas.map((area) => (
              <Link
                key={area.slug}
                href={`/areas-served/${ward}/${area.slug}`}
                className="bg-white p-6 rounded-lg border border-[#e5e5e5] hover:shadow-md hover:border-[#4AA69D] transition-all text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-[#f5ebe0] rounded-full flex items-center justify-center group-hover:bg-[#4AA69D] transition-colors">
                  <svg className="w-6 h-6 text-[#4AA69D] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-[#1a1a1a] mb-2">{area.name}</h3>
                <p className="text-sm text-[#666]">View services</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Available */}
      <section className="py-16 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-serif text-3xl text-[#1a1a1a] mb-6">
            Services Available in {data.name}
          </h2>
          <p className="text-[#666] mb-8 max-w-2xl mx-auto">
            We bring our premium wellness services directly to your location in {data.name} Ward, 
            whether you&apos;re at a hotel, residence, or office.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-medium text-[#1a1a1a] mb-2">IV Therapy</h3>
              <p className="text-sm text-[#666]">Vitamin infusions, hangover recovery, immune support</p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-medium text-[#1a1a1a] mb-2">Stem Cell Therapy</h3>
              <p className="text-sm text-[#666]">Regenerative treatments and exosome therapy</p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-medium text-[#1a1a1a] mb-2">Medications</h3>
              <p className="text-sm text-[#666]">Discreet consultations and prescription services</p>
            </div>
          </div>
          <Link 
            href="/contact" 
            className="inline-block bg-[#4AA69D] text-white px-8 py-4 rounded-full hover:bg-[#3d8b83] transition-colors"
          >
            Book a Session in {data.name}
          </Link>
        </div>
      </section>

      {/* Back Link */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Link href="/areas-served" className="text-[#4AA69D] hover:underline">
            &larr; View all areas
          </Link>
        </div>
      </section>
    </div>
  )
}
