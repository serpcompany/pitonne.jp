# Page Image Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make page imagery intentionally mapped, real-asset based, and closer to the live Pitonne site across service, area, blog, home, and about pages.

**Architecture:** Add a central typed image registry with named image roles, then update page templates to consume image roles instead of ad hoc `src` strings. Use fixture-based live image inventory and Vitest checks to prevent placeholder/demo images, missing files, empty alt text, and accidental reuse drift.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, React Testing Library, Node audit scripts, existing `public/images` assets.

---

## File Structure

- Create `lib/data/images.ts`: central image registry, image roles, helpers, and route/page mappings.
- Modify `lib/data/services.ts`: replace loose `image`/`imageSourcePath` usage with typed `images` while keeping `image` temporarily for backward compatibility.
- Modify `lib/data/blog-posts.ts`: add `featureImage`, `thumbnailImage`, and image alt/caption data for static posts.
- Modify `lib/data/areas.ts`: add optional area image mappings for ward and neighborhood pages.
- Create `components/shared/content-image.tsx`: one reusable image renderer with stable dimensions, alt enforcement, and object-fit defaults.
- Modify `components/services/service-card-grid.tsx`, `components/services/service-detail-template.tsx`, `components/services/service-parent-template.tsx`: consume typed service images.
- Modify `components/blog/blog-post-template.tsx`, `app/blog/page.tsx`, `app/blog/category/[category]/page.tsx`: consume typed blog images instead of generated placeholders.
- Modify `app/page.tsx` and `app/about/page.tsx`: consume central image mappings for hero/body/team imagery.
- Create `tests/parity/images.test.ts`: registry and rendered-template image regression tests.
- Create `tests/fixtures/live-page-images.json`: checked-in fixture of live image URLs by route.
- Create `scripts/capture-live-images.mjs`: opt-in script to refresh the live image fixture.
- Create `scripts/audit-images.mjs`: local image integrity audit for CI/manual verification.
- Modify `package.json`: add `audit:images`.

## Source Priority

Use images in this order:

1. Live `pitonne.jp` image URLs captured per route.
2. Existing approved assets in `public/images`.
3. Original repo assets under `/Users/devin/dev/repos/pitonne.jp/assets/images`.
4. README-linked Sheet/Drive assets if the Sheet marks the page image as approved/done.

Do not use:

- `public/placeholder*`
- stock/demo Glowence assets
- `logoipsum`
- generated placeholder cards for blog posts
- irrelevant repeated clinic images when a route has a better live/source image

## Task 1: Add Image Registry Tests

**Files:**
- Create: `tests/parity/images.test.ts`
- Create: `lib/data/images.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest"
import { existsSync } from "node:fs"
import path from "node:path"
import {
  getAllContentImages,
  getImageForRoute,
  imageRegistry,
} from "@/lib/data/images"

const root = process.cwd()

describe("content image registry", () => {
  it("uses only real local assets with useful alt text", () => {
    for (const image of getAllContentImages()) {
      expect(image.alt.trim().length).toBeGreaterThanOrEqual(12)
      expect(image.src).not.toMatch(/placeholder|logoipsum|glowence/i)

      if (image.src.startsWith("/")) {
        expect(existsSync(path.join(root, "public", image.src))).toBe(true)
      }
    }
  })

  it("maps priority page routes to image roles", () => {
    expect(getImageForRoute("/", "hero")?.src).toBe("/images/tokyotower-background.heic")
    expect(getImageForRoute("/services/stem-cell-nasal-spray/", "detail")?.src).toBeTruthy()
    expect(getImageForRoute("/blog/iv-therapy-for-dehydration/", "feature")?.src).toBeTruthy()
    expect(getImageForRoute("/areas-served/minato/hiroo/", "feature")?.src).toBeTruthy()
  })

  it("does not let every IV therapy service share one card image", () => {
    const ivServiceImages = [
      imageRegistry["services.exosome-iv-drip.card"].src,
      imageRegistry["services.hangover-iv-drip.card"].src,
      imageRegistry["services.energy-fatigue-recovery-iv.card"].src,
      imageRegistry["services.skin-brightening-iv-drip.card"].src,
      imageRegistry["services.immune-boost-iv-therapy.card"].src,
      imageRegistry["services.iv-vitamin-therapy.card"].src,
    ]

    expect(new Set(ivServiceImages).size).toBeGreaterThanOrEqual(3)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm test:parity -- tests/parity/images.test.ts
```

