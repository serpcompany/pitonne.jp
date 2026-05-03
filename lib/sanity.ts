import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'

// Sanity client configuration
// Set these environment variables in your Vercel project settings:
// NEXT_PUBLIC_SANITY_PROJECT_ID - Your Sanity project ID
// NEXT_PUBLIC_SANITY_DATASET - Your Sanity dataset (usually "production")
// SANITY_API_TOKEN - (optional) For authenticated requests

const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
}

let client: ReturnType<typeof createClient> | null = null
let builder: ReturnType<typeof imageUrlBuilder> | null = null

function getClient() {
  if (!isSanityConfigured()) return null
  client ??= createClient(sanityConfig)
  return client
}

function getImageBuilder() {
  const sanityClient = getClient()
  if (!sanityClient) return null
  builder ??= imageUrlBuilder(sanityClient)
  return builder
}

export function urlFor(source: SanityImageSource) {
  const imageBuilder = getImageBuilder()
  if (!imageBuilder) {
    throw new Error('Sanity is not configured')
  }
  return imageBuilder.image(source)
}

// Check if Sanity is configured
export function isSanityConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
}

// Types for blog posts
export interface SanityPost {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
  excerpt?: string
  mainImage?: {
    asset: {
      _ref: string
      _type: string
    }
    alt?: string
  }
  body?: unknown[] // Portable Text
  categories?: Array<{
    _ref: string
    title?: string
    slug?: { current: string }
  }>
  author?: {
    name: string
    image?: {
      asset: {
        _ref: string
      }
    }
  }
  estimatedReadingTime?: number
}

// GROQ queries
export const postsQuery = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage,
  "categories": categories[]->{ _id, title, slug },
  "author": author->{ name, image },
  "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
}`

export const postBySlugQuery = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage,
  body,
  "categories": categories[]->{ _id, title, slug },
  "author": author->{ name, image, bio },
  "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
}`

export const categoriesQuery = `*[_type == "category"] | order(title asc) {
  _id,
  title,
  slug,
  description
}`

export const postsByCategoryQuery = `*[_type == "post" && $categorySlug in categories[]->slug.current] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage,
  "categories": categories[]->{ _id, title, slug },
  "author": author->{ name, image },
  "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
}`

// Fetch functions
export async function getPosts(): Promise<SanityPost[]> {
  const sanityClient = getClient()
  if (!sanityClient) return []
  try {
    return await sanityClient.fetch(postsQuery)
  } catch (error) {
    console.error('Error fetching posts from Sanity:', error)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<SanityPost | null> {
  const sanityClient = getClient()
  if (!sanityClient) return null
  try {
    return await sanityClient.fetch(postBySlugQuery, { slug })
  } catch (error) {
    console.error('Error fetching post from Sanity:', error)
    return null
  }
}

export async function getPostsByCategory(categorySlug: string): Promise<SanityPost[]> {
  const sanityClient = getClient()
  if (!sanityClient) return []
  try {
    return await sanityClient.fetch(postsByCategoryQuery, { categorySlug })
  } catch (error) {
    console.error('Error fetching posts by category from Sanity:', error)
    return []
  }
}

// Format date helper
export function formatSanityDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
