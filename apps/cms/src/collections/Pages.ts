import type { CollectionConfig } from "payload"
import { authenticated, publishedOrAuthenticated } from "@/lib/access"

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
      name: "body",
      type: "textarea",
      localized: true,
      admin: {
        rows: 10,
        description: "Optional Markdown content for page-specific copy.",
      },
    },
  ],
  timestamps: true,
  versions: {
    drafts: {
      autosave: false,
    },
  },
}
