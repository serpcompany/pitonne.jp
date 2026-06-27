import type { Block } from "payload"

function videoMarkdown(payload: { title?: string; url: string }) {
  return `\n\n\`\`\`video\n${JSON.stringify(payload)}\n\`\`\`\n\n`
}

export const VideoEmbed: Block = {
  slug: "videoEmbed",
  labels: {
    singular: "Video Embed",
    plural: "Video Embeds",
  },
  admin: {
    group: "Media",
  },
  fields: [
    {
      name: "url",
      type: "text",
      required: true,
      admin: {
        description: "YouTube or Vimeo URL.",
      },
    },
    {
      name: "title",
      type: "text",
      admin: {
        description: "Optional accessible title for the embedded video.",
      },
    },
  ],
  jsx: {
    export: ({ fields }) => {
      const url = typeof fields.url === "string" ? fields.url.trim() : ""
      if (!url) {
        return false
      }

      const title = typeof fields.title === "string" ? fields.title.trim() : undefined
      return videoMarkdown({ title, url })
    },
    import: ({ children }) => {
      try {
        const parsed = JSON.parse(children) as { title?: unknown; url?: unknown }
        if (typeof parsed.url !== "string" || !parsed.url.trim()) {
          return false
        }

        return {
          blockType: "videoEmbed",
          title: typeof parsed.title === "string" ? parsed.title : undefined,
          url: parsed.url,
        }
      } catch {
        return false
      }
    },
  },
}
