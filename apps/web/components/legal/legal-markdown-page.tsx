import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { PageHero } from "@/components/shared/page-hero"
import type { MarkdownPage } from "@/lib/data/pages"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { localizedRoute } from "@/lib/data/routes"

export function LegalMarkdownPage({
  page,
  canonicalTitle,
  description,
  locale = "en" as Locale,
}: {
  page: MarkdownPage
  canonicalTitle: string
  description?: string
  locale?: Locale
}) {
  const dict = getDictionary(locale)

  return (
    <div className="bg-[#faf9f7]">
      <PageHero
        breadcrumbs={[
          { label: dict.nav.home, href: localizedRoute("/", locale) },
          { label: dict.legal.legal, href: localizedRoute("/legal/", locale) },
          { label: canonicalTitle },
        ]}
        title={canonicalTitle}
        description={description}
        size="compact"
      />

      <section className="py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="blog-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.content}</ReactMarkdown>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <Link href={localizedRoute("/legal/", locale)} className="text-[#7A8F87] hover:underline">
            &larr; {dict.legal.backToLegal}
          </Link>
        </div>
      </section>
    </div>
  )
}
