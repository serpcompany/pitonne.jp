import type { Metadata } from "next"
import { PageHero } from "@/components/shared/page-hero"
import { BookingButton } from "@/components/shared/booking-button"
import { localizedHreflangAlternates } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"
import { nonDefaultLocales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { localizedRoute } from "@/lib/data/routes"

export const dynamicParams = false

export async function generateStaticParams() {
  return nonDefaultLocales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const dict = getDictionary(locale as Locale)

  return {
    title: dict.about.aboutPitonne,
    description: dict.about.metaDescription,
    alternates: localizedHreflangAlternates("/about/", locale as Locale),
    openGraph: {
      title: dict.about.aboutPitonne,
      description: dict.about.metaDescription,
      url: localizedHreflangAlternates("/about/", locale as Locale).canonical,
    },
  }
}

interface Props {
  params: Promise<{ locale: string }>
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const dict = getDictionary(locale as Locale)

  const team = [
    {
      name: dict.about.teamKanakoName,
      role: dict.about.teamKanakoRole,
      image: "/images/kana-scaled.jpg",
      bio: dict.about.teamKanakoBio,
    },
    {
      name: dict.about.teamSaoriName,
      role: dict.about.teamSaoriRole,
      image: "/images/saori-scaled.jpg",
      bio: dict.about.teamSaoriBio,
    },
    {
      name: dict.about.teamAkiraName,
      role: dict.about.teamAkiraRole,
      image: "/images/akira_about_3x4-1-scaled.jpg",
      bio: dict.about.teamAkiraBio,
    },
  ]

  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: dict.nav.home, href: localizedRoute("/", locale as Locale) },
          { label: dict.nav.about },
        ]}
        title={dict.about.aboutPitonne}
        description={dict.about.heroDescription}
      />

      {/* Why We Exist Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#7A8F87] mb-4">
                {dict.about.commitment}
              </p>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                {dict.about.whyWeExist}
              </h2>
              <p className="text-muted-foreground">
                {dict.about.whyWeExistContent}
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
                  src="/images/content/sheet/about-how-we-support-you.jpg"
                  alt={dict.about.howWeSupportImageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 px-3 py-1.5 bg-white/50 rounded-full inline-block">
                {dict.about.howWeSupport}
              </p>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                {dict.about.visitBasedCareTitle} <span className="italic">{dict.about.realLife}</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                {dict.about.visitBasedCareContent}
              </p>
              <BookingButton locale={locale as Locale} />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              {dict.about.ourTeam}
            </p>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              {dict.about.meetTheTeam}
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              {dict.about.teamDescription}
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
