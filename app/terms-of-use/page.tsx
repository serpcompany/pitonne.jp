import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Use | Pitonne Stem Cell & IV Therapy",
  description: "Read Pitonne's terms of use governing your access to and use of our website and services.",
}

export default function TermsOfUsePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[#faf9f7] overflow-hidden py-16 lg:py-20">
        <div className="container mx-auto px-4 relative z-10">
          <nav className="text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">&gt;</span>
            <span>Terms of Use</span>
          </nav>
          
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Terms of Use</h1>
          <p className="text-muted-foreground">Last updated: January 1, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-serif mb-4">Agreement to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using the Pitonne website and services, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our website or services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Services Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Pitonne provides concierge wellness services including IV therapy, stem cell-related treatments, and medication consultations in the Tokyo area. Our services are intended for informational and wellness purposes and are not a substitute for professional medical advice, diagnosis, or treatment.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Eligibility</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To use our services, you must be at least 18 years of age and capable of entering into a binding agreement. By using our services, you represent that you meet these requirements.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Appointments and Cancellations</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We require 24-hour notice for appointment cancellations. Cancellations made with less than 24-hour notice may be subject to a cancellation fee. We reserve the right to cancel or reschedule appointments as necessary.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Payment Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Payment is due at the time of service unless otherwise arranged. We accept various payment methods including credit cards and bank transfer. Prices for services are subject to change without notice.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To the fullest extent permitted by law, Pitonne shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services or this website. Our total liability for any claims arising from these terms shall not exceed the amount paid by you for services in the twelve months preceding the claim.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content on this website, including text, graphics, logos, and images, is the property of Pitonne and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms of Use shall be governed by and construed in accordance with the laws of Japan. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Tokyo.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to this website. Your continued use of our services after changes are posted constitutes your acceptance of the modified terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms of Use, please contact us at:
                </p>
                <address className="text-muted-foreground not-italic mt-4">
                  Pitonne<br />
                  106-0031 Tokyo, Minato City, Nishiazabu, 3 Chome-17-22 1F<br />
                  Phone: 070-2194-0199<br />
                  Email: contact@pitonne.jp
                </address>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
