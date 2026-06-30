import type { CollectionConfig } from "payload"
import { authenticated, publishedOrAuthenticated } from "@/lib/access"
import {
  blogCategorySelectOptions,
  blogTagOptions,
  relatedServiceSlugOptions,
  syncBlogPostCategory,
} from "@/lib/contentOptions"
import { getBlogPostPreviewUrl } from "@/lib/adminPreviewUrls"
import { contentRichTextEditor, populateRichTextFromMarkdown, syncRichTextAndMarkdown } from "@/lib/richTextMarkdown"

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
    preview: (doc, { locale }) => {
      return getBlogPostPreviewUrl(doc.slug, locale)
    },
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
      name: "bodyRichText",
      type: "richText",
      editor: contentRichTextEditor,
      label: "Body",
      localized: true,
      required: true,
      admin: {
        description: "Use Preview after saving to review the rendered public page.",
      },
    },
    {
      name: "body",
      type: "textarea",
      localized: true,
      required: true,
      admin: {
        hidden: true,
        rows: 18,
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
          admin: {
            hidden: true,
          },
        },
        {
          name: "categorySlug",
          type: "select",
          label: "Category",
          options: blogCategorySelectOptions,
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
      displayPreview: true,
      filterOptions: {
        mimeType: {
          contains: "image/",
        },
      },
      maxDepth: 1,
      relationTo: "media",
      admin: {
        description: "Only image uploads are accepted. Node CMS runtimes with sharp enabled generate web image sizes in Media.",
      },
    },
    {
      name: "tags",
      type: "array",
      localized: true,
      fields: [
        {
          name: "tag",
          type: "select",
          options: blogTagOptions,
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
          type: "select",
          options: relatedServiceSlugOptions,
          required: true,
        },
      ],
    },
  ],
  hooks: {
    afterRead: [populateRichTextFromMarkdown],
    beforeValidate: [syncBlogPostCategory, syncRichTextAndMarkdown],
  },
  timestamps: true,
  versions: {
    drafts: {
      autosave: false,
    },
  },
}
