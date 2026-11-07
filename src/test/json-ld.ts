export function jsonLdFrom(markup: string) {
  return [
    ...markup.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)
  ].map(match => JSON.parse(match[1]))
}
