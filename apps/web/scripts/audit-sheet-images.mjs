import fs from "node:fs/promises"
import path from "node:path"

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1Eleu4irittacEOz_4z3omwceXgzZAoP8xSTe4kv8HR8/gviz/tq?tqx=out:csv&gid=658035943"

const ROOT = process.cwd()
const MANIFEST_PATH = path.join(ROOT, "docs/image-audit/sheet-image-manifest.json")

const transposedEntries = [
  {
    sheetName: "home",
    route: "/",
    driveId: "10YmdYBb-Nq9TQQ82q2jzdxpsqV_7BT8c",
    localPath: "/images/content/sheet/home.jpg",
    status: "used",
  },
  {
    sheetName: "about",
    route: "/about/",
    driveId: "1iNUpWz29X27U-amnHPwT7OGH6rQU5dOn",
    localPath: "/images/content/sheet/about-clinic.jpg",
    status: "used",
  },
  { sheetName: "contact", route: "/contact/", status: "none" },
  { sheetName: "legal", route: "/legal/", status: "none" },
  { sheetName: "disclaimer", route: "/legal/disclaimer/", status: "none" },
  { sheetName: "privacy policy", route: "/legal/privacy-policy/", status: "none" },
  { sheetName: "terms and conditions", route: "/legal/terms-and-conditions/", status: "none" },
  { sheetName: "pricing", status: "none" },
  {
    sheetName: "services",
    route: "/services/",
    driveId: "1sxN4NNbJh0ZCPLXy_kHHb8wWqc7l1nSD",
    localPath: "/images/content/sheet/services/services.jpg",
    status: "used",
  },
  {
    sheetName: "iv therapy",
    route: "/services/iv-therapy/",
    driveId: "12nLhWn2e4blXKaZh_HnBoyWQIO0nZSGG",
    localPath: "/images/content/sheet/services/iv-therapy.jpg",
    status: "used",
  },
  {
    sheetName: "exosome iv drip",
    route: "/services/exosome-iv-drip/",
    driveId: "11uV09S6f1xYkGnMUj41l7l_O_slE4Kou",
    localPath: "/images/content/sheet/services/exosome-iv-drip.jpg",
    status: "used",
  },
  {
    sheetName: "hangover iv drip",
    route: "/services/hangover-iv-drip/",
    driveId: "1TMnS4ZHBFgn4ed4a8SK6Ufso-ifq2dvw",
    localPath: "/images/content/sheet/services/hangover-iv-drip.jpg",
    status: "used",
  },
  {
    sheetName: "energy & fatigue recovery iv",
    route: "/services/energy-fatigue-recovery-iv/",
    driveId: "1XhqV-TT5kBHOgRSmB_xS7OftewfhiV5r",
    localPath: "/images/content/sheet/services/energy-fatigue-recovery-iv.jpg",
    status: "used",
  },
  {
    sheetName: "immune boost iv therapy",
    route: "/services/immune-boost-iv-therapy/",
    driveId: "1z64kRDXVvgQGP1OVBKazTckkUYJyamvG",
    localPath: "/images/content/sheet/services/immune-boost-iv-therapy.jpg",
    status: "used",
  },
  {
    sheetName: "skin brightening iv drip",
    route: "/services/skin-brightening-iv-drip/",
    driveId: "1o2TmNaaNC6XHKypaDS5RIJuMnhnU7sjz",
    localPath: "/images/content/sheet/services/skin-brightening-iv-drip.jpg",
    status: "used",
  },
  {
    sheetName: "iv vitamin therapy",
    route: "/services/iv-vitamin-therapy/",
    driveId: "147VTLow_kiTLLjTAAKq_w9RktZBO73-y",
    localPath: "/images/content/sheet/services/iv-vitamin-therapy.jpg",
    status: "used",
  },
  {
    sheetName: "blood Testing",
    driveId: "1Y5AVOlDyJuORLnZvPssEHkiiDf72j7zN",
    localPath: "/images/content/sheet/unmapped/blood-testing.jpg",
    status: "unmapped",
  },
  {
    sheetName: "Medications",
    route: "/services/medication/",
    sourceUrl:
      "https://www.istockphoto.com/jp/%E3%82%B9%E3%83%88%E3%83%83%E3%82%AF%E3%83%95%E3%82%A9%E3%83%88/%E5%8C%BB%E8%80%85%E3%81%A8%E6%82%A3%E8%80%85-gm669638328-122403229?searchscope=image%2Cfilm",
    localPath: null,
    status: "blocked-external-license",
  },
  {
    sheetName: "ED medication",
    route: "/services/ed-medication/",
    driveId: "1AUHt3V7hR59rnVo2AIFeEIy82oZJGQUM",
    localPath: "/images/content/sheet/services/ed-medication.jpg",
    status: "used",
  },
  {
    sheetName: "AGA medication",
    driveId: "1Fi7S5RELa6x0qiBoYpIvRChItC3IElRt",
    localPath: "/images/content/sheet/unmapped/aga-medication.jpg",
    status: "unmapped",
  },
  {
    sheetName: "stem cell nasal spray",
    route: "/services/stem-cell-nasal-spray/",
    driveId: "1f9X0aCfNKcm8uP506yCL16tsz03jvfSt",
    localPath: "/images/content/sheet/services/stem-cell-nasal-spray.jpg",
    status: "used",
  },
  {
    sheetName: "stem cell therapy",
    route: "/services/stem-cell-therapy/",
    driveId: "1034lUitn2AE75sBPxqFob9ZNF2ToR16t",
    localPath: "/images/content/sheet/services/stem-cell-therapy.jpg",
    status: "used",
  },
  { sheetName: "stem cell therapy How It Works", status: "unmapped" },
  { sheetName: "How Mobile IV Therapy Works", status: "unmapped" },
  { sheetName: "How Online Prescription Works", status: "unmapped" },
]

