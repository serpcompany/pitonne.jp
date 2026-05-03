# Image Audit And Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit every image currently used by the site, replace incorrect mappings with the correct Sheet/Drive assets, and add tests/scripts that prevent route/image drift.

**Architecture:** Treat the Google Sheet plus Drive file metadata as source data, then convert it into a local checked-in manifest before touching page code. The manifest must preserve the Sheet's transposed first row, including rows that have image entries but no matching route such as `blood Testing`, `AGA medication`, and process/how-it-works entries. Page templates consume local files only, never Drive hotlinks.

**Tech Stack:** Next.js App Router, React, TypeScript data files, Vitest, Node scripts, Google Sheet CSV export, Google Drive public download/thumbnail endpoints, local assets under `public/images/content/sheet/`.

---

## File Structure

- Create `scripts/audit-sheet-images.mjs`: fetch Sheet CSV, parse the transposed first row correctly, fetch Drive metadata filenames, and write an audit report.
- Create `docs/image-audit/sheet-image-manifest.json`: route/name/image source of truth with Drive IDs, Drive filenames, local output paths, and usage status.
- Modify `lib/data/services.ts`: update service image paths from the manifest only.
- Modify `app/page.tsx`: update home service card and home body image paths from the manifest.
- Modify `app/about/page.tsx`: update about page clinic image path from the manifest.
- Modify `app/blog/page.tsx`: keep or adjust the blog index image slot based on the manifest.
- Modify `lib/data/blog-posts.ts`: update static blog post feature image paths from the manifest.
- Modify `components/services/services-index-template.tsx`: render the `/services/` image if manifest says the `services` row has a usable asset.
- Modify `components/services/service-parent-template.tsx`: render parent service images from `service.image`.
- Create or replace `tests/parity/sheet-images.test.ts`: test local files, exact expected route mappings, no Drive hotlinks, and no shifted service mappings.
- Optionally create `tests/fixtures/sheet-image-manifest.json` only if tests need a stable small fixture separate from docs.

## Task 1: Capture Source Evidence

- [ ] **Step 1: Fetch the Sheet CSV**

Run:

```bash
curl -fsSL 'https://docs.google.com/spreadsheets/d/1Eleu4irittacEOz_4z3omwceXgzZAoP8xSTe4kv8HR8/gviz/tq?tqx=out:csv&gid=658035943' > tmp/sheet-images.csv
```

Expected: file exists in project `tmp/`, not `/tmp`.

- [ ] **Step 2: Extract the transposed first-row fields**

Write `scripts/audit-sheet-images.mjs` so it parses CSV cells structurally and treats first-row `name`, `route`, and `images` as three separate transposed lists. Do not split page names into single words. Hard-code the expected page names from the first row after confirming them:

```js
const transposedNames = [
  "home",
  "about",
  "contact",
  "legal",
  "disclaimer",
  "privacy policy",
  "terms and conditions",
  "pricing",
  "services",
  "iv therapy",
  "exosome iv drip",
  "hangover iv drip",
  "energy & fatigue recovery iv",
  "immune boost iv therapy",
  "skin brightening iv drip",
  "iv vitamin therapy",
  "blood Testing",
  "Medications",
  "ED medication",
  "AGA medication",
  "stem cell nasal spray",
  "stem cell therapy",
  "stem cell therapy How It Works",
  "How Mobile IV Therapy Works",
  "How Online Prescription Works",
]
```

- [ ] **Step 3: Fetch Drive filenames for every Drive ID**

For each Drive file ID, request:

```txt
https://drive.google.com/uc?export=download&id=<DRIVE_ID>
```

Use the `content-disposition` filename as evidence. The manifest must store both the Sheet name and Drive filename so a human can catch mismatches.

## Task 2: Build The Correct Manifest

- [ ] **Step 1: Create `docs/image-audit/sheet-image-manifest.json`**

Include each Sheet image row in this shape:

```json
{
  "sheetName": "exosome iv drip",
  "route": "/services/exosome-iv-drip/",
  "driveId": "11uV09S6f1xYkGnMUj41l7l_O_slE4Kou",
  "driveFilename": "Exosome_H.jpg",
  "localPath": "/images/content/sheet/services/exosome-iv-drip.jpg",
  "status": "used"
}
```

- [ ] **Step 2: Mark rows without app routes**

Set `status: "unmapped"` for Sheet rows that have images but no current app route/data model:

```json
[
  { "sheetName": "blood Testing", "status": "unmapped" },
  { "sheetName": "AGA medication", "status": "unmapped" },
  { "sheetName": "stem cell therapy How It Works", "status": "unmapped" },
  { "sheetName": "How Mobile IV Therapy Works", "status": "unmapped" },
  { "sheetName": "How Online Prescription Works", "status": "unmapped" }
]
```

- [ ] **Step 3: Explicitly handle the iStock row**

The `Medications` image is an iStock webpage URL, not a Drive asset. Mark it:

```json
{
  "sheetName": "Medications",
  "route": "/services/medication/",
  "sourceUrl": "https://www.istockphoto.com/...",
  "localPath": null,
  "status": "blocked-external-license"
}
```

Keep the current local medication image until the user supplies a licensed downloadable asset.

## Task 3: Download Local Assets From The Manifest

- [ ] **Step 1: Download web-ready images**

For every manifest entry with a `driveId` and `status: "used"`, download:

```bash
curl -fL --silent --show-error 'https://drive.google.com/thumbnail?id=<DRIVE_ID>&sz=w2000' -o 'public/<LOCAL_PATH>'
```

