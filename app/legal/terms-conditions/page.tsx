import type { Metadata } from "next"
import { PageHero } from "@/components/shared/page-hero"
import { canonicalUrl } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and Conditions for Pitonne Stem Cell & IV Therapy services in Tokyo.",
  alternates: {
    canonical: canonicalUrl("/legal/terms-conditions/"),
  },
  openGraph: {
    title: "Terms & Conditions",
    description: "Terms and Conditions for Pitonne Stem Cell & IV Therapy services in Tokyo.",
    url: canonicalUrl("/legal/terms-conditions/"),
  },
}

export default function TermsConditionsPage() {
  return (
    <div className="bg-[#faf9f7]">
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Legal", href: "/legal/" },
          { label: "Terms & Conditions" },
        ]}
        title="Terms & Conditions"
        meta="Last updated: January 2024"
        size="compact"
      />

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-lg max-w-none text-[#666]">
            <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Agreement to Terms</h2>
            <p className="mb-6">
              By accessing or using Pitonne&apos;s services, you agree to be bound by these Terms and 
              Conditions. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Services</h2>
            <p className="mb-6">
              Pitonne provides wellness and medical services including IV therapy, stem cell-related 
              treatments, and medication consultations. All services are provided by licensed medical 
              professionals in accordance with Japanese medical regulations.
            </p>

            <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Medical Disclaimer</h2>
            <p className="mb-6">
              Our services are not intended to diagnose, treat, cure, or prevent any disease. The 
              information provided is for general wellness purposes and should not replace professional 
              medical advice. Always consult with a qualified healthcare provider regarding any medical 
              conditions.
            </p>

            <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Booking and Cancellation</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Appointments must be booked in advance</li>
              <li>Cancellations should be made at least 24 hours before the scheduled appointment</li>
              <li>Late cancellations may incur a cancellation fee</li>
              <li>We reserve the right to cancel appointments if necessary</li>
            </ul>

            <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Payment</h2>
            <p className="mb-6">
              Payment is due at the time of service unless otherwise arranged. We accept various 
              payment methods including credit cards and bank transfers.
            </p>

            <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Limitation of Liability</h2>
            <p className="mb-6">
              To the fullest extent permitted by law, Pitonne shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages resulting from your use of our 
              services.
            </p>

            <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Changes to Terms</h2>
            <p className="mb-6">
              We reserve the right to modify these terms at any time. Changes will be effective 
              immediately upon posting to our website.
            </p>

            <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Contact</h2>
            <p className="mb-6">
              For questions about these Terms & Conditions, please contact us at:<br />
              Email: info@pitonne.jp<br />
              Phone: 070-2194-0199
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