Expected: FAIL because `lib/data/images.ts` does not exist.

- [ ] **Step 3: Add minimal image registry**

Create `lib/data/images.ts`:

```ts
export type ImageRole = "hero" | "feature" | "card" | "detail" | "team" | "logo"

export interface ContentImage {
  id: string
  src: string
  alt: string
  role: ImageRole
  width?: number
  height?: number
  caption?: string
  source?: "live-site" | "repo" | "sheet" | "current-public"
}

export const imageRegistry = {
  "home.hero": {
    id: "home.hero",
    src: "/images/tokyotower-background.heic",
    alt: "Tokyo Tower evening skyline near Pitonne in Minato Tokyo",
    role: "hero",
    source: "current-public",
  },
  "about.clinic": {
    id: "about.clinic",
    src: "/images/aic_office_reception_2-scaled.jpg",
    alt: "Pitonne clinic reception area in Nishi Azabu Tokyo",
    role: "feature",
    source: "current-public",
  },
  "about.kana": {
    id: "about.kana",
    src: "/images/kana-scaled.jpg",
    alt: "Kanako Shimizu registered nurse and public health nurse at Pitonne",
    role: "team",
    source: "current-public",
  },
  "about.saori": {
    id: "about.saori",
    src: "/images/saori-scaled.jpg",
    alt: "Saori Tsubaki registered nurse and public health nurse at Pitonne",
    role: "team",
    source: "current-public",
  },
  "about.akira": {
    id: "about.akira",
    src: "/images/akira_about_3x4-1-scaled.jpg",
    alt: "Akira Mikami physician supporting Pitonne patients in Tokyo",
    role: "team",
    source: "current-public",
  },
  "services.iv-therapy.card": {
    id: "services.iv-therapy.card",
    src: "/images/office_iv_patient_chairs-scaled.jpg",
    alt: "Pitonne IV therapy chairs prepared for patient wellness treatment",
    role: "card",
    source: "current-public",
  },
  "services.iv-therapy.detail": {
    id: "services.iv-therapy.detail",
    src: "/images/office_iv_patient_chairs-scaled.jpg",
    alt: "Pitonne IV therapy treatment room with patient chairs",
    role: "detail",
    source: "current-public",
  },
  "services.exosome-iv-drip.card": {
    id: "services.exosome-iv-drip.card",
    src: "/images/office_iv_patient_chairs-scaled.jpg",
    alt: "IV therapy chairs used for exosome IV drip appointments at Pitonne",
    role: "card",
    source: "current-public",
  },
  "services.hangover-iv-drip.card": {
    id: "services.hangover-iv-drip.card",
    src: "/images/aic_office_reception_2-scaled.jpg",
    alt: "Pitonne reception for same day hangover IV consultation in Tokyo",
    role: "card",
    source: "current-public",
  },
  "services.energy-fatigue-recovery-iv.card": {
    id: "services.energy-fatigue-recovery-iv.card",
    src: "/images/office_iv_patient_chairs-scaled.jpg",
    alt: "Pitonne IV therapy room for energy and fatigue recovery support",
    role: "card",
    source: "current-public",
  },
  "services.skin-brightening-iv-drip.card": {
    id: "services.skin-brightening-iv-drip.card",
    src: "/images/office_exam_room-scaled.jpg",
    alt: "Pitonne private consultation room for skin brightening IV planning",
    role: "card",
    source: "current-public",
  },
  "services.immune-boost-iv-therapy.card": {
    id: "services.immune-boost-iv-therapy.card",
    src: "/images/office_iv_patient_chairs-scaled.jpg",
    alt: "Pitonne IV therapy treatment space for immune support visits",
    role: "card",
    source: "current-public",
  },
  "services.iv-vitamin-therapy.card": {
    id: "services.iv-vitamin-therapy.card",
    src: "/images/aic_office_reception_2-scaled.jpg",
    alt: "Pitonne clinic reception for IV vitamin therapy consultations",
    role: "card",
    source: "current-public",
  },
  "services.stem-cell-therapy.card": {
    id: "services.stem-cell-therapy.card",
    src: "/images/office_exam_room-scaled.jpg",
    alt: "Pitonne private room for stem cell therapy consultation",
    role: "card",
    source: "current-public",
  },
  "services.stem-cell-nasal-spray.card": {
    id: "services.stem-cell-nasal-spray.card",
    src: "/images/office_exam_room-scaled.jpg",
    alt: "Private consultation room for stem cell nasal spray at Pitonne",
    role: "card",
    source: "current-public",
  },
  "services.stem-cell-nasal-spray.detail": {
    id: "services.stem-cell-nasal-spray.detail",
    src: "/images/office_exam_room-scaled.jpg",
    alt: "Pitonne exam room used for stem cell nasal spray consultation",
    role: "detail",
    source: "current-public",
  },
  "services.medication.card": {
    id: "services.medication.card",
    src: "/images/aic_office_reception_2-scaled.jpg",
    alt: "Pitonne reception for discreet medication consultation",
    role: "card",
    source: "current-public",
  },
  "services.ed-medication.card": {
    id: "services.ed-medication.card",
    src: "/images/aic_office_reception_2-scaled.jpg",
    alt: "Pitonne clinic reception for ED medication consultation",
    role: "card",
    source: "current-public",
  },
  "areas.minato.hiroo.feature": {
    id: "areas.minato.hiroo.feature",
    src: "/images/tokyotower-background.heic",
    alt: "Central Tokyo skyline near Hiroo and Minato service areas",
    role: "feature",
    source: "current-public",
  },
  "blog.iv-therapy-for-dehydration.feature": {
    id: "blog.iv-therapy-for-dehydration.feature",
    src: "/images/office_iv_patient_chairs-scaled.jpg",
    alt: "Pitonne IV therapy room for hydration support articles",
    role: "feature",
    source: "current-public",
  },
} satisfies Record<string, ContentImage>

export const routeImageMap: Record<string, Partial<Record<ImageRole, keyof typeof imageRegistry>>> = {
  "/": { hero: "home.hero" },
  "/about/": { feature: "about.clinic" },
  "/services/iv-therapy/": { card: "services.iv-therapy.card", detail: "services.iv-therapy.detail" },
  "/services/stem-cell-nasal-spray/": {
    card: "services.stem-cell-nasal-spray.card",
    detail: "services.stem-cell-nasal-spray.detail",
  },
  "/areas-served/minato/hiroo/": { feature: "areas.minato.hiroo.feature" },
  "/blog/iv-therapy-for-dehydration/": { feature: "blog.iv-therapy-for-dehydration.feature" },
}

export function getAllContentImages(): ContentImage[] {
  return Object.values(imageRegistry)
}

export function getImage(id: keyof typeof imageRegistry): ContentImage {
  return imageRegistry[id]
}

export function getImageForRoute(route: string, role: ImageRole): ContentImage | undefined {
  const imageId = routeImageMap[route]?.[role]
  return imageId ? imageRegistry[imageId] : undefined
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm test:parity -- tests/parity/images.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/data/images.ts tests/parity/images.test.ts
git commit -m "test(images): add content image registry checks"
```

