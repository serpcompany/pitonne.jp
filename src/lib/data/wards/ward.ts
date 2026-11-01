export interface Area {
  slug: string
  name: string
  nameJa: string
  description: string
  descriptionJa: string
  highlights: string[]
  highlightsJa: string[]
  landmarks: string[]
  landmarksJa: string[]
}

export interface Ward {
  slug: string
  name: string
  nameJa: string
  description: string
  descriptionJa: string
  areas: Area[]
}
