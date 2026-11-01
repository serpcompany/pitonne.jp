export function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_placeholder, name: string) => {
    const value = values[name]
    if (value === undefined) throw new Error(`No value for {${name}} in "${template}"`)
    return value
  })
}
