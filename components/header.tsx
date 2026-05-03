"use client"

import Link from "next/link"
import { useState } from "react"
import { Phone, Menu, X, ChevronDown } from "lucide-react"

const servicesMenu = {
  categories: [
    {
      name: "IV Therapy",
      href: "/services/iv-therapy",
      items: [
        { name: "Exosome IV Drip", href: "/services/exosome-iv-drip" },
        { name: "Hangover IV Drip", href: "/services/hangover-iv-drip" },
        { name: "Immune Boost IV", href: "/services/immune-boost-iv-therapy" },
        { name: "IV Vitamin Therapy", href: "/services/iv-vitamin-therapy" },
        { name: "Energy & Fatigue Recovery", href: "/services/energy-fatigue-recovery-iv" },
        { name: "Skin Brightening IV", href: "/services/skin-brightening-iv-drip" },
      ]
    },
    {
      name: "Stem Cell Therapy",
      href: "/services/stem-cell-therapy",
      items: [
        { name: "Stem Cell Nasal Spray", href: "/services/stem-cell-nasal-spray" },
      ]
    },
    {
      name: "Medications",
      href: "/services/medications",
      items: [
        { name: "ED Medication", href: "/services/ed-medication" },
      ]
    },
  ]
}

const areasMenu = {
  wards: [
    {
      name: "Minato",
      nameJa: "港区",
      href: "/areas-served/minato",
      areas: [
        { name: "Roppongi", href: "/areas-served/minato/roppongi" },
        { name: "Azabu Juban", href: "/areas-served/minato/azabu-juban" },
        { name: "Hiroo", href: "/areas-served/minato/hiroo" },
        { name: "Akasaka", href: "/areas-served/minato/akasaka" },
        { name: "Toranomon", href: "/areas-served/minato/toranomon" },
        { name: "Shimbashi", href: "/areas-served/minato/shimbashi" },
      ]
    },
    {
      name: "Shibuya",
      nameJa: "渋谷区",
      href: "/areas-served/shibuya",
      areas: [
        { name: "Ebisu", href: "/areas-served/shibuya/ebisu" },
        { name: "Daikanyama", href: "/areas-served/shibuya/daikanyama" },
        { name: "Omotesando", href: "/areas-served/shibuya/omotesando" },
        { name: "Harajuku", href: "/areas-served/shibuya/harajuku" },
        { name: "Yoyogi", href: "/areas-served/shibuya/yoyogi" },
      ]
    },
    {
      name: "Chuo",
      nameJa: "中央区",
      href: "/areas-served/chuo",
      areas: [
        { name: "Ginza", href: "/areas-served/chuo/ginza" },
        { name: "Nihonbashi", href: "/areas-served/chuo/nihonbashi" },
        { name: "Tsukiji", href: "/areas-served/chuo/tsukiji" },
      ]
    },
    {
      name: "Chiyoda",
      nameJa: "千代田区",
      href: "/areas-served/chiyoda",
      areas: [
        { name: "Tokyo Station", href: "/areas-served/chiyoda/tokyo-station" },
        { name: "Otemachi", href: "/areas-served/chiyoda/otemachi" },
        { name: "Akihabara", href: "/areas-served/chiyoda/akihabara" },
      ]
    },
    {
      name: "Shinagawa",
      nameJa: "品川区",
      href: "/areas-served/shinagawa",
      areas: [
        { name: "Gotanda", href: "/areas-served/shinagawa/gotanda" },
        { name: "Takanawa", href: "/areas-served/shinagawa/takanawa" },
        { name: "Osaki", href: "/areas-served/shinagawa/osaki" },
      ]
    },
  ]
}

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services", hasDropdown: "services" },
  { name: "Areas Served", href: "/areas-served", hasDropdown: "areas" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4 lg:px-8">
{/* Logo */}
  <Link href="/" className="flex items-center">
    <img 
      src="/images/pitt-wordlogo-blk-32.svg" 
      alt="Pitonne Stem Cell & IV Therapy" 
      className="h-8 w-auto"
    />
  </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navigation.map((item) => (
            <div 
              key={item.name} 
              className="relative"
              onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.hasDropdown)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link 
                href={item.href}
                className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-[#4AA69D] transition-colors"
              >
                {item.name}
                {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
              </Link>

              {/* Services Mega Menu */}
              {item.hasDropdown === "services" && activeDropdown === "services" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[600px]">
                  <div className="bg-white rounded-lg shadow-xl border border-border p-6">
                  <div className="grid grid-cols-3 gap-6">
                    {servicesMenu.categories.map((category) => (
                      <div key={category.name}>
                        <Link 
                          href={category.href}
                          className="text-sm font-semibold text-foreground hover:text-[#4AA69D] transition-colors"
                        >
                          {category.name}
                        </Link>
                        <ul className="mt-3 space-y-2">
                          {category.items.map((service) => (
                            <li key={service.name}>
                              <Link
                                href={service.href}
                                className="text-sm text-muted-foreground hover:text-[#4AA69D] transition-colors"
                              >
                                {service.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-border">
                      <Link 
                        href="/services"
                        className="text-sm font-medium text-[#4AA69D] hover:underline"
                      >
                        View All Services &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Areas Mega Menu */}
              {item.hasDropdown === "areas" && activeDropdown === "areas" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[700px]">
                  <div className="bg-white rounded-lg shadow-xl border border-border p-6">
                  <div className="grid grid-cols-5 gap-4">
                    {areasMenu.wards.map((ward) => (
                      <div key={ward.name}>
                        <Link 
                          href={ward.href}
                          className="text-sm font-semibold text-foreground hover:text-[#4AA69D] transition-colors"
                        >
                          {ward.name}
                          <span className="block text-xs text-muted-foreground font-normal">{ward.nameJa}</span>
                        </Link>
                        <ul className="mt-3 space-y-1.5">
                          {ward.areas.map((area) => (
                            <li key={area.name}>
                              <Link
                                href={area.href}
                                className="text-xs text-muted-foreground hover:text-[#4AA69D] transition-colors"
                              >
                                {area.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-border">
                      <Link 
                        href="/areas-served"
                        className="text-sm font-medium text-[#4AA69D] hover:underline"
                      >
                        View All Areas &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Phone & CTA */}
        <div className="hidden lg:flex items-center gap-6">
          <a href="tel:070-2194-0199" className="flex items-center gap-2 text-sm font-medium">
            <Phone className="h-4 w-4" />
            070-2194-0199
          </a>
          <Link 
            href="/contact"
            className="bg-[#4AA69D] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-[#3d8a83] transition-colors"
          >
            Contact Us
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Toggle menu</span>
          {mobileMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.hasDropdown ? (
                  <div>
                    <button
                      className="flex items-center justify-between w-full py-2 text-base font-medium text-foreground"
                      onClick={() => setMobileExpandedSection(
                        mobileExpandedSection === item.hasDropdown ? null : item.hasDropdown!
                      )}
                    >
                      {item.name}
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform ${
                          mobileExpandedSection === item.hasDropdown ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    
                    {/* Mobile Services Dropdown */}
                    {item.hasDropdown === "services" && mobileExpandedSection === "services" && (
                      <div className="pl-4 pb-2 space-y-3">
                        {servicesMenu.categories.map((category) => (
                          <div key={category.name}>
                            <Link
                              href={category.href}
                              className="block py-1 text-sm font-medium text-foreground"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {category.name}
                            </Link>
                            <div className="pl-3 space-y-1">
                              {category.items.map((service) => (
                                <Link
                                  key={service.name}
                                  href={service.href}
                                  className="block py-1 text-sm text-muted-foreground"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {service.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mobile Areas Dropdown */}
                    {item.hasDropdown === "areas" && mobileExpandedSection === "areas" && (
                      <div className="pl-4 pb-2 space-y-3">
                        {areasMenu.wards.map((ward) => (
                          <div key={ward.name}>
                            <Link
                              href={ward.href}
                              className="block py-1 text-sm font-medium text-foreground"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {ward.name} <span className="text-muted-foreground font-normal">{ward.nameJa}</span>
                            </Link>
                            <div className="pl-3 space-y-1">
                              {ward.areas.map((area) => (
                                <Link
                                  key={area.name}
                                  href={area.href}
                                  className="block py-1 text-sm text-muted-foreground"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {area.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="block py-2 text-base font-medium text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            
            <div className="pt-4 border-t border-border">
              <a href="tel:070-2194-0199" className="flex items-center gap-2 text-sm font-medium mb-3">
                <Phone className="h-4 w-4" />
                070-2194-0199
              </a>
              <Link 
                href="/contact"
                className="block w-full bg-[#4AA69D] text-white text-center px-5 py-2.5 rounded-md text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
