import type { AreaSlug, WardSlug } from '../area-names'

export interface AreaCopy {
  description: string
  descriptionJa: string
  highlights: string[]
  highlightsJa: string[]
  landmarks: string[]
  landmarksJa: string[]
}

export interface WardCopy<W extends WardSlug> {
  description: string
  descriptionJa: string
  areas: Record<AreaSlug<W>, AreaCopy>
}

export interface Area extends AreaCopy {
  slug: string
  name: string
  nameJa: string
}

export interface Ward {
  slug: string
  name: string
  nameJa: string
  description: string
  descriptionJa: string
  areas: Area[]
}
