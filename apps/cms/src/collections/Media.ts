import type { CollectionConfig } from "payload"
import { authenticated } from "@/lib/access"

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  admin: {
    useAsTitle: "alt",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      localized: true,
      required: true,
    },
  ],
  upload: {
    adminThumbnail: "thumbnail",
    crop: true,
    displayPreview: true,
    focalPoint: true,
    formatOptions: {
      format: "webp",
      options: {
        quality: 82,
      },
    },
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        fit: "cover",
        position: "centre",
        formatOptions: {
          format: "webp",
          options: {
            quality: 78,
          },
        },
      },
      {
        name: "card",
        width: 768,
        height: 432,
        fit: "cover",
        position: "centre",
        formatOptions: {
          format: "webp",
          options: {
            quality: 82,
          },
        },
      },
      {
        name: "hero",
        width: 1600,
        height: 900,
        fit: "cover",
        position: "centre",
        formatOptions: {
          format: "webp",
          options: {
            quality: 84,
          },
        },
      },
      {
        name: "openGraph",
        width: 1200,
        height: 630,
        fit: "cover",
        position: "centre",
        formatOptions: {
          format: "webp",
          options: {
            quality: 84,
          },
        },
      },
    ],
    mimeTypes: ["image/*"],
    resizeOptions: {
      width: 2400,
      withoutEnlargement: true,
    },
  },
}