## Task 2: Capture Live Image Fixture

**Files:**
- Create: `scripts/capture-live-images.mjs`
- Create: `tests/fixtures/live-page-images.json`
- Modify: `package.json`

- [ ] **Step 1: Add fixture test**

Append to `tests/parity/images.test.ts`:

```ts
import livePageImages from "@/tests/fixtures/live-page-images.json"

it("keeps a fixture of live image usage for priority pages", () => {
  expect(livePageImages["/services/stem-cell-nasal-spray/"]).toBeDefined()
  expect(Array.isArray(livePageImages["/services/stem-cell-nasal-spray/"].images)).toBe(true)
  expect(livePageImages["/services/stem-cell-nasal-spray/"].capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}/)
})
```

- [ ] **Step 2: Create fixture**

Create `tests/fixtures/live-page-images.json`:

```json
{
  "/services/stem-cell-nasal-spray/": {
    "capturedAt": "2026-05-03",
    "images": []
  },
  "/services/iv-therapy/": {
    "capturedAt": "2026-05-03",
    "images": []
  },
  "/areas-served/minato/hiroo/": {
    "capturedAt": "2026-05-03",
    "images": []
  },
  "/blog/iv-therapy-for-dehydration/": {
    "capturedAt": "2026-05-03",
    "images": []
  }
}
```

