import Link from "next/link"
import { Instagram, Facebook, Linkedin, Youtube, Twitter, MapPin, Music, Podcast, Pin } from "lucide-react"
import { businessInfo } from "@/lib/data/site"
import { canonicalRoutes } from "@/lib/data/routes"

// Custom SVG icons for platforms not in lucide
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  )
}

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.025.842-.702 2.011-1.129 3.382-1.238.932-.074 1.9-.035 2.893.115.003-.497-.036-.972-.125-1.42-.269-1.357-.946-2.149-2.012-2.354a3.123 3.123 0 0 0-.56-.05c-.924 0-1.807.421-2.216 1.059l-1.663-1.127c.705-1.098 2.058-1.773 3.529-1.773.31 0 .618.03.919.09 1.87.35 3.084 1.627 3.509 3.69.152.738.22 1.58.2 2.514l.022.299c1.966.456 3.06 1.728 3.06 3.7 0 .13-.01.26-.022.395-.075.806-.325 1.546-.745 2.202-.56.871-1.383 1.586-2.448 2.125-1.348.681-2.966 1.077-4.823 1.177-.308.016-.617.024-.926.024zm1.226-6.5c-.056 0-.112.001-.168.004-.984.053-1.737.38-2.178.946-.334.428-.487.936-.457 1.512.054.977.677 1.573 1.39 2.035.562.364 1.365.533 2.26.477 1.166-.063 2.065-.477 2.674-1.233.463-.576.744-1.335.837-2.263-.79-.256-1.596-.426-2.407-.47a8.067 8.067 0 0 0-1.95-.008z"/>
    </svg>
  )
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  )
}

function ApplePodcastIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.34 0A5.328 5.328 0 0 0 0 5.34v13.32A5.328 5.328 0 0 0 5.34 24h13.32A5.328 5.328 0 0 0 24 18.66V5.34A5.328 5.328 0 0 0 18.66 0zm6.525 2.568c4.987 0 9.037 4.02 9.037 8.972 0 3.44-1.937 6.417-4.78 7.937a.196.196 0 0 1-.283-.182v-.007a.2.2 0 0 1 .096-.168 7.92 7.92 0 0 0 3.9-6.844c0-4.394-3.58-7.962-7.97-7.962-4.39 0-7.97 3.568-7.97 7.962 0 2.89 1.54 5.418 3.846 6.82a.2.2 0 0 1 .098.17v.007a.196.196 0 0 1-.282.18c-2.8-1.53-4.71-4.49-4.71-7.912 0-4.952 4.05-8.972 9.018-8.972zm.023 2.682c3.508 0 6.357 2.826 6.357 6.306 0 2.51-1.466 4.68-3.594 5.713-.09.04-.2-.03-.2-.13a.197.197 0 0 1 .09-.163 5.315 5.315 0 0 0 2.636-4.589c0-2.95-2.41-5.347-5.377-5.347-2.966 0-5.377 2.396-5.377 5.347 0 1.925 1.02 3.613 2.55 4.55a.197.197 0 0 1 .092.163c0 .1-.11.17-.202.13-2.07-1.06-3.5-3.203-3.5-5.674 0-3.48 2.85-6.306 6.525-6.306zm-.034 2.76a3.584 3.584 0 0 1 3.594 3.572c0 1.38-.79 2.575-1.94 3.17a.196.196 0 0 1-.282-.176v-.006c0-.075.043-.14.107-.172a2.68 2.68 0 0 0 1.417-2.364c0-1.49-1.22-2.7-2.724-2.7s-2.724 1.21-2.724 2.7c0 1.03.583 1.925 1.44 2.378a.197.197 0 0 1 .106.173v.007a.196.196 0 0 1-.283.175 3.53 3.53 0 0 1-1.96-3.168 3.584 3.584 0 0 1 3.249-3.59zm-.026 2.626c.56 0 1.017.453 1.017 1.01s-.458 1.01-1.017 1.01c-.56 0-1.018-.453-1.018-1.01s.458-1.01 1.018-1.01zm.003 2.877c.397 0 .728.063.98.188a.21.21 0 0 1 .117.203v4.18c0 .472-.27.875-.663 1.078a1.393 1.393 0 0 1-1.395-.062c-.35-.217-.566-.6-.566-1.016v-3.712c0-.253.09-.41.25-.523.168-.12.42-.247.75-.29.114-.016.3-.046.527-.046z"/>
    </svg>
  )
}

const quickLinks = [
  { name: "Home", href: canonicalRoutes.home },
  { name: "About", href: canonicalRoutes.about },
  { name: "Services", href: canonicalRoutes.services },
  { name: "Blog", href: canonicalRoutes.blog },
  { name: "FAQs", href: canonicalRoutes.faqs },
  { name: "Contact", href: canonicalRoutes.contact },
  { name: "Legal", href: canonicalRoutes.legal },
]

const areasServed = [
  { name: "Roppongi", href: "/areas-served/minato/roppongi" },
  { name: "Azabu Juban", href: "/areas-served/minato/azabu-juban" },
  { name: "Minato / Hiroo", href: "/areas-served/minato/hiroo/" },
  { name: "Akasaka", href: "/areas-served/minato/akasaka" },
  { name: "Shibuya", href: "/areas-served/shibuya" },
  { name: "Ebisu", href: "/areas-served/shibuya/ebisu" },
  { name: "Ginza", href: "/areas-served/chuo/ginza" },
  { name: "Shinagawa", href: "/areas-served/shinagawa" },
]