const rowEntries = [
  {
    sheetName: "blog",
    route: "/blog/",
    driveId: "1J5l7rFQTr-EYjgv6Cf_qfjt73j-_Th4w",
    localPath: "/images/content/sheet/blog/blog.jpg",
    status: "used",
  },
  {
    sheetName: "iv therapy for dehydration",
    route: "/blog/iv-therapy-for-dehydration/",
    blogSlug: "iv-therapy-for-dehydration",
    driveId: "1ViAo9V2prbcmv0fbi-qJYLDOKhjhKiUc",
    localPath: "/images/content/sheet/blog/iv-therapy-for-dehydration.jpg",
    status: "used",
  },
  {
    sheetName: "iv therapy for fatigue",
    route: "/blog/iv-therapy-for-fatigue/",
    blogSlug: "iv-therapy-for-fatigue",
    driveId: "1sxN4NNbJh0ZCPLXy_kHHb8wWqc7l1nSD",
    localPath: "/images/content/sheet/blog/iv-therapy-for-fatigue.jpg",
    status: "used",
  },
  {
    sheetName: "iv therapy for hangover",
    route: "/blog/iv-therapy-for-hangover/",
    blogSlug: "iv-therapy-for-hangover",
    driveId: "1Y42NYS-HWrfmJO0vX8O0qSVUytGXMVac",
    localPath: "/images/content/sheet/blog/iv-therapy-for-hangover.jpg",
    status: "used",
  },
]

async function fetchText(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }
  return response.text()
}

function parseCsv(source) {
  const rows = []
  let row = []
  let cell = ""
  let quoted = false

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    const next = source[index + 1]

    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"'
        index += 1
      } else if (char === '"') {
        quoted = false
      } else {
        cell += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ",") {
      row.push(cell)
      cell = ""
    } else if (char === "\n") {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
    } else if (char !== "\r") {
      cell += char
    }
  }

  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }

  return rows
}

function extractDriveId(url) {
  return url?.match(/\/file\/d\/([^/]+)/)?.[1] ?? null
}

async function fetchDriveFilename(driveId) {
  const response = await fetch(`https://drive.google.com/uc?export=download&id=${driveId}`, {
    method: "HEAD",
    redirect: "follow",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch Drive metadata for ${driveId}: ${response.status} ${response.statusText}`)
  }

  const contentDisposition = response.headers.get("content-disposition") ?? ""
  return contentDisposition.match(/filename="([^"]+)"/)?.[1] ?? contentDisposition.match(/filename=([^;]+)/)?.[1] ?? null
}

function assertSheetStillMatches(rows) {
  const firstRow = rows[0]
  const imageIds = [...firstRow[4].matchAll(/https:\/\/drive\.google\.com\/file\/d\/([^/]+)/g)].map((match) => match[1])
  const expectedImageIds = transposedEntries.map((entry) => entry.driveId).filter(Boolean)

  for (const driveId of expectedImageIds) {
    if (!imageIds.includes(driveId)) {
      throw new Error(`Expected Sheet first row to include Drive ID ${driveId}`)
    }
  }

  for (const rowEntry of rowEntries) {
    const row = rows.find((candidate) => candidate[0] === rowEntry.sheetName)
    if (!row) {
      throw new Error(`Expected Sheet to include row "${rowEntry.sheetName}"`)
    }

    const driveId = extractDriveId(row[4])
    if (driveId !== rowEntry.driveId) {
      throw new Error(`Expected ${rowEntry.sheetName} Drive ID ${rowEntry.driveId}, received ${driveId}`)
    }
  }
}

async function buildManifest() {
  const csv = await fetchText(SHEET_CSV_URL)
  const rows = parseCsv(csv)
  assertSheetStillMatches(rows)

  const entries = [...transposedEntries, ...rowEntries]

  for (const entry of entries) {
    if (entry.driveId) {
      entry.driveFilename = await fetchDriveFilename(entry.driveId)
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    sourceSheetCsvUrl: SHEET_CSV_URL,
    notes: [
      "The first Sheet row is transposed and must be aligned by sheetName, not by route position.",
      "The Medications Sheet image is an iStock webpage URL and is blocked until a licensed local asset is supplied.",
    ],
    entries,
  }
}

const manifest = await buildManifest()
await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true })
await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`)

const used = manifest.entries.filter((entry) => entry.status === "used").length
const unmapped = manifest.entries.filter((entry) => entry.status === "unmapped").length
console.log(`Wrote ${MANIFEST_PATH}`)
console.log(`Used: ${used}`)
console.log(`Unmapped: ${unmapped}`)
