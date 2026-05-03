import type { Metadata } from "next"
import { PageHero } from "@/components/shared/page-hero"
import { canonicalUrl } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Pitonne Stem Cell & IV Therapy services in Tokyo.",
  alternates: {
    canonical: canonicalUrl("/legal/privacy-policy/"),
  },
  openGraph: {
    title: "Privacy Policy",
    description: "Privacy Policy for Pitonne Stem Cell & IV Therapy services in Tokyo.",
    url: canonicalUrl("/legal/privacy-policy/"),
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#faf9f7]">
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Legal", href: "/legal/" },
          { label: "Privacy Policy" },
        ]}
        title="Privacy Policy"
        meta="Last updated: January 2024"
        size="compact"
      />

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-lg max-w-none text-[#666]">
            <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Introduction</h2>
            <p className="mb-6">
              Pitonne (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              services or visit our website.
            </p>

            <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Information We Collect</h2>
            <p className="mb-4">We may collect information about you in a variety of ways, including:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Personal data (name, email address, phone number)</li>
              <li>Health information necessary for providing our services</li>
              <li>Billing and payment information</li>
              <li>Location information for service delivery</li>
              <li>Communications you send to us</li>
            </ul>

            <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Data Security</h2>
            <p className="mb-6">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Your Rights</h2>
            <p className="mb-6">
              You have the right to access, correct, or delete your personal information. You may also 
              have the right to restrict or object to certain processing of your data.
            </p>

            <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4 mt-8">Contact Us</h2>
            <p className="mb-6">
              If you have questions about this Privacy Policy, please contact us at:<br />
              Email: info@pitonne.jp<br />
              Phone: 070-2194-0199
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
