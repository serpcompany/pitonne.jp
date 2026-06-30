import type { CollectionAfterReadHook, CollectionBeforeValidateHook, PayloadRequest, TypeWithID } from "payload"
import {
  BlocksFeature,
  CodeBlock,
  convertLexicalToMarkdown,
  convertMarkdownToLexical,
  defaultEditorConfig,
  defaultEditorFeatures,
  FixedToolbarFeature,
  lexicalEditor,
  sanitizeServerEditorConfig,
  type SanitizedServerEditorConfig,
  UploadFeature,
} from "@payloadcms/richtext-lexical"
import { VideoEmbed } from "@/blocks/VideoEmbed"

type RichTextValue = Record<string, unknown>
type RichTextBackedDoc = TypeWithID & {
  body?: string | null
  bodyRichText?: RichTextValue | null
}

let editorConfigPromise: Promise<SanitizedServerEditorConfig> | null = null
const contentRichTextFeatures = [
  ...defaultEditorFeatures,
  UploadFeature({
    collections: {
      media: {
        fields: [],
      },
    },
  }),
  BlocksFeature({
    blocks: [CodeBlock(), VideoEmbed],
  }),
  FixedToolbarFeature(),
]
const contentEditorConfig = {
  ...defaultEditorConfig,
  features: contentRichTextFeatures,
}

export const contentRichTextEditor = lexicalEditor({
  features: contentRichTextFeatures,
})

function getEditorConfig(req: PayloadRequest) {
  editorConfigPromise ??= sanitizeServerEditorConfig(contentEditorConfig, req.payload.config, true)
  return editorConfigPromise
}

function isRichTextValue(value: unknown): value is RichTextValue {
  return Boolean(value && typeof value === "object" && "root" in value)
}

async function markdownToRichText(markdown: string, req: PayloadRequest) {
  const editorConfig = await getEditorConfig(req)
  return convertMarkdownToLexical({ editorConfig, markdown })
}

async function richTextToMarkdown(richText: RichTextValue, req: PayloadRequest) {
  const editorConfig = await getEditorConfig(req)
  return convertLexicalToMarkdown({
    data: richText as unknown as Parameters<typeof convertLexicalToMarkdown>[0]["data"],
    editorConfig,
  }).trim()
}

export const populateRichTextFromMarkdown: CollectionAfterReadHook<RichTextBackedDoc> = async ({ doc, req }) => {
  if (!isRichTextValue(doc.bodyRichText) && doc.body?.trim()) {
    doc.bodyRichText = await markdownToRichText(doc.body, req)
  }

  return doc
}

export const syncRichTextAndMarkdown: CollectionBeforeValidateHook<RichTextBackedDoc> = async ({ data, req }) => {
  if (!data) {
    return data
  }

  if (isRichTextValue(data.bodyRichText)) {
    data.body = await richTextToMarkdown(data.bodyRichText, req)
    return data
  }

  if (data.body?.trim()) {
    data.bodyRichText = await markdownToRichText(data.body, req)
  }

  return data
}
