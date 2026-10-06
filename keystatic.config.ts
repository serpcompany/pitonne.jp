import { collection, config, fields } from "@keystatic/core"

import {
  BLOG_AUTHOR_DEFAULTS,
  BLOG_RELATED_SERVICE_OPTIONS,
  BLOG_SLUG_PATTERN,
  EXCERPT_MAX_LENGTH,
  EXCERPT_MIN_LENGTH,
  META_DESCRIPTION_MAX_LENGTH,
  META_DESCRIPTION_MIN_LENGTH,
  META_TITLE_MAX_LENGTH,
  META_TITLE_MIN_LENGTH,
} from "@/lib/blog-rules"
import type { Locale } from "@/lib/i18n/config"

// Blog CMS (issue #64). Field rules come from lib/blog-rules.ts, which the zod schema in lib/data/blog-posts.ts also uses.
const slugPattern = { regex: BLOG_SLUG_PATTERN, message: "Use lowercase letters, numbers, and hyphens only" }

// Keystatic applies `min` even to empty optional fields, so optional overrides use a pattern: empty or at least `min`
function optionalMinLength(min: number, label: string) {
  return { regex: new RegExp(`^(|[\\s\\S]{${min},})$`), message: `${label} must be empty or at least ${min} characters` }
}

function blogCollection(label: string, path: `${string}/*`, locale: Locale) {
  // Each locale keeps its own image folder so editing one locale never deletes or replaces the other's image
  const imageFolder = locale === "ja" ? "images/content/blog/ja" : "images/content/blog"

  return collection({
    label,
    path,
    slugField: "title",
    format: { contentField: "content" },
    entryLayout: "content",
    columns: ["title", "publishedAt"],
    schema: {
      title: fields.slug({
        name: { label: "Title", description: "Aim for about 60 characters.", validation: { isRequired: true } },
        slug: {
          label: "Slug",
          description: "Becomes the URL and filename. Use the same slug for the English and Japanese versions. Don't change it after publishing.",
          validation: { pattern: slugPattern },
        },
      }),
      metaTitle: fields.text({
        label: "SEO title (optional)",
        description: `Overrides the title in search results. ${META_TITLE_MIN_LENGTH}–${META_TITLE_MAX_LENGTH} characters.`,
        validation: { length: { max: META_TITLE_MAX_LENGTH }, pattern: optionalMinLength(META_TITLE_MIN_LENGTH, "SEO title") },
      }),
      excerpt: fields.text({
        label: "Excerpt / meta description",
        description: `Shown on blog cards and used as the search and social description. ${EXCERPT_MIN_LENGTH}–${EXCERPT_MAX_LENGTH} characters; if it's under ${META_DESCRIPTION_MIN_LENGTH}, also fill in the meta description override.`,
        validation: { length: { min: EXCERPT_MIN_LENGTH, max: EXCERPT_MAX_LENGTH } },
      }),
      metaDescription: fields.text({
        label: "Meta description override (optional)",
        description: `Search and social description when the excerpt is too short or needs different wording. ${META_DESCRIPTION_MIN_LENGTH}–${META_DESCRIPTION_MAX_LENGTH} characters.`,
        validation: {
          length: { max: META_DESCRIPTION_MAX_LENGTH },
          pattern: optionalMinLength(META_DESCRIPTION_MIN_LENGTH, "Meta description override"),
        },
      }),
      publishedAt: fields.date({ label: "Published date", defaultValue: { kind: "today" }, validation: { isRequired: true } }),
      // Stores the bare category slug (the filename in content/blog-categories), shared by both locales
      categorySlug: fields.relationship({
        label: "Category",
        description: "Listed by slug. To add a category, create it under Blog categories first.",
        collection: "blogCategories",
        validation: { isRequired: true },
      }),
      author: fields.object(
        {
          name: fields.text({ label: "Name", defaultValue: BLOG_AUTHOR_DEFAULTS[locale].name, validation: { isRequired: true } }),
          role: fields.text({ label: "Role", defaultValue: BLOG_AUTHOR_DEFAULTS[locale].role, validation: { isRequired: true } }),
        },
        { label: "Author" }
      ),
      featureImage: fields.image({
        label: "Feature image",
        description: "Keep uploads under 1 MB; images are served unoptimized.",
        directory: `public/${imageFolder}`,
        publicPath: `/${imageFolder}/`,
      }),
      // Required even without an image: Keystatic can't make one field conditional on another
      featureImageAlt: fields.text({
        label: "Feature image alt text",
        description: "Describe the feature image for screen readers.",
        validation: { isRequired: true },
      }),
      featured: fields.checkbox({ label: "Featured" }),
      relatedServiceSlugs: fields.multiselect({ label: "Related services", options: BLOG_RELATED_SERVICE_OPTIONS }),
      tags: fields.ignored(),
      draft: fields.checkbox({ label: "Draft", description: "Drafts are never published, including on previews." }),
      content: fields.markdoc({ label: "Content", extension: "md", description: "Use H2/H3 headings; the title is the page's only H1." }),
    },
  })
}

// Category names and descriptions for both locales live in one file, content/blog-categories/<slug>.json.
// The site reads it with JSON.parse (lib/data/blog-categories.ts), which applies the same rules.
const blogCategories = collection({
  label: "Blog categories",
  path: "content/blog-categories/*",
  slugField: "name",
  format: { data: "json" },
  columns: ["name", "nameJa"],
  schema: {
    name: fields.slug({
      name: { label: "Name (English)", validation: { isRequired: true } },
      slug: {
        label: "Slug",
        description:
          "Becomes the category URL (/blog/category/<slug>/) and is what posts store. Renaming or deleting a category that posts still use fails the build until those posts are moved.",
        validation: { pattern: slugPattern },
      },
    }),
    nameJa: fields.text({ label: "Name (Japanese)", validation: { isRequired: true } }),
    description: fields.text({
      label: "Description (English)",
      description: `Shown on the category page and used as its search and social description. ${META_DESCRIPTION_MIN_LENGTH}–${META_DESCRIPTION_MAX_LENGTH} characters.`,
      validation: { length: { min: META_DESCRIPTION_MIN_LENGTH, max: META_DESCRIPTION_MAX_LENGTH } },
    }),
    descriptionJa: fields.text({
      label: "Description (Japanese)",
      description: `Shown on the Japanese category page and used as its search and social description. ${META_DESCRIPTION_MIN_LENGTH}–${META_DESCRIPTION_MAX_LENGTH} characters.`,
      validation: { length: { min: META_DESCRIPTION_MIN_LENGTH, max: META_DESCRIPTION_MAX_LENGTH } },
    }),
    ctaDescription: fields.text({
      label: "Contact section text (English, optional)",
      description: "Shown above the contact button on the category page. Leave empty to use the site's default text.",
    }),
    ctaDescriptionJa: fields.text({
      label: "Contact section text (Japanese, optional)",
      description: "Shown above the contact button on the Japanese category page. Leave empty to use the site's default text.",
    }),
  },
})

// `pnpm cms` edits local files; `pnpm cms:cloud` signs in through Keystatic Cloud and commits to GitHub
const useCloud = process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "cloud"

export default config({
  storage: useCloud ? { kind: "cloud" } : { kind: "local" },
  cloud: { project: "serp/pitonne-website" },
  ui: { brand: { name: "Pitonne" } },
  collections: {
    blog: blogCollection("Blog (English)", "content/blog/*", "en"),
    blogJa: blogCollection("Blog (Japanese)", "content/blog/ja/*", "ja"),
    blogCategories,
  },
})
