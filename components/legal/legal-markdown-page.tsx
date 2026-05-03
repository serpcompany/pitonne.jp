import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { PageHero } from "@/components/shared/page-hero"
import type { MarkdownPage } from "@/lib/data/pages"

export function LegalMarkdownPage({
  page,
  canonicalTitle,
  description,
}: {
  page: MarkdownPage
  canonicalTitle: string
  description?: string
}) {
  return (
    <div className="bg-[#faf9f7]">
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Legal", href: "/legal/" },
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
          <Link href="/legal/" className="text-[#2D766F] hover:underline">
            &larr; Back to Legal
          </Link>
        </div>
      </section>
    </div>
  )
}
