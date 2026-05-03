import Link from "next/link"
import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react"

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
  { name: "Privacy Policy", href: "/legal/privacy-policy" },
  { name: "Terms & Conditions", href: "/legal/terms-conditions" },
  { name: "Medical Disclaimer", href: "/medical-disclaimer" },
]

const openHours = [
  { day: "Monday", hours: "10:00 - 19:00" },
  { day: "Tuesday", hours: "Closed" },
  { day: "Wednesday", hours: "Closed" },
  { day: "Thursday", hours: "10:00 - 19:00" },
  { day: "Friday", hours: "10:00 - 19:00" },
  { day: "Saturday", hours: "Closed" },
  { day: "Sunday", hours: "Closed" },
]

const areasServed = [
  { name: "Roppongi", href: "/areas-served/minato/roppongi" },
  { name: "Azabu Juban", href: "/areas-served/minato/azabu-juban" },
  { name: "Hiroo", href: "/areas-served/minato/hiroo" },
  { name: "Akasaka", href: "/areas-served/minato/akasaka" },
  { name: "Shibuya", href: "/areas-served/shibuya" },
  { name: "Ebisu", href: "/areas-served/shibuya/ebisu" },
  { name: "Ginza", href: "/areas-served/chuo/ginza" },
  { name: "Shinagawa", href: "/areas-served/shinagawa" },
]

const socialLinks = [
  { name: "Instagram", href: "https://instagram.com", icon: Instagram },
  { name: "Facebook", href: "https://facebook.com", icon: Facebook },
  { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { name: "YouTube", href: "https://youtube.com", icon: Youtube },
]

export function Footer() {
  return (
    <footer className="bg-[#2d2d2d] text-white">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-serif mb-4">Pitonne</h3>
            <p className="text-sm text-white/80 mb-2">Pitonne Stem Cell & IV Therapy</p>
            <address className="text-sm text-white/70 not-italic space-y-1">
              <p>106-0031 Tokyo, Minato City, Nishiazabu,</p>
              <p>3 Chome-17-22 1F</p>
              <p className="pt-2">
                <a href="tel:070-2194-0199" className="hover:text-white transition-colors">
                  070-2194-0199
                </a>
              </p>
            </address>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Open Hours */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Open Hours</h4>
            <ul className="space-y-1.5">
              {openHours.map((item) => (
                <li key={item.day} className="flex justify-between text-sm">
                  <span className="text-white/70">{item.day}</span>
                  <span className={item.hours === "Closed" ? "text-white/50" : "text-white/90"}>
                    {item.hours}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas Served */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Areas Served</h4>
            <Link 
              href="/areas-served"
              className="text-sm text-[#4AA69D] hover:text-[#5bc4ba] transition-colors mb-3 inline-block"
            >
              View All Areas
            </Link>
            <ul className="space-y-2">
              {areasServed.map((area) => (
                <li key={area.name}>
                  <Link 
                    href={area.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label={social.name}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} Pitonne. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
