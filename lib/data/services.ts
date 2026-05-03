export interface Service {
  slug: string
  name: string
  category: "iv-therapy" | "stem-cell" | "medication"
  shortDescription: string
  fullDescription: string
  benefits: string[]
  duration: string
  price?: string
  idealFor: string[]
  process: string[]
}

export const services: Service[] = [
  // IV Therapy Services
  {
    slug: "exosome-iv-drip",
    name: "Exosome IV Drip",
    category: "iv-therapy",
    shortDescription: "Advanced cellular regeneration therapy using exosome technology for anti-aging and tissue repair.",
    fullDescription: "Our Exosome IV Drip harnesses the power of exosomes—tiny vesicles that facilitate cell-to-cell communication—to promote cellular regeneration and repair. This cutting-edge therapy delivers concentrated exosomes directly into your bloodstream, supporting your body's natural healing processes and promoting overall rejuvenation.",
    benefits: [
      "Promotes cellular regeneration and repair",
      "Supports anti-aging at the cellular level",
      "Enhances tissue recovery and healing",
      "Improves skin elasticity and appearance",
      "Boosts overall cellular communication",
      "Supports immune system function"
    ],
    duration: "60-90 minutes",
    idealFor: [
      "Those seeking anti-aging solutions",
      "Post-surgery recovery support",
      "Athletic recovery and performance",
      "General cellular health optimization"
    ],
    process: [
      "Initial consultation and health assessment",
      "Preparation of personalized exosome solution",
      "Comfortable IV administration in private setting",
      "Post-treatment monitoring and care instructions"
    ]
  },
  {
    slug: "hangover-iv-drip",
    name: "Hangover IV Drip",
    category: "iv-therapy",
    shortDescription: "Rapid recovery from hangover symptoms with hydration, vitamins, and anti-nausea medication.",
    fullDescription: "Our Hangover IV Drip is designed to rapidly alleviate the symptoms of overindulgence. This powerful combination of fluids, electrolytes, vitamins, and anti-nausea medication works quickly to restore your body's balance, helping you feel better within 30-45 minutes of treatment.",
    benefits: [
      "Rapid rehydration",
      "Immediate relief from nausea and headache",
      "Restoration of essential electrolytes",
      "B-vitamin complex for energy",
      "Antioxidants to neutralize toxins",
      "Quick return to normal functioning"
    ],
    duration: "30-45 minutes",
    idealFor: [
      "Morning after a night out",
      "Business professionals with early meetings",
      "Travelers recovering from long flights with alcohol",
      "Anyone needing quick hangover relief"
    ],
    process: [
      "Brief symptom assessment",
      "Customized IV formula preparation",
      "Quick and comfortable administration",
      "Feel better in under an hour"
    ]
  },
  {
    slug: "immune-boost-iv-therapy",
    name: "Immune Boost IV Therapy",
    category: "iv-therapy",
    shortDescription: "Strengthen your immune system with high-dose vitamins and minerals delivered directly to your bloodstream.",
    fullDescription: "Our Immune Boost IV Therapy delivers a powerful combination of immune-supporting nutrients directly into your bloodstream for maximum absorption. High-dose Vitamin C, zinc, B-vitamins, and other essential nutrients work together to strengthen your body's natural defenses.",
    benefits: [
      "High-dose Vitamin C for immune support",
      "Zinc for enhanced immune response",
      "B-vitamins for energy and metabolism",
      "Glutathione for antioxidant protection",
      "Faster recovery from illness",
      "Prevention support during cold and flu season"
    ],
    duration: "45-60 minutes",
    idealFor: [
      "Cold and flu season preparation",
      "Frequent travelers",
      "Those recovering from illness",
      "Anyone with weakened immune function"
    ],
    process: [
      "Health assessment and consultation",
      "Custom immune formula preparation",
      "Relaxed IV administration",
      "Follow-up care recommendations"
    ]
  },
  {
    slug: "iv-vitamin-therapy",
    name: "IV Vitamin Therapy",
    category: "iv-therapy",
    shortDescription: "Comprehensive vitamin infusion for optimal health, energy, and wellbeing.",
    fullDescription: "Our IV Vitamin Therapy provides a comprehensive blend of essential vitamins and minerals delivered directly to your cells. By bypassing the digestive system, IV administration ensures 100% absorption, making this treatment far more effective than oral supplements.",
    benefits: [
      "100% vitamin absorption",
      "Increased energy levels",
      "Improved mental clarity",
      "Enhanced skin health",
      "Better sleep quality",
      "Overall wellness optimization"
    ],
    duration: "45-60 minutes",
    idealFor: [
      "Those with nutrient deficiencies",
      "Busy professionals seeking optimization",
      "Anyone with digestive absorption issues",
      "General health maintenance"
    ],
    process: [
      "Nutritional assessment",
      "Personalized vitamin blend creation",
      "Comfortable IV administration",
      "Ongoing wellness plan discussion"
    ]
  },
  {
    slug: "energy-fatigue-recovery-iv",
    name: "Energy & Fatigue Recovery IV",
    category: "iv-therapy",
    shortDescription: "Combat chronic fatigue and boost your energy levels with targeted nutrient therapy.",
    fullDescription: "Our Energy & Fatigue Recovery IV is specifically formulated to combat tiredness and restore your natural vitality. This treatment combines B-vitamins, amino acids, and other energy-supporting nutrients to help you overcome fatigue and feel refreshed.",
    benefits: [
      "Immediate energy boost",
      "Combat chronic fatigue",
      "Improved mental alertness",
      "Enhanced physical performance",
      "Better stress management",
      "Sustained energy throughout the day"
    ],
    duration: "45-60 minutes",
    idealFor: [
      "Those experiencing chronic fatigue",
      "Jet lag recovery",
      "High-stress professionals",
      "Athletes needing recovery support"
    ],
    process: [
      "Energy and fatigue assessment",
      "Customized energy formula",
      "Relaxing IV session",
      "Energy maintenance recommendations"
    ]
  },
  {
    slug: "skin-brightening-iv-drip",
    name: "Skin Brightening IV Drip",
    category: "iv-therapy",
    shortDescription: "Achieve radiant, glowing skin from within with our premium glutathione-based IV treatment.",
    fullDescription: "Our Skin Brightening IV Drip delivers high-dose glutathione and Vitamin C directly into your bloodstream for maximum skin benefits. This powerful antioxidant combination works from within to brighten your complexion, reduce pigmentation, and promote a healthy, radiant glow.",
    benefits: [
      "Brighter, more even skin tone",
      "Reduced hyperpigmentation",
      "Powerful antioxidant protection",
      "Anti-aging benefits",
      "Improved skin elasticity",
      "Natural, healthy glow"
    ],
    duration: "45-60 minutes",
    idealFor: [
      "Those seeking brighter skin tone",
      "Hyperpigmentation concerns",
      "Anti-aging skincare",
      "Pre-event skin preparation"
    ],
    process: [
      "Skin assessment consultation",
      "Glutathione IV preparation",
      "Comfortable treatment session",
      "Skincare maintenance advice"
    ]
  },
  // Stem Cell Services
  {
    slug: "stem-cell-nasal-spray",
    name: "Stem Cell Nasal Spray",
    category: "stem-cell",
    shortDescription: "Innovative stem cell delivery through nasal application for cognitive and neurological support.",
    fullDescription: "Our Stem Cell Nasal Spray offers an innovative approach to stem cell therapy, delivering regenerative factors directly through the nasal passage for optimal absorption. This non-invasive treatment supports cognitive function, neurological health, and overall cellular regeneration.",
    benefits: [
      "Non-invasive stem cell delivery",
      "Supports cognitive function",
      "Promotes neurological health",
      "Easy at-home application",
      "No downtime required",
      "Supports overall cellular health"
    ],
    duration: "Initial consultation: 30 minutes, Application: 5 minutes daily",
    idealFor: [
      "Those seeking cognitive support",
      "Non-invasive stem cell therapy seekers",
      "Busy individuals wanting convenient treatment",
      "Those interested in preventive health"
    ],
    process: [
      "Comprehensive health consultation",
      "Personalized treatment plan creation",
      "Nasal spray provision and training",
      "Follow-up monitoring and support"
    ]
  },
  // Medication Services
  {
    slug: "ed-medication",
    name: "ED Medication",
    category: "medication",
    shortDescription: "Discreet, professional consultation and prescription for erectile dysfunction medication.",
    fullDescription: "We provide discreet, professional consultations for erectile dysfunction medication. Our licensed physicians offer confidential assessments and can prescribe appropriate ED medications tailored to your health profile and needs. All consultations are private, and medications are delivered discreetly.",
    benefits: [
      "Confidential consultation",
      "Licensed physician assessment",
      "Multiple medication options",
      "Discreet delivery",
      "Ongoing support available",
      "No awkward pharmacy visits"
    ],
    duration: "15-30 minute consultation",
    idealFor: [
      "Men experiencing ED symptoms",
      "Those seeking discreet treatment",
      "Busy professionals wanting convenience",
      "Anyone preferring private consultations"
    ],
    process: [
      "Confidential health questionnaire",
      "Private physician consultation",
      "Prescription if appropriate",
      "Discreet medication delivery"
    ]
  }
]

export function getService(slug: string): Service | undefined {
  return services.find(s => s.slug === slug)
}

export function getServicesByCategory(category: Service["category"]): Service[] {
  return services.filter(s => s.category === category)
}
