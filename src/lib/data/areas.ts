import { type WardSlug, wardNames } from './area-names'
import { chiyoda } from './wards/chiyoda'
import { chuo } from './wards/chuo'
import { minato } from './wards/minato'
import { shibuya } from './wards/shibuya'
import { shinagawa } from './wards/shinagawa'
import type { Area, AreaCopy, Ward, WardCopy } from './wards/ward'

const wardCopy: { [W in WardSlug]: WardCopy<W> } = { minato, shibuya, chuo, chiyoda, shinagawa }

export const wards: Ward[] = wardNames.map(({ areas, ...ward }) => {
  const { areas: areaCopy, ...copy } = wardCopy[ward.slug]
  const copyBySlug: Record<string, AreaCopy> = areaCopy
  return { ...ward, ...copy, areas: areas.map(area => ({ ...area, ...copyBySlug[area.slug] })) }
})

export function getWard(slug: string): Ward | undefined {
  return wards.find(w => w.slug === slug)
}

export function getArea(
  wardSlug: string,
  areaSlug: string
): { ward: Ward; area: Area } | undefined {
  const ward = wards.find(w => w.slug === wardSlug)
  if (!ward) return undefined
  const area = ward.areas.find(a => a.slug === areaSlug)
  if (!area) return undefined
  return { ward, area }
}

export function getAllAreas(): { ward: Ward; area: Area }[] {
  return wards.flatMap(ward => ward.areas.map(area => ({ ward, area })))
}
