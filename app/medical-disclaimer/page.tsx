import type { Metadata } from "next"
import { PageHero } from "@/components/shared/page-hero"

export const metadata: Metadata = {
  title: "Medical Disclaimer | Pitonne Stem Cell & IV Therapy",
  description: "Important medical disclaimer regarding Pitonne's wellness services and information provided on our website.",
}

export default function MedicalDisclaimerPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Medical Disclaimer" },
        ]}
        title="Medical Disclaimer"
        meta="Last updated: January 1, 2026"
        size="compact"
      />

      {/* Content */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <div className="space-y-8">
              <div className="bg-[#fff8f0] border border-[#d4c4a8] rounded-lg p-6">
                <p className="text-foreground font-medium">
                  Please read this medical disclaimer carefully before using our services or relying on information provided on our website.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Not Medical Advice</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The information provided on the Pitonne website and through our services is for general informational and wellness purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">No Doctor-Patient Relationship</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The use of our website and receipt of general information does not create a doctor-patient relationship. A healthcare provider-patient relationship is only established after a formal consultation and agreement to provide services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Wellness Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our IV therapy, stem cell-related treatments, and other wellness services are designed to support general wellness and are not intended to diagnose, treat, cure, or prevent any disease. Results may vary from person to person, and we make no guarantees regarding the outcomes of any treatment.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Stem Cell and Regenerative Treatments</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Stem cell-related treatments and regenerative therapies offered by Pitonne use stem cell-derived products and are intended for wellness support. These treatments are not FDA-approved for the treatment of specific medical conditions. The efficacy of these treatments varies, and they should not be considered a replacement for conventional medical treatment.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Medications</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Any medications provided through our services are prescribed by licensed physicians after appropriate consultation and review of your medical history. You should disclose all current medications, medical conditions, and allergies to ensure safe treatment. Do not stop taking any prescribed medications without consulting your healthcare provider.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Risks and Side Effects</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All medical and wellness treatments carry potential risks and side effects. IV therapy may cause bruising, infection at the injection site, or allergic reactions. Our staff will discuss potential risks with you before any treatment. If you experience adverse effects, seek medical attention immediately.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Emergency Situations</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you are experiencing a medical emergency, please call emergency services (119 in Japan) immediately. Do not use our services as a substitute for emergency medical care.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Your Responsibility</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You are responsible for providing accurate and complete information about your health status, medical history, and current medications. You are also responsible for following all pre- and post-treatment instructions provided by our team.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif mb-4">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this medical disclaimer or our services, please contact us:
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
