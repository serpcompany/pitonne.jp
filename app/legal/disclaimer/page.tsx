import type { Metadata } from "next"
import Link from "next/link"
import { PageHero } from "@/components/shared/page-hero"

export const metadata: Metadata = {
  title: "Medical Disclaimer | Pitonne",
  description: "Medical disclaimer and important health information for Pitonne IV therapy and wellness services.",
}

export default function DisclaimerPage() {
  return (
    <div className="bg-[#faf9f7]">
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Legal", href: "/legal/" },
          { label: "Medical Disclaimer" },
        ]}
        title="Medical Disclaimer"
        description="Important information about our medical services and treatments."
      />

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-lg max-w-none">
            <div className="bg-white p-8 rounded-lg border border-[#e5e5e5] mb-8">
              <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">General Medical Disclaimer</h2>
              <p className="text-[#666] mb-4">
                The information provided on this website and through our services is for general informational 
                purposes only and should not be considered as medical advice, diagnosis, or treatment recommendations.
              </p>
              <p className="text-[#666]">
                Always seek the advice of your physician or other qualified healthcare provider with any 
                questions you may have regarding a medical condition or treatment.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-[#e5e5e5] mb-8">
              <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">IV Therapy Disclaimer</h2>
              <p className="text-[#666] mb-4">
                IV therapy treatments provided by Pitonne are administered by licensed medical professionals. 
                However, these treatments are not intended to diagnose, treat, cure, or prevent any disease.
              </p>
              <p className="text-[#666] mb-4">
                Individual results may vary. The effectiveness of IV therapy depends on various factors 
                including individual health conditions, hydration levels, and overall wellness.
              </p>
              <p className="text-[#666]">
                Before receiving any IV therapy treatment, you will be required to complete a health 
                assessment and disclose any relevant medical conditions, allergies, or medications.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-[#e5e5e5] mb-8">
              <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Stem Cell Therapy Disclaimer</h2>
              <p className="text-[#666] mb-4">
                Stem cell and exosome treatments offered by Pitonne are emerging therapies. While research 
                shows promising results, these treatments are not FDA-approved for all conditions.
              </p>
              <p className="text-[#666]">
                We recommend discussing stem cell therapy options with your primary healthcare provider 
                before proceeding with any treatment.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-[#e5e5e5] mb-8">
              <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Medication Services Disclaimer</h2>
              <p className="text-[#666] mb-4">
                Prescription medications are only provided after consultation with our licensed physicians 
                and are subject to medical eligibility requirements.
              </p>
              <p className="text-[#666]">
                All medications are dispensed in accordance with Japanese pharmaceutical regulations. 
                Patients are responsible for disclosing complete medical history and current medications.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-[#e5e5e5] mb-8">
              <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Emergency Situations</h2>
              <p className="text-[#666] mb-4">
                Our services are not intended for emergency medical situations. If you are experiencing 
                a medical emergency, please call emergency services immediately:
              </p>
              <ul className="text-[#666] list-disc list-inside space-y-2">
                <li>Emergency (Police, Fire, Ambulance): 110 or 119</li>
                <li>Tokyo English Lifeline: 03-5774-0992</li>
                <li>AMDA International Medical Information Center: 03-5285-8088</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg border border-[#e5e5e5]">
              <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">Limitation of Liability</h2>
              <p className="text-[#666] mb-4">
                Pitonne and its affiliated medical professionals shall not be held liable for any adverse 
                effects, complications, or outcomes resulting from treatments, provided that proper medical 
                protocols were followed.
              </p>
              <p className="text-[#666]">
                By using our services, you acknowledge that you have read and understood this disclaimer 
                and agree to its terms.
              </p>
            </div>
          </div>

          {/* Last Updated */}
          <p className="text-sm text-[#999] mt-8 text-center">
            Last updated: January 2025
          </p>
        </div>
      </section>

      {/* Back Link */}
      <section className="py-8 border-t border-[#e5e5e5]">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/legal" className="text-[#4AA69D] hover:underline">
            &larr; Back to Legal
          </Link>
        </div>
      </section>
    </div>
  )
}
