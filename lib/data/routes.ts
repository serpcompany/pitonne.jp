import { wards } from "./areas"

export const canonicalRoutes = {
  home: "/",
  about: "/about/",
  services: "/services/",
  ivTherapy: "/services/iv-therapy/",
  stemCellTherapy: "/services/stem-cell-therapy/",
  medication: "/services/medication/",
  areasServed: "/areas-served/",
  blog: "/blog/",
  contact: "/contact/",
  legal: "/legal/",
  privacyPolicy: "/legal/privacy-policy/",
  termsConditions: "/legal/terms-conditions/",
  legacyTermsConditions: "/legal/terms-and-conditions/",
  medicalDisclaimer: "/legal/disclaimer/",
}

export const serviceNavigation = [
  {
    name: "IV Therapy",
    href: canonicalRoutes.ivTherapy,
    items: [
      { name: "Exosome IV Drip", href: "/services/exosome-iv-drip/" },
      { name: "Hangover IV Drip", href: "/services/hangover-iv-drip/" },
      { name: "Energy & Fatigue Recovery", href: "/services/energy-fatigue-recovery-iv/" },
      { name: "Skin Brightening IV", href: "/services/skin-brightening-iv-drip/" },
      { name: "Immune Boost IV", href: "/services/immune-boost-iv-therapy/" },
      { name: "IV Vitamin Therapy", href: "/services/iv-vitamin-therapy/" },
    ],
  },
  {
    name: "Stem Cell Therapy",
    href: canonicalRoutes.stemCellTherapy,
    items: [{ name: "Stem Cell Nasal Spray", href: "/services/stem-cell-nasal-spray/" }],
  },
  {
    name: "Medications",
    href: canonicalRoutes.medication,
    items: [{ name: "ED Medication", href: "/services/ed-medication/" }],
  },
]

export const areaNavigation = wards.map((ward) => ({
  name: ward.name,
  nameJa: ward.nameJa,
  href: `/areas-served/${ward.slug}/`,
  areas: ward.areas.map((area) => ({
    name: area.name,
    href: `/areas-served/${ward.slug}/${area.slug}/`,
  })),
}))
