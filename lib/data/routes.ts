import { wards } from "./areas"

export const canonicalRoutes = {
  home: "/",
  about: "/about/",
  services: "/services/",
  ivTherapy: "/services/iv-therapy/",
  stemCellTherapy: "/services/stem-cell-therapy/",
  medication: "/services/medication/",
  bloodTests: "/services/blood-tests/",
  areasServed: "/areas-served/",
  blog: "/blog/",
  videos: "/videos/",
  faqs: "/faqs/",
  contact: "/contact/",
  legal: "/legal/",
  privacyPolicy: "/legal/privacy-policy/",
  termsConditions: "/legal/terms-conditions/",
  medicalDisclaimer: "/legal/disclaimer/",
}

// Type for service navigation used in header
export type ServiceNavCategory = {
  name: string
  href: string
  items: { name: string; href: string }[]
}

// serviceNavigation is generated server-side and passed to Header as a prop
// This empty default is never used at runtime — the real data comes from layout.tsx

export const areaNavigation = wards.map((ward) => ({
  name: ward.name,
  nameJa: ward.nameJa,
  href: `/areas-served/${ward.slug}/`,
  areas: ward.areas.map((area) => ({
    name: area.name,
    href: `/areas-served/${ward.slug}/${area.slug}/`,
  })),
}))
