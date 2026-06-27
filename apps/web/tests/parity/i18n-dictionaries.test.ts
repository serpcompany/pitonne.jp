import { describe, expect, it } from "vitest"
import en from "@/lib/i18n/dictionaries/en.json"
import ja from "@/lib/i18n/dictionaries/ja.json"

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

function flattenKeys(obj: Record<string, JsonValue>, prefix = ""): string[] {
  const keys: string[] = []
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const value = obj[key]
    if (Array.isArray(value)) {
      keys.push(fullKey)
    } else if (typeof value === "object" && value !== null) {
      keys.push(...flattenKeys(value as Record<string, JsonValue>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

function getValueAtPath(obj: Record<string, JsonValue>, path: string): JsonValue | undefined {
  const parts = path.split(".")
  let current: JsonValue = obj
  for (const part of parts) {
    if (typeof current !== "object" || current === null || Array.isArray(current)) return undefined
    current = (current as Record<string, JsonValue>)[part]
  }
  return current
}

describe("i18n dictionary parity", () => {
  const enKeys = flattenKeys(en as Record<string, JsonValue>).sort()
  const jaKeys = flattenKeys(ja as Record<string, JsonValue>).sort()

  it("en.json and ja.json have identical keys", () => {
    const missingInJa = enKeys.filter((k) => !jaKeys.includes(k))
    const missingInEn = jaKeys.filter((k) => !enKeys.includes(k))

    if (missingInJa.length > 0) {
      throw new Error(`Keys in en.json missing from ja.json:\n  ${missingInJa.join("\n  ")}`)
    }
    if (missingInEn.length > 0) {
      throw new Error(`Keys in ja.json missing from en.json:\n  ${missingInEn.join("\n  ")}`)
    }
  })

  it("value types match between en.json and ja.json", () => {
    const mismatches: string[] = []
    for (const key of enKeys) {
      const enVal = getValueAtPath(en as Record<string, JsonValue>, key)
      const jaVal = getValueAtPath(ja as Record<string, JsonValue>, key)
      const enType = Array.isArray(enVal) ? "array" : typeof enVal
      const jaType = Array.isArray(jaVal) ? "array" : typeof jaVal
      if (enType !== jaType) {
        mismatches.push(`${key}: en=${enType}, ja=${jaType}`)
      }
    }
    if (mismatches.length > 0) {
      throw new Error(`Type mismatches:\n  ${mismatches.join("\n  ")}`)
    }
  })

  it("ja.json has no empty string values", () => {
    const empty: string[] = []
    for (const key of jaKeys) {
      const val = getValueAtPath(ja as Record<string, JsonValue>, key)
      if (val === "") {
        empty.push(key)
      }
    }
    if (empty.length > 0) {
      throw new Error(`Empty string values in ja.json:\n  ${empty.join("\n  ")}`)
    }
  })

  it("faqs.items arrays have the same length", () => {
    const enItems = (en as Record<string, JsonValue>).faqs as Record<string, JsonValue>
    const jaItems = (ja as Record<string, JsonValue>).faqs as Record<string, JsonValue>
    const enFaqs = enItems.items as JsonValue[]
    const jaFaqs = jaItems.items as JsonValue[]
    expect(enFaqs.length).toBe(jaFaqs.length)
  })
})
