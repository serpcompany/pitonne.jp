import type { CollectionConfig } from "payload"
import { authenticated, publishedOrAuthenticated } from "@/lib/access"

export const BlogPosts: CollectionConfig = {
  slug: "blog-posts",
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedOrAuthenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ["title", "slug", "category", "publishedAt", "_status"],
    useAsTitle: "title",
  },
  defaultSort: "-publishedAt",
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
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
      name: "excerpt",
      type: "textarea",
      localized: true,
      required: true,
    },
    {
      name: "body",
      type: "textarea",
      localized: true,
      required: true,
      admin: {
        rows: 18,
        description: "Markdown content rendered by the public website.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "category",
          type: "text",
          localized: true,
          required: true,
        },
        {
          name: "categorySlug",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "author",
      type: "group",
      fields: [
        {
          name: "name",
          type: "text",
          localized: true,
          required: true,
        },
        {
          name: "role",
          type: "text",
          localized: true,
          required: true,
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "publishedAt",
          type: "date",
          required: true,
          admin: {
            date: {
              pickerAppearance: "dayOnly",
            },
          },
        },
        {
          name: "readingTime",
          type: "number",
          min: 1,
          admin: {
            description: "Optional minutes to read. The website estimates this when omitted.",
          },
        },
        {
          name: "featured",
          type: "checkbox",
          defaultValue: false,
        },
      ],
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "tags",
      type: "array",
      localized: true,
      fields: [
        {
          name: "tag",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "relatedServiceSlugs",
      type: "array",
      fields: [
        {
          name: "slug",
          type: "text",
          required: true,
        },
      ],
    },
  ],
  timestamps: true,
  versions: {
    drafts: {
      autosave: false,
    },
  },
}
