import type { CollectionBeforeValidateHook, CollectionConfig, TypeWithID } from "payload"
import { authenticated, publishedOrAuthenticated } from "@/lib/access"
import { contentRichTextEditor, populateRichTextFromMarkdown, syncRichTextAndMarkdown } from "@/lib/richTextMarkdown"

const publicWebUrl = process.env.PAYLOAD_PUBLIC_WEB_URL || "http://localhost:3000"
const pageRoutes: Record<string, string> = {
  about: "/about/",
  contact: "/contact/",
  faqs: "/faqs/",
  home: "/",
}

function getPageUrl(key: unknown, locale?: string) {
  if (typeof key !== "string") {
    return null
  }

  const route = pageRoutes[key]
  if (!route) {
    return null
  }

  const localePrefix = locale === "ja" ? "/ja" : ""
  return `${publicWebUrl}${localePrefix}${route}`
}

type PageWithBodyEditorMode = TypeWithID & {
  bodyEditorMode?: "markdown" | "richText" | null
}

const forcePageRichTextMode: CollectionBeforeValidateHook<PageWithBodyEditorMode> = ({ data }) => {
  if (data) {
    data.bodyEditorMode = "richText"
  }

  return data
}

export const Pages: CollectionConfig = {
  slug: "pages",
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedOrAuthenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ["key", "title", "_status", "updatedAt"],
    preview: (doc, { locale }) => {
      return getPageUrl(doc.key, locale)
    },
    useAsTitle: "title",
  },
  fields: [
    {
      name: "key",
      type: "select",
      required: true,
      unique: true,
      options: [
        { label: "Home", value: "home" },
        { label: "About", value: "about" },
        { label: "FAQs", value: "faqs" },
        { label: "Contact", value: "contact" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "title",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "heroDescription",
      type: "textarea",
      localized: true,
    },
    {
      name: "metaTitle",
      type: "text",
      localized: true,
    },
    {
      name: "metaDescription",
      type: "textarea",
      localized: true,
    },
    {
      name: "bodyEditorMode",
      type: "radio",
      defaultValue: "richText",
      options: [
        { label: "Rich text", value: "richText" },
        { label: "Raw Markdown", value: "markdown" },
      ],
      admin: {
        hidden: true,
      },
    },
    {
      name: "bodyRichText",
      type: "richText",
      editor: contentRichTextEditor,
      label: "Body",
      localized: true,
      admin: {
        description: "Optional page copy. Use Preview after saving to review the rendered public page.",
      },
    },
    {
      name: "body",
      type: "textarea",
      localized: true,
      admin: {
        hidden: true,
      },
    },
  ],
  hooks: {
    afterRead: [populateRichTextFromMarkdown],
    beforeValidate: [forcePageRichTextMode, syncRichTextAndMarkdown],
  },
  timestamps: true,
  versions: {
    drafts: {
      autosave: false,
    },
  },
}