// Main social links (shown as icons)
const socialLinks = [
  { name: "Google Maps", href: "https://maps.app.goo.gl/WjMLKSkNw7t2oc5T6", icon: MapPin },
  { name: "YouTube", href: "https://www.youtube.com/@PitonneStemCellIVTherapy", icon: Youtube },
  { name: "Instagram", href: "https://www.instagram.com/pitonne.am", icon: Instagram },
  { name: "Facebook", href: "https://www.facebook.com/PitonneStemCellIVTherapy/", icon: Facebook },
  { name: "Threads", href: "https://www.threads.com/@pitonne.am", icon: ThreadsIcon },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/pitonnestemcellivtherapy/", icon: Linkedin },
  { name: "TikTok", href: "https://www.tiktok.com/@ouchi_nurse_karte", icon: TikTokIcon },
  { name: "X (Twitter)", href: "https://x.com/pitonne1184", icon: Twitter },
  { name: "Pinterest", href: "https://pinterest.com/pitonne1184am/", icon: Pin },
]

// Podcast links
const podcastLinks = [
  { name: "Spotify", href: "https://open.spotify.com/show/7c75dDPlIQ2qL5TKEoWb7P?si=9kRgvJtvSDamHjQrfgJRnA", icon: SpotifyIcon },
  { name: "Apple Podcasts", href: "https://podcasts.apple.com/jp/podcast/%E3%81%8A%E3%81%86%E3%81%A1%E3%83%8A%E3%83%BC%E3%82%B9%E3%81%AE%E3%81%8A%E3%81%97%E3%82%83%E3%81%B9%E3%82%8A%E3%82%AB%E3%83%AB%E3%83%86/id1843007006", icon: ApplePodcastIcon },
  { name: "Amazon Music", href: "https://music.amazon.com/podcasts/6d257495-6674-4592-9db6-55788db358c0/", icon: Music },
  { name: "Castbox", href: "https://castbox.fm/vh/6768489", icon: Podcast },
  { name: "Goodpods", href: "https://goodpods.com/ja/profile/pitonne-130086", icon: Podcast },
]

export function Footer() {
  return (
    <footer className="bg-[#2d2d2d] text-white">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        {/* Google Maps Embed */}
        <div className="mb-10">
          <div className="rounded-lg overflow-hidden border border-white/10">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.7479754683745!2d139.72219!3d35.6565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xab0e10b103ba02d7%3A0x97a0030e23484885!2sPitonne%20Stem%20Cell%20%26%20IV%20Therapy!5e0!3m2!1sen!2sjp!4v1234567890"
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Pitonne Stem Cell & IV Therapy Location"
              className="grayscale hover:grayscale-0 transition-all duration-300"
            />
          </div>
          <a 
            href="https://maps.app.goo.gl/WjMLKSkNw7t2oc5T6"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-sm text-[#4AA69D] hover:text-[#5bc4ba] transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span>Get Directions</span>
          </a>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <img 
              src="/images/pitt-wordlogo-white-32.svg" 
              alt="Pitonne" 
              className="h-8 w-auto mb-4"
            />
            <p className="text-sm text-white/80 mb-2">Pitonne Stem Cell & IV Therapy</p>
            <address className="text-sm text-white/70 not-italic space-y-1">
              <p>{businessInfo.addressLine1}</p>
              <p>{businessInfo.addressLine2}</p>
              <p className="pt-2">
                <a href={`tel:${businessInfo.phone}`} className="hover:text-white transition-colors">
                  {businessInfo.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${businessInfo.email}`} className="hover:text-white transition-colors">
                  {businessInfo.email}
                </a>
              </p>
            </address>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
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
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Open Hours</h3>
            <ul className="space-y-1.5">
              {businessInfo.hours.map((item) => (
                <li key={item.day} className="grid grid-cols-[5.75rem_auto] gap-x-3 text-sm">
                  <span className="text-white/70">{item.day}</span>
                  <span className={item.hours === "Closed" ? "text-white/70" : "text-white/90"}>
                    {item.hours}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas Served */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Areas Served</h3>
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

        {/* Social & Podcast Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          {/* Social Links Row */}
          <div className="mb-6">
            <p className="text-xs text-white/70 uppercase tracking-wider mb-3">Follow Us</p>
            <div className="flex flex-wrap items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-[#4AA69D] transition-colors p-2 rounded-lg hover:bg-white/5"
                  aria-label={social.name}
                  title={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Podcast Links Row */}
          <div className="mb-6">
            <p className="text-xs text-white/70 uppercase tracking-wider mb-3">Listen to Our Podcast</p>
            <div className="flex flex-wrap items-center gap-3">
              {podcastLinks.map((podcast) => (
                <a
                  key={podcast.name}
                  href={podcast.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-[#4AA69D] transition-colors p-2 rounded-lg hover:bg-white/5 flex items-center gap-2"
                  aria-label={podcast.name}
                  title={podcast.name}
                >
                  <podcast.icon className="h-4 w-4" />
                  <span className="text-xs">{podcast.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/70">
              &copy; {new Date().getFullYear()} Pitonne Stem Cell & IV Therapy. All rights reserved.
            </p>
            <p className="text-xs text-white/70">
              Nishi Azabu, Minato-ku, Tokyo, Japan
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