- [ ] **Step 3: Add refresh script**

Create `scripts/capture-live-images.mjs`:

```js
import fs from "node:fs"
import path from "node:path"

const routes = [
  "/",
  "/about/",
  "/services/",
  "/services/iv-therapy/",
  "/services/stem-cell-nasal-spray/",
  "/areas-served/minato/hiroo/",
  "/blog/iv-therapy-for-dehydration/",
]

const outputPath = path.join(process.cwd(), "tests/fixtures/live-page-images.json")

function imageSources(html) {
  return [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1])
    .filter((src) => !src.includes("/_next/"))
}

const capturedAt = new Date().toISOString().slice(0, 10)
const fixture = {}

for (const route of routes) {
  const response = await fetch(`https://pitonne.jp${route}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${route}: ${response.status}`)
  }

  fixture[route] = {
    capturedAt,
    images: imageSources(await response.text()),
  }
}

fs.writeFileSync(outputPath, `${JSON.stringify(fixture, null, 2)}\n`)
console.log(`Wrote ${outputPath}`)
```

- [ ] **Step 4: Add script**

Update `package.json`:

```json
"capture:live-images": "node scripts/capture-live-images.mjs"
```

- [ ] **Step 5: Refresh fixture and run tests**

Run:

```bash
pnpm capture:live-images
pnpm test:parity -- tests/parity/images.test.ts
```

Expected: PASS and the fixture contains live image URLs for priority pages.

- [ ] **Step 6: Commit**

```bash
git add package.json scripts/capture-live-images.mjs tests/fixtures/live-page-images.json tests/parity/images.test.ts
git commit -m "test(images): capture live image fixture"
```

## Task 3: Add Reusable Content Image Component

**Files:**
- Create: `components/shared/content-image.tsx`
- Test: `tests/parity/images.test.ts`

- [ ] **Step 1: Add component test**

Append:

```ts
import { render, screen } from "@testing-library/react"
import { ContentImage } from "@/components/shared/content-image"

it("renders registered images with fixed dimensions and alt text", () => {
  render(
    <ContentImage
      image={{
        id: "test.image",
        src: "/images/office_exam_room-scaled.jpg",
        alt: "Pitonne private exam room for patient consultation",
        role: "feature",
      }}
      className="rounded-lg"
      sizes="(min-width: 768px) 50vw, 100vw"
    />,
  )

  const image = screen.getByRole("img", { name: "Pitonne private exam room for patient consultation" })
  expect(image).toHaveAttribute("src", "/images/office_exam_room-scaled.jpg")
  expect(image).toHaveClass("object-cover")
})
```

- [ ] **Step 2: Implement component**

Create `components/shared/content-image.tsx`:

```tsx
import type { ContentImage as ContentImageData } from "@/lib/data/images"

