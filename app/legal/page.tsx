import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Legal | Pitonne",
  description: "Legal information, privacy policy, terms and conditions, and medical disclaimer for Pitonne wellness services.",
}

const legalPages = [
  {
    title: "Privacy Policy",
    href: "/legal/privacy-policy",
    description: "How we collect, use, and protect your personal information.",
  },
  {
    title: "Terms & Conditions",
    href: "/legal/terms-conditions",
    description: "Terms of service for using Pitonne wellness services.",
  },
  {
    title: "Medical Disclaimer",
    href: "/legal/disclaimer",
    description: "Important medical and health-related disclaimers.",
  },
]

export default function LegalPage() {
  return (
    <div className="bg-[#faf9f7]">
      {/* Hero Section */}
      <section className="relative py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-6">
            Legal Information
          </h1>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            Important legal documents and policies governing the use of Pitonne services.
          </p>
        </div>
      </section>

      {/* Legal Pages Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-3 gap-6">
            {legalPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="bg-white p-8 rounded-lg border border-[#e5e5e5] hover:shadow-md hover:border-[#4AA69D] transition-all group"
              >
                <h2 className="font-serif text-xl text-[#1a1a1a] mb-3 group-hover:text-[#4AA69D] transition-colors">
                  {page.title}
                </h2>
                <p className="text-[#666] text-sm mb-4">
                  {page.description}
                </p>
                <span className="text-[#4AA69D] text-sm">
                  Read more &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">
            Questions About Our Policies?
          </h2>
          <p className="text-[#666] mb-6">
            If you have any questions about our legal documents or policies, please contact us.
          </p>
          <Link 
            href="/contact" 
            className="inline-block bg-[#4AA69D] text-white px-8 py-4 rounded-full hover:bg-[#3d8b83] transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}
