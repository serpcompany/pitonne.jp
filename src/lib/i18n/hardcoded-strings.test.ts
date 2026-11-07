import { describe, expect, it } from 'vitest'
import {
  hardcodedTexts,
  isScanned,
  newScan,
  scanFiles,
  siteSourceFiles
} from '@/test/hardcoded-strings'

describe('user-visible strings', () => {
  it('flags hardcoded JSX text in any script, including screen-reader-only text', () => {
    expect(
      hardcodedTexts(`export function A() {
        return (
          <section>
            <h2>Book a consultation</h2>
            <p>ご予約はこちら</p>
            <span className="sr-only">Close</span>
            <Card>
              <b>Hours</b>
            </Card>
            <p>/ month</p>
          </section>
        )
      }`)
    ).toEqual(['Book a consultation', 'ご予約はこちら', 'Close', 'Hours', '/ month'])
  })

  it('flags literals rendered as children, including conditional branches and template literals', () => {
    expect(
      hardcodedTexts(`export function A({ locale, city }) {
        return (
          <p>
            {'Call us'}
            {locale === 'ja' ? 'はい' : 'Yes'}
            {\`Welcome to \${city}\`}
            {open && 'Menu'}
            {name ?? 'Guest'}
            {format('Starting at', price)}
          </p>
        )
      }`)
    ).toEqual([
      "'Call us'",
      "'はい'",
      "'Yes'",
      `\`Welcome to \${city}\``,
      "'Menu'",
      "'Guest'",
      "'Starting at'"
    ])
  })

  it('flags literals in user-visible attributes and in text props of components', () => {
    expect(
      hardcodedTexts(`export function A({ locale, area }) {
        return (
          <div>
            <img src="/a.jpg" alt="Clinic reception" />
            <iframe src={url} title={\`\${area}, Tokyo map\`} />
            <button type="button" aria-label={locale === 'ja' ? '閉じる' : 'Close'} />
            <input placeholder="Email" name="email" />
            <PageHero eyebrow="Our team" title={locale === 'ja' ? title : 'Areas'} />
            <Breadcrumbs items={[{ label: 'Home', href: '/' }]} />
            <Hero heading="Results" />
          </div>
        )
      }`)
    ).toEqual([
      '"Clinic reception"',
      `\`\${area}, Tokyo map\``,
      "'閉じる'",
      "'Close'",
      '"Email"',
      '"Our team"',
      "'Areas'",
      "'Home'",
      '"Results"'
    ])
  })

  it('follows local constants, data lists and helper functions into what is rendered', () => {
    expect(
      hardcodedTexts(`const heading = 'Our services'
      const areas = [{ name: locale === 'ja' ? '六本木' : 'Roppongi', href: '/areas/roppongi/' }]
      const labels = { en: 'Open', ja: '営業中' }
      function faqs(area) {
        return [{ question: \`What is available in \${area}?\`, answer: dict.answer }]
      }
      export function A({ area, locale, title = 'Welcome' }) {
        const items = faqs(area)
        const [status] = useState('Loading')
        return (
          <div>
            <h2>{heading}</h2>
            <ul>{areas.map(item => <li key={item.href}>{item.name}</li>)}</ul>
            {items.map(item => <p key={item.question}>{item.question}</p>)}
            <span>{labels[locale]}</span>
            <h3>{title}</h3>
            <p>{status}</p>
          </div>
        )
      }`)
    ).toEqual([
      "'Our services'",
      "'六本木'",
      "'Roppongi'",
      "'Open'",
      "'営業中'",
      `\`What is available in \${area}?\``,
      "'Welcome'",
      "'Loading'"
    ])
  })

  it('follows imports from other files under src/app and src/components', () => {
    const scan = newScan({
      'src/components/menu/labels.ts': `export const menuLabels = ['Treatments', 'Prices']
        export default function caption() { return 'Our menu' }`,
      'src/components/menu/menu.tsx': `import caption, { menuLabels as labels } from './labels'
        import { SITE_NAME } from '@/lib/seo'
        export function Menu() {
          return <nav>{labels.map(label => <a key={label}>{label}</a>)}<p>{caption()}</p><h2>{SITE_NAME}</h2></nav>
        }`
    })

    expect(scanFiles(scan, ['src/components/menu/menu.tsx'])).toEqual([
      { file: 'src/components/menu/labels.ts', line: 1, text: "'Treatments'" },
      { file: 'src/components/menu/labels.ts', line: 1, text: "'Prices'" },
      { file: 'src/components/menu/labels.ts', line: 2, text: "'Our menu'" }
    ])
  })

  it('follows array holes, switch cases, quoted and computed keys, and overloaded helpers', () => {
    expect(
      hardcodedTexts(`function label(kind: 'short'): string
      function label(kind: string) {
        return 'Opening hours'
      }
      function status(kind) {
        switch (kind) {
          case 'open':
            const open = 'Open now'
            return open
          default:
            const closed = 'Closed today'
            return closed
        }
      }
      export function A({ kind, key }) {
        const [, saved] = useState('Saved')
        const links = [{ 'title': 'Home page' }, { [key]: 'Our team' }]
        return (
          <div>
            <p>{label('short')}</p>
            <p>{status(kind)}</p>
            <p>{saved}</p>
            {links.map(link => <a {...link} />)}
          </div>
        )
      }`)
    ).toEqual([
      "'Opening hours'",
      "'Open now'",
      "'Closed today'",
      "'Saved'",
      "'Home page'",
      "'Our team'"
    ])
  })

  it('shows a long finding cut to 120 characters', () => {
    const sentence = 'Our nurses visit hotels, homes and offices across central Tokyo every day. '
    const [finding] = hardcodedTexts(`export function A() {
      return <p>{'${sentence.repeat(3)}'}</p>
    }`)

    expect(finding).toHaveLength(120)
    expect(finding).toBe(`'${sentence.repeat(2).slice(0, 116)}...`)
  })

  it('reads text hidden only by aria-hidden={true}, and follows a default export and overloaded exports', () => {
    const scan = newScan({
      'src/components/menu/tagline.ts': `const tagline = 'Book a visit'
        export default tagline
        export let note
        export function caption(kind: 'short'): string
        export function caption(kind: string) { return 'Our menu' }`,
      'src/components/menu/menu.tsx': `import tagline, { caption, note } from './tagline'
        export function Menu() {
          return (
            <nav>
              <p>{tagline}</p>
              <p>{note}</p>
              <p>{caption('short')}</p>
              <span aria-hidden={true}>Decorative arrow</span>
              <span aria-hidden={false}>Visible label</span>
            </nav>
          )
        }`
    })

    expect(scanFiles(scan, ['src/components/menu/menu.tsx']).map(finding => finding.text)).toEqual([
      'Visible label',
      "'Book a visit'",
      "'Our menu'"
    ])
  })

  it('flags literal titles, descriptions and Open Graph text in metadata', () => {
    expect(
      hardcodedTexts(`export const metadata = {
        title: 'Pitonne CMS',
        openGraph: { description: 'About the clinic', type: 'website', images: [{ url: '/a.jpg', alt: 'Clinic' }] }
      }
      export async function generateMetadata({ params }) {
        const { locale } = await params
        const title = locale === 'ja' ? '東京のエリア' : dict.areas.metaTitle
        return {
          title: { default: title, template: '%s | Pitonne' },
          description: locale === 'ja' ? dict.areas.metaDescription : 'Areas we serve',
          ...pageSocialMetadata({ title, description: 'Social text', path: '/areas/' }),
          twitter: { card: 'summary_large_image', title: \`\${title} in Tokyo\` }
        }
      }`)
    ).toEqual([
      "'Pitonne CMS'",
      "'About the clinic'",
      "'Clinic'",
      "'東京のエリア'",
      "'Areas we serve'",
      "'Social text'",
      `\`\${title} in Tokyo\``
    ])
  })

  it('leaves dictionary values, brand names, technical values and aria-hidden content alone', () => {
    expect(
      hardcodedTexts(`export function A({ locale, dict, post, item }) {
        const dateLocale = locale === 'ja' ? 'ja-JP' : 'en-US'
        const isClosed = item.hours === 'Closed' || item.hours === '休診'
        return (
          <section id="more-videos" className="flex items-center gap-2" data-testid="hero section">
            <h1>{dict.nav.home}</h1>
            <img src="/logo.svg" alt="Pitonne" loading="lazy" sizes="(min-width: 768px) 50vw, 100vw" />
            <a href="https://serp.co" target="_blank" rel="noopener noreferrer">SERP</a>
            <span aria-hidden="true">&rarr; Next</span>
            <svg aria-hidden><title>Arrow icon</title></svg>
            <Icon aria-hidden="true" label="Decorative" />
            <p>&copy; {new Date().getFullYear()} {dict.footer.businessName}.{' '}</p>
            <p className={isClosed ? 'text-white/70' : 'text-white/90'}>{isClosed ? dict.footer.closed : item.hours}</p>
            <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString(dateLocale, { month: 'long' })}</time>
            <Button variant="outline" size="lg" asChild locale="ja" iconClassName="h-4 w-4" />
            <iframe src={\`https://www.google.com/maps?q=\${q}&output=embed\`} allow="autoplay; encrypted-media" referrerPolicy="no-referrer-when-downgrade" title={dict.areas.mapOf} />
            <Link href={localizedRoute(\`/areas-served/\${ward}/\`, locale)} key={\`\${item.label}-1\`}>{item.label}</Link>
            <JsonLd data={serviceJsonLd(post, locale)} />
            <a href="tel:03-6821-8285">{'https://pitonne.jp/contact/'}</a>
            <script>{'window.dataLayer = window.dataLayer || []'}</script>
            <time>{String(new Date)}</time>
          </section>
        )
      }
      export const metadata = { title: \`%s | \${SITE_NAME}\`, openGraph: { locale: 'ja_JP', type: 'article' }, robots: { index: false } }`)
    ).toEqual([])
  })

  it('scans the site in src/app and src/components, not the CMS admin', () => {
    expect(isScanned('src/app/layout.tsx')).toBe(true)
    expect(isScanned('src/app/(en)/about/page.tsx')).toBe(true)
    expect(isScanned('src/components/ui/dialog.tsx')).toBe(true)
    expect(isScanned('src/app/keystatic/layout.tsx')).toBe(false)
    expect(isScanned('src/app/api/keystatic/[...params]/route.keystatic.ts')).toBe(false)
    expect(isScanned('src/lib/seo.ts')).toBe(false)
  })

  it('come from the dictionary in the site pages and components', () => {
    const findings = scanFiles(newScan(), siteSourceFiles()).map(
      finding => `${finding.file}:${finding.line} ${finding.text}`
    )

    expect(findings).toEqual([])
  })
})
