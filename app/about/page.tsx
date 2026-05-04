import Link from "next/link"
import type { Metadata } from "next"
import { PageHero } from "@/components/shared/page-hero"
import { businessInfo } from "@/lib/data/site"
import { canonicalUrl } from "@/lib/seo"

export const metadata: Metadata = {
  title: "About Pitonne",
  description: "Learn about Pitonne, a concierge wellness service based in Nishi Azabu, Tokyo, offering premium IV therapy, stem cell related wellness support, and personalized care.",
  alternates: {
    canonical: canonicalUrl("/about/"),
  },
  openGraph: {
    title: "About Pitonne",
    description: "Learn about Pitonne, a concierge wellness service based in Nishi Azabu, Tokyo, offering premium IV therapy, stem cell related wellness support, and personalized care.",
    url: canonicalUrl("/about/"),
  },
}

const team = [
  {
    name: "Kanako Shimizu",
    role: "Registered Nurse & Public Health Nurse",
    image: "/images/kana-scaled.jpg",
    bio: "Kanako is involved in the operation of a regenerative medicine clinic, with a focus on health optimization and preventive care. As a registered nurse and public health nurse, she supports treatments using stem cell conditioned media and provides wellness support including corporate programs, weight management, and fasting guidance. She believes in helping people care for their health before illness develops, while balancing preventive care with conventional medicine.",
  },
  {
    name: "Saori Tsubaki",
    role: "Registered Nurse & Public Health Nurse",
    image: "/images/saori-scaled.jpg",
    bio: "Saori is involved in health support within the field of regenerative medicine, drawing on her knowledge and experience as a registered nurse and public health nurse. She values supporting each individual's daily well-being through treatment assistance using stem cell conditioned media, as well as preventive care, body maintenance, weight management, and corporate wellness programs.",
  },
  {
    name: "Akira Mikami",
    role: "Physician",
    image: "/images/akira_about_3x4-1-scaled.jpg",
    bio: "Since my years as a resident physician, I have practiced medicine with the words \"Patient First\" held close to my heart. Providing the kind of medical care that I would want to receive myself has always been the foundation of why I chose to become a physician. I believe that as long as I remain true to this principle, it will guide me in making the right decisions for my patients.",
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About" },
        ]}
        title="About Pitonne"
        description="Pitonne is a concierge wellness service based in Nishi Azabu, Tokyo, offering premium IV therapy, stem cell related wellness support, and personalized care through in-home and hotel visits. We are designed for busy professionals, international visitors, and clients who value privacy, convenience, and clinically guided support. Our goal is to make wellness care feel more accessible, discreet, and tailored to real life in Tokyo."
      />

      {/* Why We Exist Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#7A8F87] mb-4">
                Commitment
              </p>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Why We Exist
              </h2>
              <p className="text-muted-foreground">
                Our mission is to deliver discreet, high quality wellness support with clinical attentiveness, clear communication, and personalized care. We created Pitonne to offer a more thoughtful way to access IV therapy, stem cell related wellness support, and visit based services in Tokyo. By combining convenience with professional support, we aim to help each client feel cared for, respected, and supported in a way that fits their individual needs.
              </p>
            </div>

            {/* Clinic Reception Image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-lg overflow-hidden">
                <img 
                  src="/images/content/sheet/about-clinic.jpg"
                  alt="Pitonne clinic reception area"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative leaf */}
              <div className="absolute -right-6 top-0 w-16 h-24 opacity-40 hidden lg:block">
                <svg viewBox="0 0 60 100" className="w-full h-full text-[#d4c4a8]">
                  <path d="M30 5 Q50 30 40 55 Q30 80 30 95" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M35 20 Q50 28 45 40" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M25 50 Q10 60 20 75" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Support You Section */}
      <section className="py-20 lg:py-28 bg-[#f5ebe0]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-[4/3] rounded-lg overflow-hidden">
                <img
                  src="/images/content/pages/Back_View_H.jpg"
                  alt="Pitonne private consultation room"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 px-3 py-1.5 bg-white/50 rounded-full inline-block">
                How We Support You
              </p>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Visit-Based Care Designed Around <span className="italic">Real Life.</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Pitonne provides flexible visit based care for people who want wellness support that fits naturally into their schedule. Whether at home, in a hotel, or between demanding work commitments, our service is built to offer discreet and comfortable care in a setting that feels convenient and private. We support clients who value time, personalized attention, and a calmer care experience in Tokyo.
              </p>
              <Link 
                href={businessInfo.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-[#1a1a1a] text-[#1a1a1a] px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors"
              >
                Book Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Our Team
            </p>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Meet The Team
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              Our team brings together registered nurses, public health experience, and physician leadership to support each client with compassion and clarity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div 
                key={member.name}
                className="bg-[#faf9f7] rounded-lg p-6 border border-border"
              >
                {/* Team Member Photo */}
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-center mb-1">{member.name}</h3>
                <p className="text-sm text-[#7A8F87] text-center mb-4">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
