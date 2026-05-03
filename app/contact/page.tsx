import type { Metadata } from "next"
import { Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react"
import { PageHero } from "@/components/shared/page-hero"
import { canonicalUrl } from "@/lib/seo"
import { businessInfo } from "@/lib/data/site"

const inquiryUrl = "https://ssv.onemorehand.jp/hic_pitonne/support/inquiry?preview=on&lang=en"

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
            <div>
              <h2 className="text-2xl font-serif mb-6">Send Us a Message</h2>
              <div className="rounded-lg border border-border bg-card p-8">
                <p className="mb-6 text-muted-foreground">
                  Use Pitonne&apos;s secure inquiry form to request a consultation or ask questions about services.
                </p>
                <a
                  href={inquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2D766F] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#245f5a] sm:w-auto"
                >
                  Open Inquiry Form
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-serif mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f5ebe0] flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-[#2D766F]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <a href="tel:070-2194-0199" className="text-muted-foreground hover:text-[#2D766F] transition-colors">
                      070-2194-0199
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f5ebe0] flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-[#2D766F]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a href="mailto:pitonne.am@gmail.com" className="text-muted-foreground hover:text-[#2D766F] transition-colors">
                      pitonne.am@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f5ebe0] flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-[#2D766F]" />
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
                    <Clock className="h-5 w-5 text-[#2D766F]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Hours</h3>
                    <div className="text-muted-foreground text-sm space-y-1">
                      {businessInfo.hours.map((item) => (
                        <p key={item.day}>
                          {item.day}: {item.hours}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  )
}
