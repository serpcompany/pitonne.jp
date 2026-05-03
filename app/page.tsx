"use client"

import Image from "next/image"

export default function DesignDocumentation() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-[#2d2d2d] text-white">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div>
            <h1 className="text-2xl font-bold">Pitonne Design Documentation</h1>
            <p className="text-sm text-white/70">Website Migration Guide: WordPress to Next.js</p>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://pitonne.jp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="rounded-md border border-white/30 px-4 py-2 text-sm hover:bg-white/10 transition-colors"
            >
              View Live Site
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Introduction */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold font-serif">Design System Overview</h2>
          <p className="mb-6 text-lg text-muted-foreground">
            This documentation captures the complete design system from pitonne.jp for migration to Figma and rebuilding in Next.js.
          </p>
          
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-3xl font-bold text-[#4AA69D]">8</p>
              <p className="text-sm text-muted-foreground">Pages Captured</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-3xl font-bold text-[#4AA69D]">8</p>
              <p className="text-sm text-muted-foreground">Brand Colors</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-3xl font-bold text-[#4AA69D]">2</p>
              <p className="text-sm text-muted-foreground">Font Families</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-3xl font-bold text-[#4AA69D]">28+</p>
              <p className="text-sm text-muted-foreground">Tokyo Areas</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-xl font-semibold">Brand Summary</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <ul className="space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Business:</strong> Pitonne Stem Cell & IV Therapy</li>
                <li><strong className="text-foreground">Location:</strong> Nishi Azabu, Tokyo, Japan</li>
                <li><strong className="text-foreground">Phone:</strong> 070-2194-0199</li>
                <li><strong className="text-foreground">Address:</strong> 106-0031 Tokyo, Minato City, Nishiazabu, 3 Chome-17-22 1F</li>
              </ul>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Target Audience:</strong> Busy professionals, travelers, health-conscious clients</li>
                <li><strong className="text-foreground">Brand Tone:</strong> Premium, clinical yet warm, discreet, professional</li>
                <li><strong className="text-foreground">Services:</strong> IV Therapy, Stem Cell Therapy, Medications, Wellness Consultations</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold font-serif">Color Palette</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ColorSwatch name="Peach/Cream" hex="#F5E6DA" usage="Hero backgrounds, section accents" />
            <ColorSwatch name="Soft Peach" hex="#E8D4C8" usage="Card backgrounds, hover states" />
            <ColorSwatch name="Muted Teal" hex="#89A8A0" usage="Decorative leaf illustrations" />
            <ColorSwatch name="Dark Charcoal" hex="#2D2D2D" usage="Primary text, headings" />
            <ColorSwatch name="Warm Brown" hex="#8B7355" usage="Footer background, CTA buttons" />
            <ColorSwatch name="Pure White" hex="#FFFFFF" usage="Page backgrounds, cards" />
            <ColorSwatch name="Light Gray" hex="#F8F8F8" usage="Subtle section backgrounds" />
            <ColorSwatch name="Teal Accent" hex="#4AA69D" usage="Primary CTA button" />
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold font-serif">Typography</h2>
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-xl font-semibold">Font Families</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Headings & Display</p>
                  <p className="font-serif text-2xl">Playfair Display (or similar serif)</p>
                  <p className="text-sm text-muted-foreground">Used for: Main headings, section titles, emphasis words like "Clinical Care" in italics</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Body & UI</p>
                  <p className="text-2xl">Inter / System Sans-Serif</p>
                  <p className="text-sm text-muted-foreground">Used for: Body text, navigation, buttons, labels</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-xl font-semibold">Type Scale</h3>
              <div className="space-y-4">
                <TypeSpec name="Hero Title" size="48-64px" weight="400" example="Pitonne Stem Cell & IV Therapy" />
                <TypeSpec name="Section Label" size="12-14px" weight="500" example="WHO WE ARE" tracking="wide" />
                <TypeSpec name="Section Heading" size="32-40px" weight="400" example="Concierge Wellness Support" />
                <TypeSpec name="Card Title" size="20-24px" weight="500" example="IV Therapy" />
                <TypeSpec name="Body Text" size="16px" weight="400" example="Pitonne is a concierge wellness service..." />
                <TypeSpec name="Small/Caption" size="14px" weight="400" example="April 25, 2026" />
              </div>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold font-serif">UI Components</h2>
          
          {/* Navigation */}
          <div className="mb-8 rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-xl font-semibold">Navigation Bar</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-white p-4">
                <div className="flex items-center gap-8">
                  <span className="font-serif text-xl">Pitonne</span>
                  <nav className="flex gap-6 text-sm">
                    <span>Home</span>
                    <span>About</span>
                    <span>Services</span>
                    <span>Areas Served</span>
                    <span>Blog</span>
                    <span>Contact</span>
                  </nav>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">070-2194-0199</span>
                  <button className="rounded-md bg-[#4AA69D] px-4 py-2 text-sm text-white">Contact Us</button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Sticky header with logo, navigation links, phone number, and primary CTA button
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="mb-8 rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-xl font-semibold">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <button className="rounded-md bg-[#4AA69D] px-6 py-3 text-white">Primary CTA (Teal)</button>
              <button className="rounded-md border border-[#2D2D2D] bg-[#2D2D2D] px-6 py-3 text-white">Secondary (Dark)</button>
              <button className="rounded-md border border-[#2D2D2D] bg-transparent px-6 py-3 text-[#2D2D2D]">Outlined</button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Rounded corners (8px), consistent padding, clear hierarchy
            </p>
          </div>

          {/* Service Cards */}
          <div className="mb-8 rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-xl font-semibold">Service Cards</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border/50 bg-white p-6 transition-shadow hover:shadow-lg">
                <h4 className="mb-2 font-serif text-lg">IV Therapy</h4>
                <p className="text-sm text-muted-foreground">Targeted hydration and nutrient support designed around recovery, energy, immunity, and skin wellness.</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-white p-6 transition-shadow hover:shadow-lg">
                <h4 className="mb-2 font-serif text-lg">Stem Cell Therapy</h4>
                <p className="text-sm text-muted-foreground">Regenerative wellness support focused on practical delivery options and individualized care planning.</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Cards with subtle border, white background, hover shadow effect. Image cards on services page include photo overlays.
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="mb-8 rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-xl font-semibold">Decorative Elements</h3>
            <div className="space-y-4">
              <div className="flex gap-8">
                <div className="h-24 w-24 rounded-full bg-[#89A8A0]/30" />
                <div className="h-24 w-32 rounded-full bg-[#89A8A0]/20" />
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Leaf Illustrations:</strong> Muted teal botanical/leaf shapes appear as decorative accents throughout the site. They are positioned in corners and alongside headings.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Blob Shapes:</strong> Soft, organic blob shapes in peach/cream colors appear in hero sections and as background accents.
              </p>
            </div>
          </div>
        </section>

        {/* Page Screenshots */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold font-serif">Page Screenshots</h2>
          <p className="mb-6 text-muted-foreground">Full-page screenshots captured from the live site for reference:</p>
          
          <div className="grid gap-8">
            <PagePreview 
              title="Homepage" 
              image="/screenshots/01-homepage.png" 
              description="Hero section with title and CTA, Who We Are section, Services overview grid, Blog posts preview, Footer"
              url="/"
            />
            <PagePreview 
              title="About Page" 
              image="/screenshots/02-about.png" 
              description="About header, Why We Exist section with clinic photo, How We Support You section, Team member cards"
              url="/about"
            />
            <PagePreview 
              title="Services Page" 
              image="/screenshots/03-services.png" 
              description="Services overview, IV Therapy cards with images, Stem Cell Therapy section, Medications section"
              url="/services"
            />
            <PagePreview 
              title="Areas Served" 
              image="/screenshots/04-areas-served.png" 
              description="Grid of Tokyo areas/neighborhoods served with location pins"
              url="/areas-served"
            />
            <PagePreview 
              title="Blog Page" 
              image="/screenshots/05-blog.png" 
              description="Blog listing with article titles, dates, and simple list layout"
              url="/blog"
            />
            <PagePreview 
              title="IV Therapy Service" 
              image="/screenshots/07-iv-therapy.png" 
              description="IV Therapy service detail page with treatment cards: Energy & Fatigue Recovery, Exosome IV Drip, Hangover IV, Immune Boost, IV Vitamin, Skin Brightening"
              url="/services/iv-therapy"
            />
            <PagePreview 
              title="Stem Cell Therapy" 
              image="/screenshots/08-stem-cell-therapy.png" 
              description="Stem Cell Therapy service page featuring Stem Cell Nasal Spray treatment"
              url="/services/stem-cell-therapy"
            />
            <PagePreview 
              title="Area Detail Page (Roppongi)" 
              image="/screenshots/12-roppongi.png" 
              description="Individual area page with services available, FAQs, and local access information"
              url="/areas-served/minato/roppongi"
            />
          </div>
        </section>

        {/* Site Structure */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold font-serif">Site Structure</h2>
          <div className="rounded-lg border border-border bg-card p-6">
            <pre className="overflow-x-auto text-sm font-mono bg-muted/50 p-4 rounded-lg">
{`pitonne.jp/
├── / (Homepage)
│
├── /about (About Pitonne)
│
├── /services (All Services Overview)
│   ├── /services/iv-therapy (IV Therapy category)
│   │   ├── Exosome IV Drip
│   │   ├── Hangover IV Drip
│   │   ├── Energy & Fatigue Recovery IV
│   │   ├── Skin Brightening IV Drip
│   │   ├── Immune Boost IV Therapy
│   │   └── IV Vitamin Therapy
│   ├── /services/stem-cell-therapy (Stem Cell category)
│   │   └── Stem Cell Nasal Spray
│   └── /services/medications (Medications category)
│       └── ED Medication
│
├── /areas-served (Tokyo neighborhoods grid - 28+ areas)
│   └── /areas-served/minato/[area] (Individual area pages)
│       ├── /roppongi, /azabu-juban, /hiroo, /akasaka
│       ├── /shibuya, /ebisu, /ginza, /shinagawa
│       └── ... and many more
│
├── /blog (Blog listing)
│   └── Individual blog posts (article pages)
│
├── /contact (External form → ssv.onemorehand.jp)
│
├── /privacy-policy
├── /terms-of-use
└── /medical-disclaimer`}
            </pre>
          </div>
        </section>

        {/* Footer Structure */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold font-serif">Footer Structure</h2>
          <div className="rounded-lg bg-[#8B7355] p-8 text-white">
            <div className="grid gap-8 md:grid-cols-4">
              <div>
                <h4 className="mb-4 font-serif text-lg">Pitonne</h4>
                <p className="text-sm opacity-80">Pitonne Stem Cell & IV Therapy</p>
                <p className="text-sm opacity-80">106-0031 Tokyo, Minato City, Nishiazabu,</p>
                <p className="text-sm opacity-80">3 Chome-17-22 1F</p>
                <p className="text-sm opacity-80">070-2194-0199</p>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-semibold">Quick Links</h4>
                <ul className="space-y-2 text-sm opacity-80">
                  <li>Home</li>
                  <li>About</li>
                  <li>Services</li>
                  <li>Blog</li>
                  <li>Contact</li>
                  <li>Privacy Policy</li>
                  <li>Terms of Use</li>
                  <li>Medical Disclaimer</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-semibold">Open Hours</h4>
                <ul className="space-y-1 text-sm opacity-80">
                  <li>Monday: 10:00 - 19:00</li>
                  <li>Tuesday: 10:00 - 19:00</li>
                  <li>Wednesday: Closed</li>
                  <li>Thursday: 10:00 - 19:00</li>
                  <li>Friday: 10:00 - 19:00</li>
                  <li>Saturday: Closed</li>
                  <li>Sunday: Closed</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-semibold">Areas Served</h4>
                <ul className="space-y-1 text-sm opacity-80">
                  <li>View All Areas</li>
                  <li>Roppongi</li>
                  <li>Azabu Juban</li>
                  <li>Minato / Hiroo</li>
                  <li>Akasaka</li>
                  <li>Shibuya</li>
                  <li>Ebisu</li>
                  <li>Ginza</li>
                  <li>Shinagawa</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-white/20 pt-6">
              <div className="flex gap-4">
                <span className="text-sm opacity-60">Instagram</span>
                <span className="text-sm opacity-60">X</span>
                <span className="text-sm opacity-60">Facebook</span>
                <span className="text-sm opacity-60">Threads</span>
                <span className="text-sm opacity-60">LinkedIn</span>
                <span className="text-sm opacity-60">TikTok</span>
                <span className="text-sm opacity-60">YouTube</span>
              </div>
              <span className="text-sm opacity-60">© Pitonne</span>
            </div>
          </div>
        </section>

        {/* Figma Export Notes */}
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold font-serif">Figma Design File Notes</h2>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-xl font-semibold">Recommended Figma Structure</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li><strong>Page 1 - Design System:</strong> Colors, Typography, Components, Icons</li>
              <li><strong>Page 2 - Homepage:</strong> Desktop (1440px), Tablet (768px), Mobile (375px)</li>
              <li><strong>Page 3 - About:</strong> All breakpoints</li>
              <li><strong>Page 4 - Services:</strong> All breakpoints</li>
              <li><strong>Page 5 - Areas Served:</strong> All breakpoints</li>
              <li><strong>Page 6 - Blog:</strong> Listing + Article template</li>
              <li><strong>Page 7 - Contact:</strong> Custom form design (replace external form)</li>
            </ul>
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="mb-6 text-3xl font-bold font-serif">Next Steps for Migration</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-xl font-semibold">For Figma</h3>
              <ol className="list-decimal space-y-2 pl-4 text-muted-foreground">
                <li>Create design tokens (colors, spacing, typography)</li>
                <li>Build component library (buttons, cards, navigation)</li>
                <li>Design each page using screenshots as reference</li>
                <li>Add responsive variants for each page</li>
                <li>Create a custom contact form design</li>
              </ol>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-xl font-semibold">For Next.js</h3>
              <ol className="list-decimal space-y-2 pl-4 text-muted-foreground">
                <li>Set up Next.js 16 with App Router</li>
                <li>Configure Tailwind with custom theme colors</li>
                <li>Install Playfair Display + Inter from Google Fonts</li>
                <li>Build reusable components (Header, Footer, Cards)</li>
                <li>Create each page route</li>
                <li>Add CMS integration for blog posts</li>
                <li>Build native contact form with API route</li>
              </ol>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function ColorSwatch({ name, hex, usage }: { name: string; hex: string; usage: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 h-16 w-full rounded-md" style={{ backgroundColor: hex }} />
      <p className="font-medium">{name}</p>
      <p className="font-mono text-sm text-muted-foreground">{hex}</p>
      <p className="mt-2 text-sm text-muted-foreground">{usage}</p>
    </div>
  )
}

function TypeSpec({ name, size, weight, example, tracking }: { name: string; size: string; weight: string; example: string; tracking?: string }) {
  return (
    <div className="border-b border-border/50 pb-4">
      <div className="flex items-baseline justify-between">
        <span className="font-medium">{name}</span>
        <span className="text-sm text-muted-foreground">{size} / {weight} {tracking && `/ ${tracking}`}</span>
      </div>
      <p className="mt-1 text-muted-foreground">{example}</p>
    </div>
  )
}

function PagePreview({ title, image, description, url }: { title: string; image: string; description: string; url?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        {url && (
          <code className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
            {url}
          </code>
        )}
      </div>
      <div className="mb-4 overflow-hidden rounded-lg border border-border">
        <Image 
          src={image} 
          alt={`${title} screenshot`} 
          width={1200} 
          height={800} 
          className="w-full object-cover object-top"
          style={{ maxHeight: '500px' }}
        />
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
