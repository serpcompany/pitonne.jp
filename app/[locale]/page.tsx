import Link from "next/link"
import Image from "next/image"
import { Check } from "lucide-react"
import { canonicalRoutes } from "@/lib/data/routes"
import { localizedRoute } from "@/lib/data/routes"
import { BookingButton } from "@/components/shared/booking-button"
import { nonDefaultLocales, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { getAllBlogPosts } from "@/lib/data/blog-posts"

export const dynamicParams = false

interface Props {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return nonDefaultLocales.map((locale) => ({ locale }))
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const dict = getDictionary(locale as Locale)

  const services = [
    {
      title: dict.home.ivTherapyTitle,
      description: dict.home.ivTherapyDescription,
      href: "/services/iv-therapy",
      image: "/images/content/sheet/services/iv-therapy.jpg",
    },
    {
      title: dict.home.stemCellTitle,
      description: dict.home.stemCellDescription,
      href: "/services/stem-cell-therapy",
      image: "/images/content/sheet/services/stem-cell-therapy.jpg",
    },
    {
      title: dict.home.medicationTitle,
      description: dict.home.medicationDescription,
      href: canonicalRoutes.medication,
      image: "/images/medication.jpeg",
    },
    {
      title: dict.home.bloodTestsTitle,
      description: dict.home.bloodTestsDescription,
      href: "/services/blood-tests",
      image: "/images/content/sheet/services/nutrition-blood-testing.jpg",
    },
  ]

  const latestPosts = getAllBlogPosts(locale as Locale).slice(0, 3)

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100svh-73px)] items-center overflow-hidden bg-[#faf9f7]">
        {/* Decorative Leaf Elements */}
        <div className="absolute left-0 bottom-0 w-32 h-48 opacity-60">
          <Image
            src="/images/Leaf-3.png"
            alt=""
            className="w-full h-full object-contain"
            aria-hidden="true"
            width={128}
            height={192}
            loading="lazy"
          />
        </div>
        <div className="absolute right-0 top-20 w-24 h-40 opacity-50">
          <Image
            src="/images/Leaf-2-e1744282707104.png"
            alt=""
            className="w-full h-full object-contain"
            aria-hidden="true"
            width={96}
            height={160}
            loading="lazy"
          />
        </div>

        <div className="container mx-auto px-4 py-20 lg:py-32 text-center relative z-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
            {dict.home.heroEyebrow}
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 text-balance">
            {dict.home.heroTitle}
          </h1>
          <p className="max-w-xl mx-auto text-muted-foreground mb-8">
            {dict.home.heroDescription}
          </p>
          <BookingButton className="px-8" locale={locale as Locale} />
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Clinic Image */}
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src="/images/content/sheet/home.jpg"
                  alt="Tokyo Tower view near Pitonne in Nishi Azabu"
                  className="w-full h-full object-cover"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
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
              <p className="text-xs uppercase tracking-[0.2em] text-[#7A8F87] mb-4 px-3 py-1.5 bg-[#f5ebe0] rounded-full inline-block">
                {dict.home.whoWeAre}
              </p>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                {dict.home.clinicalCareHeading}{" "}
                <span className="italic">{dict.home.clinicalCare}</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                {dict.home.aboutDescription}
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#7A8F87]" />
                  <span>{dict.home.homeVisits}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#7A8F87]" />
                  <span>{dict.home.nurseLed}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#7A8F87]" />
                  <span>{dict.home.conciergeService}</span>
                </li>
              </ul>
              <Link
                href={localizedRoute("/about", locale as Locale)}
                className="inline-block border border-[#1a1a1a] text-[#1a1a1a] px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors"
              >
                {dict.about.aboutPitonne}
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
              {dict.home.ourServices}
            </p>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              {dict.home.exploreServices}
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              {dict.home.servicesDescription}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link
                key={service.title}
                href={localizedRoute(service.href, locale as Locale)}
                className="group bg-white rounded-lg p-6 border border-border hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-32 rounded-md mb-4 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#7A8F87] transition-colors">
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

      {locale === "ja" ? (
        <section className="py-20 lg:py-28 bg-white">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <p className="text-xs uppercase tracking-[0.2em] text-[#7A8F87] mb-4">
                {dict.home.whyChooseFeaturesTitle}
              </p>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                {dict.home.whyChooseTitle}
              </h2>
              <div className="space-y-4 text-muted-foreground mb-8">
                <p>{dict.home.whyChooseDescription}</p>
                <p>{dict.home.whyChooseSecondaryDescription}</p>
              </div>
              <ul className="grid gap-3 md:grid-cols-2">
                {dict.home.whyChooseFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-[#7A8F87]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

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
            <p className="text-xs uppercase tracking-[0.2em] text-[#7A8F87] mb-4">
              {dict.blog.blog}
            </p>
            <h2 className="text-3xl md:text-4xl font-serif">
              {dict.home.latestPosts}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-0">
            {latestPosts.map((post) => (
              <Link
                key={post.slug}
                href={localizedRoute(`/blog/${post.slug}/`, locale as Locale)}
                className="block group"
              >
                <div className="flex items-start gap-4 py-5 border-b border-border">
                  <span className="text-xs text-muted-foreground whitespace-nowrap mt-1 w-24 shrink-0">
                    {new Date(post.publishedAt).toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                  <h3 className="text-base md:text-lg font-medium group-hover:text-[#7A8F87] transition-colors">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href={localizedRoute("/blog", locale as Locale)}
              className="inline-block border border-[#1a1a1a] text-[#1a1a1a] px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors"
            >
              {dict.home.viewAllPosts}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