Expected: each output is a real JPEG or PNG according to `file`.

- [ ] **Step 2: Download unmapped assets too**

Download unmapped Drive assets under:

```txt
public/images/content/sheet/unmapped/
```

Use meaningful filenames such as `blood-testing.jpg`, `aga-medication.jpg`, and `stem-cell-therapy-how-it-works.jpg`.

- [ ] **Step 3: Do not delete stale files without explicit approval**

List stale files separately in the final report. Do not run `rm`.

## Task 4: Update App Image Usage

- [ ] **Step 1: Update service data**

Modify `lib/data/services.ts` so these exact service mappings hold:

```txt
iv-therapy -> /images/content/sheet/services/iv-therapy.jpg
exosome-iv-drip -> /images/content/sheet/services/exosome-iv-drip.jpg
hangover-iv-drip -> /images/content/sheet/services/hangover-iv-drip.jpg
energy-fatigue-recovery-iv -> /images/content/sheet/services/energy-fatigue-recovery-iv.jpg
immune-boost-iv-therapy -> /images/content/sheet/services/immune-boost-iv-therapy.jpg
skin-brightening-iv-drip -> /images/content/sheet/services/skin-brightening-iv-drip.jpg
iv-vitamin-therapy -> /images/content/sheet/services/iv-vitamin-therapy.jpg
ed-medication -> /images/content/sheet/services/ed-medication.jpg
stem-cell-nasal-spray -> /images/content/sheet/services/stem-cell-nasal-spray.jpg
stem-cell-therapy -> /images/content/sheet/services/stem-cell-therapy.jpg
```

- [ ] **Step 2: Keep medication image unchanged unless licensed source exists**

Keep:

```txt
medication -> /images/office_exam_room-scaled.jpg
```

because the Sheet source is an iStock page, not a local downloadable asset.

- [ ] **Step 3: Update page-level images**

Use:

```txt
/ -> /images/content/sheet/home.jpg
/about/ -> /images/content/sheet/about-clinic.jpg
/services/ -> /images/content/sheet/services/services.jpg
/blog/ -> /images/content/sheet/blog/blog.jpg
```

- [ ] **Step 4: Update static blog images**

Use:

```txt
/blog/iv-therapy-for-dehydration/ -> /images/content/sheet/blog/iv-therapy-for-dehydration.jpg
/blog/iv-therapy-for-fatigue/ -> /images/content/sheet/blog/iv-therapy-for-fatigue.jpg
/blog/iv-therapy-for-hangover/ -> /images/content/sheet/blog/iv-therapy-for-hangover.jpg
```

## Task 5: Add Regression Tests

- [ ] **Step 1: Test manifest file existence and shape**

Create a Vitest test that loads `docs/image-audit/sheet-image-manifest.json` and verifies every `used` entry has `sheetName`, `localPath`, and either `route` or `blogSlug`.

- [ ] **Step 2: Test local asset existence**

Assert all `used` and `unmapped` local paths exist under `public/` and are non-empty.

- [ ] **Step 3: Test exact route mapping**

Assert `getService()` returns the exact image paths listed in Task 4.

- [ ] **Step 4: Test no Drive hotlinks**

Search `app/`, `components/`, and `lib/` for:

```txt
drive.google.com
lh3.googleusercontent.com
```

Expected: no matches in production source files.

## Task 6: Visual Audit

- [ ] **Step 1: Start dev server**

Run:

```bash
pnpm dev --hostname 127.0.0.1 --port 3000
```

- [ ] **Step 2: Visit representative pages**

Check these pages in the browser:

```txt
/
/about/
/services/
/services/iv-therapy/
/services/exosome-iv-drip/
/services/hangover-iv-drip/
/services/energy-fatigue-recovery-iv/
/services/immune-boost-iv-therapy/
/services/skin-brightening-iv-drip/
/services/iv-vitamin-therapy/
/services/ed-medication/
/services/stem-cell-nasal-spray/
/services/stem-cell-therapy/
/blog/
/blog/iv-therapy-for-dehydration/
/blog/iv-therapy-for-fatigue/
/blog/iv-therapy-for-hangover/
```

- [ ] **Step 3: Record issues**

Create `docs/image-audit/visual-audit.md` with one row per page:

```markdown
| Page | Expected image | Rendered local path | Visual result | Action |
|---|---|---|---|---|
| /services/exosome-iv-drip/ | Exosome_H.jpg | /images/content/sheet/services/exosome-iv-drip.jpg | pass | none |
```

## Task 7: Final Verification

- [ ] **Step 1: Run tests**

Run:

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run:

```bash
pnpm build
```

Expected: build completes successfully. If `next-env.d.ts` changes from build output, restore it with `apply_patch` unless the user wants generated metadata churn.

- [ ] **Step 3: Report blocked and stale assets**

Final report must include:

```txt
Blocked: Medications Sheet image is an iStock webpage URL, not a licensed local asset.
Unmapped: blood Testing, AGA medication, stem cell therapy How It Works, How Mobile IV Therapy Works, How Online Prescription Works.
Stale files: list unused files under public/images/content/sheet/ without deleting them.
```

## Self-Review

- Spec coverage: The plan covers source parsing, Drive metadata, local downloads, app wiring, tests, visual audit, and final verification.
- Placeholder scan: No TODO/TBD placeholders remain.
- Type consistency: The plan consistently uses `sheetName`, `route`, `driveId`, `driveFilename`, `localPath`, and `status`.
