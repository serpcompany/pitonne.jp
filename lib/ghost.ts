import GhostContentAPI from "@tryghost/content-api"

// Initialize Ghost Content API client
const ghost = new GhostContentAPI({
  url: process.env.GHOST_URL || "https://your-ghost-blog.ghost.io",
  key: process.env.GHOST_CONTENT_API_KEY || "",
  version: "v5.0"
})

export interface GhostPost {
  id: string
  slug: string
  title: string
  excerpt: string
  html: string
  feature_image: string | null
  feature_image_alt: string | null
  published_at: string
  updated_at: string
  reading_time: number
  primary_tag: {
    name: string
    slug: string
  } | null
  tags: Array<{
    name: string
    slug: string
  }>
  primary_author: {
    name: string
    profile_image: string | null
    bio: string | null
  } | null
}

export interface GhostPage {
  id: string
  slug: string
  title: string
  html: string
  feature_image: string | null
  published_at: string
}

// Check if Ghost is configured
export function isGhostConfigured(): boolean {
  return !!(process.env.GHOST_URL && process.env.GHOST_CONTENT_API_KEY)
}

// Fetch all blog posts with pagination
export async function getPosts(limit = 10, page = 1): Promise<GhostPost[]> {
  if (!isGhostConfigured()) {
    return []
  }
  
  try {
    const posts = await ghost.posts.browse({
      limit,
      page,
      include: ["tags", "authors"],
      fields: [
        "id",
        "slug",
        "title",
        "excerpt",
        "html",
        "feature_image",
        "feature_image_alt",
        "published_at",
        "updated_at",
        "reading_time",
      ],
    })
    
    return posts as unknown as GhostPost[]
  } catch (error) {
    console.error("Failed to fetch Ghost posts:", error)
    return []
  }
}

// Fetch a single post by slug
export async function getPost(slug: string): Promise<GhostPost | null> {
  if (!isGhostConfigured()) {
    return null
  }
  
  try {
    const post = await ghost.posts.read(
      { slug },
      {
        include: ["tags", "authors"],
      }
    )
    
    return post as unknown as GhostPost
  } catch (error) {
    console.error(`Failed to fetch Ghost post "${slug}":`, error)
    return null
  }
}

// Fetch all posts for static generation
export async function getAllPostSlugs(): Promise<string[]> {
  if (!isGhostConfigured()) {
    return []
  }
  
  try {
    const posts = await ghost.posts.browse({
      limit: "all",
      fields: ["slug"],
    }) as Array<{ slug: string }>
    
    return posts.map((post) => post.slug)
  } catch (error) {
    console.error("Failed to fetch Ghost post slugs:", error)
    return []
  }
}

// Fetch posts by tag
export async function getPostsByTag(tag: string, limit = 10): Promise<GhostPost[]> {
  if (!isGhostConfigured()) {
    return []
  }
  
  try {
    const posts = await ghost.posts.browse({
      limit,
      filter: `tag:${tag}`,
      include: ["tags", "authors"],
    })
    
    return posts as unknown as GhostPost[]
  } catch (error) {
    console.error(`Failed to fetch Ghost posts with tag "${tag}":`, error)
    return []
  }
}

// Fetch Ghost page by slug
export async function getPage(slug: string): Promise<GhostPage | null> {
  if (!isGhostConfigured()) {
    return null
  }
  
  try {
    const page = await ghost.pages.read({ slug })
    return page as unknown as GhostPage
  } catch (error) {
    console.error(`Failed to fetch Ghost page "${slug}":`, error)
    return null
  }
}

// Format date for display
export function formatGhostDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default ghost
