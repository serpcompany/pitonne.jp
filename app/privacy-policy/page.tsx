import type { Metadata } from "next"
import { PageHero } from "@/components/shared/page-hero"
import { canonicalUrl } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read Pitonne's privacy policy to understand how we collect, use, and protect your personal information.",
  alternates: {
    canonical: canonicalUrl("/legal/privacy-policy/"),
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy" },
        ]}
        title="Privacy Policy"
        meta="Last updated: January 1, 2026"
        size="compact"
      />

      {/* Content */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-serif mb-4">Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Pitonne (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services or visit our website.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may collect information about you in various ways, including:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Personal information you provide (name, email, phone number, address)</li>
                  <li>Medical history and health information relevant to our services</li>
                  <li>Payment and billing information</li>
                  <li>Communication records between you and our team</li>
                  <li>Website usage data and analytics</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Provide and maintain our wellness services</li>
                  <li>Communicate with you about appointments and services</li>
                  <li>Process payments and billing</li>
                  <li>Improve our services and customer experience</li>
                  <li>Comply with legal and regulatory requirements</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Information Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Medical records are retained in accordance with Japanese healthcare regulations.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your information (subject to legal requirements)</li>
                  <li>Opt out of marketing communications</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about this Privacy Policy or our data practices, please contact us at:
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
