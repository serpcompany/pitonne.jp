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
    crop: false,
    focalPoint: false,
  },
}
