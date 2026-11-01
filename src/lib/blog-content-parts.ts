const videoEmbedPattern = /\{\{video:([a-z0-9-]+)\}\}/g

export type BlogContentPart = { kind: 'text' | 'video'; key: string; segment: string }

export function blogContentParts(content: string): BlogContentPart[] {
  let offset = 0
  return content.split(videoEmbedPattern).map((segment, index) => {
    const kind = index % 2 === 1 ? 'video' : 'text'
    const part = { kind, key: `${kind}-${offset}`, segment } as const
    offset += segment.length
    return part
  })
}
