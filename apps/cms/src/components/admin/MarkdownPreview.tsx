"use client"

import { useField } from "@payloadcms/ui"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export function MarkdownPreview() {
  const { value } = useField<string | null | undefined>({ path: "body" })
  const markdown = typeof value === "string" ? value.trim() : ""

  return (
    <section
      style={{
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: "4px",
        marginTop: "1rem",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "var(--theme-elevation-50)",
          borderBottom: "1px solid var(--theme-elevation-150)",
          color: "var(--theme-elevation-800)",
          fontSize: "0.8125rem",
          fontWeight: 600,
          padding: "0.625rem 0.75rem",
        }}
      >
        Markdown preview
      </div>
      <div
        style={{
          background: "var(--theme-bg)",
          color: "var(--theme-text)",
          lineHeight: 1.6,
          padding: "1rem",
        }}
      >
        {markdown ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        ) : (
          <p style={{ color: "var(--theme-elevation-600)", margin: 0 }}>No Markdown to preview.</p>
        )}
      </div>
    </section>
  )
}
