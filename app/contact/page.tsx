import type { Metadata } from "next"
import { Phone, Mail, MapPin, Clock } from "lucide-react"
import { ContactForm } from "@/components/contact-form"
import { PageHero } from "@/components/shared/page-hero"
import { canonicalUrl } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Contact Pitonne",
  description: "Contact Pitonne to book a consultation or ask questions about IV therapy, stem cell related wellness support, and concierge care in Tokyo.",
  alternates: {
    canonical: canonicalUrl("/contact/"),
  },
  openGraph: {
    title: "Contact Pitonne",
    description: "Contact Pitonne to book a consultation or ask questions about IV therapy, stem cell related wellness support, and concierge care in Tokyo.",
    url: canonicalUrl("/contact/"),
  },
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact" },
        ]}
        title="Contact Us"
        description="Ready to book a consultation or have questions about our services? Get in touch with us and our team will respond promptly."
      />

      {/* Contact Content */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-serif mb-6">Send Us a Message</h2>
              <ContactForm />
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-serif mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f5ebe0] flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-[#4AA69D]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <a href="tel:070-2194-0199" className="text-muted-foreground hover:text-[#4AA69D] transition-colors">
                      070-2194-0199
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f5ebe0] flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-[#4AA69D]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a href="mailto:contact@pitonne.jp" className="text-muted-foreground hover:text-[#4AA69D] transition-colors">
                      contact@pitonne.jp
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f5ebe0] flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-[#4AA69D]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <address className="text-muted-foreground not-italic">
                      106-0031 Tokyo, Minato City,<br />
                      Nishiazabu, 3 Chome-17-22 1F
                    </address>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f5ebe0] flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-[#4AA69D]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Hours</h3>
                    <div className="text-muted-foreground text-sm space-y-1">
                      <p>Monday: 10:00 - 19:00</p>
                      <p>Tuesday: Closed</p>
                      <p>Wednesday: Closed</p>
                      <p>Thursday: 10:00 - 19:00</p>
                      <p>Friday: 10:00 - 19:00</p>
                      <p>Saturday: Closed</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="mt-8 aspect-video bg-gradient-to-br from-[#f5ebe0] to-[#e8d4c8] rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-[#4AA69D]" />
                  <p className="text-sm">Nishi-Azabu, Tokyo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