export function ContentImage({
  image,
  className = "",
  imgClassName = "",
  sizes,
}: {
  image: ContentImageData
  className?: string
  imgClassName?: string
  sizes?: string
}) {
  return (
    <figure className={`overflow-hidden ${className}`}>
      <img
        src={image.src}
        alt={image.alt}
        sizes={sizes}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
      {image.caption && <figcaption className="mt-2 text-xs text-muted-foreground">{image.caption}</figcaption>}
    </figure>
  )
}
```

- [ ] **Step 3: Run test**

Run:

```bash
pnpm test:parity -- tests/parity/images.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/shared/content-image.tsx tests/parity/images.test.ts
git commit -m "feat(images): add shared content image renderer"
```

## Task 4: Wire Service Images Through Data and Templates

**Files:**
- Modify: `lib/data/services.ts`
- Modify: `components/services/service-card-grid.tsx`
- Modify: `components/services/service-detail-template.tsx`
- Modify: `components/services/service-parent-template.tsx`
- Test: `tests/parity/services.test.tsx`
- Test: `tests/parity/images.test.ts`

- [ ] **Step 1: Add service image assertions**

Append to `tests/parity/services.test.tsx`:

```tsx
it("renders service cards with mapped image alt text", () => {
  render(<ServicesIndexTemplate sections={getServiceCategorySections()} />)

  expect(screen.getByRole("img", { name: /exosome iv drip/i })).toBeInTheDocument()
  expect(screen.getByRole("img", { name: /hangover iv/i })).toBeInTheDocument()
  expect(screen.getByRole("img", { name: /stem cell nasal spray/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Extend service type and data**

In `lib/data/services.ts`, import image helpers:

```ts
import type { ContentImage } from "@/lib/data/images"
import { getImage } from "@/lib/data/images"
```

Extend `Service`:

```ts
images?: {
  card?: ContentImage
  detail?: ContentImage
}
```

For each service, add:

```ts
images: {
  card: getImage("services.exosome-iv-drip.card"),
  detail: getImage("services.iv-therapy.detail"),
},
```

Use the matching key for each service slug.

- [ ] **Step 3: Update service card template**

In `components/services/service-card-grid.tsx`, use `ContentImage`:

```tsx
{service.images?.card && (
  <ContentImage
    image={service.images.card}
    className="h-40"
    imgClassName="transition-transform duration-300 group-hover:scale-105"
    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
  />
)}
```

- [ ] **Step 4: Update service detail template**

In `components/services/service-detail-template.tsx`, replace the direct `<img>` block with:

```tsx
{service.images?.detail && (
  <ContentImage
    image={service.images.detail}
    className="mb-12 rounded-lg border border-border"
    sizes="(min-width: 1024px) 65vw, 100vw"
  />
)}
```

- [ ] **Step 5: Run tests**

Run:

```bash
pnpm test:parity
pnpm audit:content
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/data/services.ts components/services/service-card-grid.tsx components/services/service-detail-template.tsx components/services/service-parent-template.tsx tests/parity/services.test.tsx tests/parity/images.test.ts
git commit -m "feat(images): map service page imagery"
```

## Task 5: Wire Blog Images and Remove Generated Blog Placeholders

**Files:**
- Modify: `lib/data/blog-posts.ts`
- Modify: `components/blog/blog-post-template.tsx`
- Modify: `app/blog/page.tsx`
- Modify: `app/blog/category/[category]/page.tsx`
- Test: `tests/parity/blog-post.test.tsx`
- Test: `tests/parity/images.test.ts`

- [ ] **Step 1: Add blog image assertions**

Append to `tests/parity/blog-post.test.tsx`:

```tsx
it("renders the post feature image and latest post thumbnails", () => {
  const post = getBlogPostBySlug("iv-therapy-for-dehydration")
  expect(post).toBeDefined()

  render(
    <BlogPostTemplate
      post={{
        title: post!.title,
        slug: post!.slug,
        date: "March 16, 2026",
        content: post!.content,
        excerpt: post!.excerpt,
        readingTime: post!.readingTime,
        category: post!.category,
        categorySlug: post!.categorySlug,
        author: post!.author,
        featureImage: post!.featureImage,
      }}
      relatedPosts={[]}
      latestPosts={getAllBlogPosts().filter((candidate) => candidate.slug !== post!.slug)}
    />,
  )

  expect(screen.getByRole("img", { name: /hydration support/i })).toBeInTheDocument()
  expect(screen.queryByText("Questions About This Topic?")).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Add blog image data**

Extend `BlogPost` in `lib/data/blog-posts.ts`:

```ts
import type { ContentImage } from "@/lib/data/images"
import { getImage } from "@/lib/data/images"

featureImage?: ContentImage
thumbnailImage?: ContentImage
```

For `iv-therapy-for-dehydration`, add:

```ts
featureImage: getImage("blog.iv-therapy-for-dehydration.feature"),
thumbnailImage: getImage("blog.iv-therapy-for-dehydration.feature"),
```

For other posts, map to the best available IV-room or clinic image until better live/source assets are imported.

- [ ] **Step 3: Render blog images through `ContentImage`**

In `components/blog/blog-post-template.tsx`, change `featureImage` type from `string | null` to `ContentImage | null`, then render:

```tsx
{post.featureImage && (
  <section className="bg-card">
    <div className="container mx-auto -mt-8 px-4">
      <div className="mx-auto max-w-4xl">
        <ContentImage image={post.featureImage} className="rounded-lg shadow-lg" sizes="100vw" />
      </div>
    </div>
  </section>
)}
```

- [ ] **Step 4: Replace blog index placeholders**

In `app/blog/page.tsx` and `app/blog/category/[category]/page.tsx`, replace decorative placeholder blocks with:

```tsx
{post.thumbnailImage && (
  <ContentImage
    image={post.thumbnailImage}
    className="aspect-video"
    sizes="(min-width: 768px) 33vw, 100vw"
  />
)}
```

- [ ] **Step 5: Run tests**

Run:

```bash
pnpm test:parity
pnpm audit:content
```

Expected: PASS and no generated blog placeholder cards remain.

- [ ] **Step 6: Commit**

```bash
git add lib/data/blog-posts.ts components/blog/blog-post-template.tsx app/blog/page.tsx app/blog/category/[category]/page.tsx tests/parity/blog-post.test.tsx tests/parity/images.test.ts
git commit -m "feat(images): map blog post imagery"
```

## Task 6: Wire Home, About, Area, and Ward Images

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/about/page.tsx`
- Modify: `lib/data/areas.ts`
- Modify: `components/area-detail-page.tsx`
- Modify: `app/areas-served/[ward]/page.tsx`
- Test: `tests/parity/area-detail.test.tsx`
- Test: `tests/parity/images.test.ts`

- [ ] **Step 1: Add route image assertions**

Append to `tests/parity/area-detail.test.tsx`:

```tsx
expect(screen.getByRole("img", { name: /central tokyo skyline/i })).toBeInTheDocument()
```

Append to `tests/parity/images.test.ts`:

```ts
it("has route images for top-level marketing pages", () => {
  expect(getImageForRoute("/", "hero")?.alt).toMatch(/Tokyo Tower/)
  expect(getImageForRoute("/about/", "feature")?.alt).toMatch(/clinic/i)
})
```

- [ ] **Step 2: Use registry on home/about**

In `app/page.tsx`, replace hard-coded hero/body image references with:

```tsx
const homeHeroImage = getImageForRoute("/", "hero")
```

Render with:

```tsx
{homeHeroImage && (
  <ContentImage image={homeHeroImage} className="absolute inset-0" imgClassName="opacity-20" sizes="100vw" />
)}
```

In `app/about/page.tsx`, map team images from registry:

```tsx
image: getImage("about.kana")
```

Then render team photos with `ContentImage`.

- [ ] **Step 3: Add area image data**

In `lib/data/areas.ts`, extend `Area`:

```ts
image?: ContentImage
```

For Minato/Hiroo, add:

```ts
image: getImage("areas.minato.hiroo.feature")
```

- [ ] **Step 4: Render area images**

In `components/area-detail-page.tsx`, add optional prop:

```ts
image?: ContentImage
```

Render above `Local Access` text:

```tsx
{image && (
  <ContentImage image={image} className="mb-8 aspect-[16/9] rounded-lg border border-border" sizes="100vw" />
)}
```

- [ ] **Step 5: Run tests**

Run:

```bash
pnpm test:parity
pnpm audit:content
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/about/page.tsx lib/data/areas.ts components/area-detail-page.tsx app/areas-served/[ward]/page.tsx tests/parity/area-detail.test.tsx tests/parity/images.test.ts
git commit -m "feat(images): map area and marketing page imagery"
```

## Task 7: Add Local Image Audit

**Files:**
- Create: `scripts/audit-images.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add audit script**

Create `scripts/audit-images.mjs`:

```js
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const failures = []
const sourceFiles = [
  "lib/data/images.ts",
  "lib/data/services.ts",
  "lib/data/blog-posts.ts",
  "lib/data/areas.ts",
]

for (const file of sourceFiles) {
  const source = fs.readFileSync(path.join(root, file), "utf8")
  for (const match of source.matchAll(/src:\s*"([^"]+)"/g)) {
    const src = match[1]
    if (/placeholder|logoipsum|glowence/i.test(src)) {
      failures.push(`${file} uses disallowed demo image: ${src}`)
    }
    if (src.startsWith("/") && !fs.existsSync(path.join(root, "public", src))) {
      failures.push(`${file} references missing public image: ${src}`)
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"))
  process.exit(1)
}

console.log("Image audit passed.")
```

- [ ] **Step 2: Add package script**

Update `package.json`:

```json
"audit:images": "node scripts/audit-images.mjs"
```

- [ ] **Step 3: Run audit**

Run:

```bash
pnpm audit:images
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add package.json scripts/audit-images.mjs
git commit -m "test(images): add local image audit"
```

## Task 8: Final Verification and Manual Spot Checks

**Files:**
- No expected code changes unless verification finds an issue.

- [ ] **Step 1: Run automated verification**

Run:

```bash
pnpm test
pnpm audit:images
pnpm audit:content
pnpm audit:routes
pnpm exec tsc --noEmit --incremental false
pnpm build
```

Expected: all pass. `pnpm lint` is still expected to fail until the separate ESLint parser/config issue is fixed.

- [ ] **Step 2: Start fresh local server**

Run:

```bash
pnpm exec next start -p 3002
```

Expected: server available at `http://localhost:3002`.

- [ ] **Step 3: Spot-check rendered image output**

Check these pages:

```bash
curl -s http://localhost:3002/ | rg "Tokyo Tower|tokyotower-background"
curl -s http://localhost:3002/about/ | rg "Pitonne clinic reception|Kanako Shimizu"
curl -s http://localhost:3002/services/ | rg "Exosome IV Drip|Hangover IV"
curl -s http://localhost:3002/services/stem-cell-nasal-spray/ | rg "stem cell nasal spray"
curl -s http://localhost:3002/areas-served/minato/hiroo/ | rg "central tokyo skyline|Local Access"
curl -s http://localhost:3002/blog/iv-therapy-for-dehydration/ | rg "hydration support|Related Pitonne Services"
```

Expected: each command finds the mapped image alt text or expected image-backed section.

- [ ] **Step 4: Commit any verification fixes**

If verification required small fixes:

```bash
git add <changed-files>
git commit -m "fix(images): correct rendered image mappings"
```

If no fixes are needed, do not create an empty commit.

## Self-Review

- Spec coverage: the plan covers source discovery, image registry, service pages, area pages, blog pages, home/about pages, tests, audits, and rendered checks.
- Placeholder scan: no task says “TBD” or asks for generic tests without concrete assertions.
- Type consistency: `ContentImage`, `ImageRole`, `getImage`, `getImageForRoute`, `featureImage`, `thumbnailImage`, and `images.card/detail` are defined before use.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-03-page-image-parity.md`.

Two execution options:

1. **Subagent-Driven (recommended)** - dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - execute tasks in this session using executing-plans, batch execution with checkpoints.
