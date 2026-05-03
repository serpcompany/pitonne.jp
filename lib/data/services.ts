// Services data for dynamic routes

export interface FAQ {
  question: string
  answer: string
}

export interface Service {
  slug: string
  name: string
  category: "iv-therapy" | "stem-cell" | "medication"
  kind: "parent" | "leaf"
  parentSlug?: string
  canonicalPath: string
  contentSourcePath?: string
  imageSourcePath?: string
  shortDescription: string
  fullDescription: string
  benefits: string[]
  keyPoints: string[]
  faqs: FAQ[]
  relatedServices: string[]
  image?: string
}

export interface ServiceCategorySection {
  slug: string
  title: string
  href: string
  serviceSlugs: string[]
}

export const serviceCategorySections: ServiceCategorySection[] = [
  {
    slug: "iv-therapy",
    title: "IV Therapy",
    href: "/services/iv-therapy/",
    serviceSlugs: [
      "exosome-iv-drip",
      "hangover-iv-drip",
      "energy-fatigue-recovery-iv",
      "skin-brightening-iv-drip",
      "immune-boost-iv-therapy",
      "iv-vitamin-therapy",
    ],
  },
  {
    slug: "stem-cell-therapy",
    title: "Stem Cell Therapy",
    href: "/services/stem-cell-therapy/",
    serviceSlugs: ["stem-cell-nasal-spray"],
  },
  {
    slug: "medication",
    title: "Medications",
    href: "/services/medication/",
    serviceSlugs: ["ed-medication"],
  },
]

export const services: Service[] = [
  {
    slug: "iv-therapy",
    name: "IV Therapy",
    category: "iv-therapy",
    kind: "parent",
    canonicalPath: "/services/iv-therapy/",
    contentSourcePath: "/assets/content/pages/iv-therapy.md",
    imageSourcePath: "/images/office_iv_patient_chairs-scaled.jpg",
    image: "/images/office_iv_patient_chairs-scaled.jpg",
    shortDescription: "IV therapy delivers hydration, vitamins, and essential nutrients directly into the bloodstream for fast and effective absorption.",
    fullDescription: "IV therapy delivers hydration, vitamins, and essential nutrients directly into the bloodstream for fast and effective absorption. Our IV treatments are designed to support energy, recovery, immune health, and overall wellness. Whether you are looking to boost energy levels, recover from fatigue, improve hydration, or strengthen your immune system, our customized IV therapy options provide a convenient way to help your body perform at its best.",
    benefits: [
      "Delivers hydration and nutrients directly into the bloodstream",
      "Supports energy, recovery, and overall wellness",
      "Can help improve hydration and daily performance",
      "Offers customizable treatment options based on wellness goals"
    ],
    keyPoints: [
      "Delivers hydration and nutrients directly into the bloodstream",
      "Supports energy, recovery, and overall wellness",
      "Can help improve hydration and daily performance"
    ],
    faqs: [
      {
        question: "What is IV therapy?",
        answer: "IV therapy delivers fluids, vitamins, and nutrients directly into the bloodstream. Pitonne uses it as a physician-guided wellness option for hydration, energy, recovery, immune support, and related goals."
      },
      {
        question: "Which IV therapy options are available?",
        answer: "Pitonne's IV therapy category includes exosome IV drip, hangover IV drip, immune boost IV therapy, IV vitamin therapy, energy and fatigue recovery IV, and skin brightening IV drip."
      },
      {
        question: "How is the right IV treatment selected?",
        answer: "The care flow begins with a consultation. Your provider reviews symptoms, goals, health history, timing, and safety considerations before recommending a treatment plan."
      }
    ],
    relatedServices: [
      "exosome-iv-drip",
      "hangover-iv-drip",
      "energy-fatigue-recovery-iv",
      "immune-boost-iv-therapy",
      "iv-vitamin-therapy",
      "skin-brightening-iv-drip"
    ]
  },
  {
    slug: "stem-cell-therapy",
    name: "Stem Cell Therapy",
    category: "stem-cell",
    kind: "parent",
    canonicalPath: "/services/stem-cell-therapy/",
    contentSourcePath: "/assets/content/pages/stem-cell-therapy.md",
    imageSourcePath: "/images/content/services/akira_office_lifestyle_3-scaled.jpg",
    image: "/images/content/services/akira_office_lifestyle_3-scaled.jpg",
    shortDescription: "Stem cell therapy focuses on advanced regenerative treatments designed to support the body's natural healing and recovery processes.",
    fullDescription: "Stem cell therapy focuses on advanced regenerative treatments designed to support the body's natural healing and recovery processes. These therapies use regenerative compounds derived from stem cell sources to help promote cellular repair, improve overall wellness, and support healthy aging. Stem cell treatments may assist with recovery, vitality, and long-term health optimization through innovative regenerative medicine techniques.",
    benefits: [
      "Supports the body's natural healing processes",
      "Promotes cellular repair and recovery",
      "Supports healthy aging and vitality",
      "Helps with long-term wellness optimization"
    ],
    keyPoints: [
      "Supports the body's natural healing processes",
      "Promotes cellular repair and recovery",
      "Supports healthy aging and vitality"
    ],
    faqs: [
      {
        question: "What is stem cell therapy at Pitonne?",
        answer: "Pitonne presents stem cell therapy as regenerative wellness support using compounds derived from stem cell sources. Treatment suitability is reviewed through consultation before any plan is recommended."
      },
      {
        question: "Which stem cell related services are listed?",
        answer: "The current stem cell therapy category includes stem cell nasal spray and related regenerative wellness planning. Exosome IV drip is also connected because of its stem cell supernatant source."
      },
      {
        question: "Is stem cell therapy appropriate for everyone?",
        answer: "No. Whether a treatment is appropriate depends on your health background, goals, and provider review. Pitonne's content keeps the flow consultation-first."
      }
    ],
    relatedServices: ["stem-cell-nasal-spray", "exosome-iv-drip", "iv-therapy"]
  },
  {
    slug: "medication",
    name: "Medications",
    category: "medication",
    kind: "parent",
    canonicalPath: "/services/medication/",
    contentSourcePath: "/assets/content/pages/medications.md",
    imageSourcePath: "/images/office_exam_room-scaled.jpg",
    image: "/images/office_exam_room-scaled.jpg",
    shortDescription: "Physician-guided medication support designed around your health history, goals, and comfort.",
    fullDescription: "Our medication services focus on safe, discreet, physician-guided care for men's wellness concerns. Treatment starts with a consultation to understand symptoms, medical history, and goals so the right option can be recommended. The focus is on clear guidance, appropriate prescribing, and practical follow-up.",
    benefits: [
      "Physician-guided treatment planning",
      "Discreet support for personal health concerns",
      "Personalized recommendations based on your goals and history",
      "Clear expectations around use, timing, and follow-up",
      "Convenient prescription-based care when appropriate"
    ],
    keyPoints: [
      "Physician-guided treatment planning",
      "Discreet support for personal health concerns",
      "Personalized recommendations based on your goals and history"
    ],
    faqs: [
      {
        question: "What types of concerns can medication services help address?",
        answer: "Medication services may support men's wellness concerns such as erectile dysfunction and other issues where physician-guided prescribing may be appropriate."
      },
      {
        question: "Do I need a consultation first?",
        answer: "Yes. A consultation is important to make sure treatment is safe, appropriate, and tailored to your needs."
      },
      {
        question: "Will I receive guidance on how to use the medication?",
        answer: "Yes. Your provider explains how the treatment works, how to use it properly, what to expect, and any safety considerations."
      }
    ],
    relatedServices: ["ed-medication", "iv-therapy", "stem-cell-therapy"]
  },
  // IV Therapy Services
  {
    slug: "exosome-iv-drip",
    name: "Exosome IV Drip",
    category: "iv-therapy",
    kind: "leaf",
    parentSlug: "iv-therapy",
    canonicalPath: "/services/exosome-iv-drip/",
    contentSourcePath: "/assets/content/pages/exosome-iv-drip.md",
    imageSourcePath: "/images/content/services/office_equipment-scaled.jpg",
    image: "/images/content/services/office_equipment-scaled.jpg",
    shortDescription: "Exosome IV therapy delivers powerful regenerative factors derived from stem cell supernatant to support cellular repair, recovery, and overall wellness.",
    fullDescription: "Exosome IV therapy delivers powerful regenerative factors derived from stem cell supernatants to support cellular repair, recovery, and overall wellness. This advanced treatment may help promote healthy aging, improve energy levels, and support recovery from physical stress or injury. Exosome therapy is commonly used to enhance vitality, optimize performance, and support the body's natural healing processes.",
    benefits: [
      "Supports healthy aging",
      "Helps reduce fatigue",
      "Promotes overall wellness",
      "Supports male vitality and performance",
      "Supports recovery from injuries or physical strain"
    ],
    keyPoints: [
      "Supports healthy aging",
      "Helps reduce fatigue",
      "Promotes overall wellness"
    ],
    faqs: [
      {
        question: "What is an exosome IV drip?",
        answer: "Pitonne describes the exosome IV drip as an advanced wellness treatment that delivers regenerative factors derived from stem cell supernatant by IV. The service is positioned around support for recovery, vitality, and overall wellness."
      },
      {
        question: "What may an exosome IV drip support?",
        answer: "The page positions exosome IV therapy as support for cellular repair, recovery, energy, healthy aging, and overall wellness. Any recommendation should still be based on an individual consultation rather than a one-size-fits-all promise."
      },
      {
        question: "Is an exosome IV drip right for everyone?",
        answer: "No. This is the kind of treatment that should be reviewed with a provider first. Pitonne's current flow is consultation first, then a personalized plan if the treatment is considered appropriate for your goals and health background."
      },
      {
        question: "How is the treatment plan decided for exosome IV therapy?",
        answer: "The current page flow is consultation, personalized planning, treatment, and follow-up. That means your provider should review your symptoms, history, and expectations before recommending whether an exosome IV drip makes sense for you."
      }
    ],
    relatedServices: ["iv-therapy", "hangover-iv-drip", "energy-fatigue-recovery-iv"]
  },
  {
    slug: "hangover-iv-drip",
    name: "Hangover IV Drip",
    category: "iv-therapy",
    kind: "leaf",
    parentSlug: "iv-therapy",
    canonicalPath: "/services/hangover-iv-drip/",
    contentSourcePath: "/assets/content/pages/hangover-iv-drip.md",
    imageSourcePath: "/images/content/services/office_patient_room-scaled.jpg",
    image: "/images/content/services/office_patient_room-scaled.jpg",
    shortDescription: "Hangover IV therapy delivers rapid hydration, vitamins, and electrolytes directly into the bloodstream to help relieve common hangover symptoms.",
    fullDescription: "Hangover IV therapy delivers rapid hydration, vitamins, and electrolytes directly into the bloodstream to help relieve common hangover symptoms. This treatment may help reduce nausea, headaches, fatigue, and dehydration while supporting faster recovery after alcohol consumption. Hangover IV drips are a fast and effective way to restore energy and help you feel better quickly.",
    benefits: [
      "Rehydrates the body",
      "Helps reduce nausea and headaches",
      "Helps relieve fatigue and weakness",
      "Supports alcohol metabolism",
      "Supports faster recovery after drinking"
    ],
    keyPoints: [
      "Rehydrates the body",
      "Helps reduce nausea and headaches",
      "Helps relieve fatigue and weakness"
    ],
    faqs: [
      {
        question: "What is a hangover IV drip?",
        answer: "A hangover IV drip is a hydration-focused IV treatment designed to deliver fluids, vitamins, and electrolytes directly into the bloodstream. Pitonne positions it as fast support for common hangover symptoms such as dehydration, fatigue, headache, and nausea."
      },
      {
        question: "What symptoms can a hangover IV drip help support?",
        answer: "The current page says the treatment may help with dehydration, nausea, headaches, fatigue, and general weakness after alcohol consumption. It is intended as recovery support, not a substitute for medical evaluation if symptoms are severe."
      },
      {
        question: "How long does a hangover IV appointment take?",
        answer: "The exact timing depends on your treatment plan, but the visit normally includes a consultation, the IV session, and brief aftercare guidance. Pitonne reviews timing and expectations before treatment begins."
      },
      {
        question: "Should I still drink water after a hangover IV?",
        answer: "Yes. The service page already advises patients to stay hydrated and follow provider guidance after treatment. A hangover IV can be part of recovery support, but rest, hydration, and follow-up instructions still matter."
      }
    ],
    relatedServices: ["iv-therapy", "energy-fatigue-recovery-iv", "iv-vitamin-therapy"]
  },
  {
    slug: "immune-boost-iv-therapy",
    name: "Immune Boost IV Therapy",
    category: "iv-therapy",
    kind: "leaf",
    parentSlug: "iv-therapy",
    canonicalPath: "/services/immune-boost-iv-therapy/",
    contentSourcePath: "/assets/content/pages/immune-boost-iv-therapy.md",
    imageSourcePath: "/images/content/services/office_patient_room_3-scaled.jpg",
    image: "/images/content/services/office_patient_room_3-scaled.jpg",
    shortDescription: "Immune boost IV therapy provides high-quality vitamins, antioxidants, and hydration designed to support immune system health.",
    fullDescription: "Immune boost IV therapy provides high-quality vitamins, antioxidants, and hydration designed to support immune system health. This treatment may help the body defend against illness, improve recovery from fatigue, and strengthen overall wellness. Many patients use immune IV therapy during seasonal changes or times of increased stress to help maintain optimal health.",
    benefits: [
      "Supports immune function",
      "Supports recovery from fatigue",
      "Helps the body during seasonal changes",
      "Helps support the body against illness"
    ],
    keyPoints: [
      "Supports immune function",
      "Supports recovery from fatigue",
      "Helps the body during seasonal changes"
    ],
    faqs: [
      {
        question: "What is immune boost IV therapy?",
        answer: "Immune boost IV therapy is a hydration and nutrient-based IV treatment designed to support immune system health. Pitonne positions it as wellness support during busy periods, seasonal changes, fatigue, or times when you want extra recovery support."
      },
      {
        question: "When do people usually consider immune boost IV therapy?",
        answer: "The current page says many patients use it during seasonal changes or periods of increased stress. It is framed as general wellness support, with recommendations tailored through a provider consultation."
      },
      {
        question: "How long does immune boost IV therapy take?",
        answer: "The exact timing depends on the formula and the treatment plan, but visits usually include consultation, IV treatment, and follow-up guidance. Pitonne reviews the details before treatment begins."
      },
      {
        question: "Is immune boost IV therapy a substitute for regular medical care?",
        answer: "No. It should be presented as supportive wellness care, not a replacement for ongoing medical care, diagnosis, or treatment. If you are dealing with significant symptoms or a current illness, that should be discussed directly with a provider."
      }
    ],
    relatedServices: ["iv-therapy", "energy-fatigue-recovery-iv", "iv-vitamin-therapy"]
  },
  {
    slug: "iv-vitamin-therapy",
    name: "IV Vitamin Therapy",
    category: "iv-therapy",
    kind: "leaf",
    parentSlug: "iv-therapy",
    canonicalPath: "/services/iv-vitamin-therapy/",
    contentSourcePath: "/assets/content/pages/iv-vitamin-therapy.md",
    imageSourcePath: "/images/content/services/office_equipment_2-scaled.jpg",
    image: "/images/content/services/office_equipment_2-scaled.jpg",
    shortDescription: "IV vitamin therapy delivers essential vitamins, minerals, and hydration directly into the bloodstream for maximum absorption and effectiveness.",
    fullDescription: "IV vitamin therapy delivers essential vitamins, minerals, and hydration directly into the bloodstream for maximum absorption and effectiveness. This treatment may help improve energy levels, support immune function, and promote overall wellness. IV vitamin therapy is commonly used to support recovery, boost vitality, and help maintain optimal health.",
    benefits: [
      "Helps improve energy levels and reduce fatigue",
      "Supports immune system health",
      "Provides essential vitamins and nutrients for overall wellness",
      "Promotes faster hydration and nutrient absorption",
      "Helps support recovery from stress, travel, or illness",
      "May improve mental clarity and focus",
      "Supports healthy metabolism and cellular function",
      "Helps maintain optimal vitamin and nutrient levels",
      "Promotes overall vitality and well-being"
    ],
    keyPoints: [
      "Helps improve energy levels and reduce fatigue",
      "Supports immune system health",
      "Provides essential vitamins and nutrients for overall wellness"
    ],
    faqs: [
      {
        question: "What is IV vitamin therapy?",
        answer: "IV vitamin therapy delivers vitamins, minerals, and hydration directly into the bloodstream for fast absorption. Pitonne presents it as a physician-guided wellness treatment for energy, recovery, immune support, and overall vitality."
      },
      {
        question: "What can IV vitamin therapy support?",
        answer: "The page positions IV vitamin therapy as support for energy levels, hydration, recovery, immune function, mental clarity, and overall wellness. Your provider can match the treatment to your goals after reviewing your needs."
      },
      {
        question: "How is IV vitamin therapy different from a standard hydration drip?",
        answer: "A standard hydration-focused IV is mainly about fluids and electrolytes, while IV vitamin therapy is positioned around added vitamins and nutrients for broader wellness support. The best option depends on whether your main goal is hydration, recovery, energy, or a more customized blend."
      },
      {
        question: "How often should I get IV vitamin therapy?",
        answer: "Frequency depends on your goals, daily routine, and provider guidance. Pitonne's current service flow is consultation first, then a personalized plan that covers timing, expectations, and follow-up."
      }
    ],
    relatedServices: ["iv-therapy", "energy-fatigue-recovery-iv", "immune-boost-iv-therapy"]
  },
  {
    slug: "energy-fatigue-recovery-iv",
    name: "Energy & Fatigue Recovery IV",
    category: "iv-therapy",
    kind: "leaf",
    parentSlug: "iv-therapy",
    canonicalPath: "/services/energy-fatigue-recovery-iv/",
    contentSourcePath: "/assets/content/pages/energy-fatigue-recovery-iv.md",
    imageSourcePath: "/images/content/services/office_iv_patient_chairs_2-scaled.jpg",
    image: "/images/content/services/office_iv_patient_chairs_2-scaled.jpg",
    shortDescription: "Energy and fatigue recovery IV therapy provides a powerful blend of hydration, vitamins, and nutrients designed to help restore energy levels and reduce tiredness.",
    fullDescription: "Energy and fatigue recovery IV therapy provides a powerful blend of hydration, vitamins, and nutrients designed to help restore energy levels and reduce tiredness. This treatment may support mental clarity, improve focus, and promote faster recovery from physical or mental fatigue. Many patients choose this IV drip to boost daily performance and overall wellness.",
    benefits: [
      "Helps reduce fatigue",
      "Supports energy levels",
      "Helps relieve tiredness and weakness",
      "Supports focus and performance",
      "Promotes overall recovery and wellness"
    ],
    keyPoints: [
      "Helps reduce fatigue",
      "Supports energy levels",
      "Helps relieve tiredness and weakness"
    ],
    faqs: [
      {
        question: "What is Energy & Fatigue Recovery IV therapy?",
        answer: "Energy & Fatigue Recovery IV therapy is a hydration and nutrient-based IV treatment designed to support energy levels and reduce tiredness. Pitonne positions it as a wellness option for people who want help with fatigue, focus, and recovery."
      },
      {
        question: "Who may be a good candidate for Energy & Fatigue Recovery IV?",
        answer: "The page speaks to people dealing with low energy, tiredness, mental fatigue, or a heavy routine. The right fit still depends on a provider review of your symptoms, health history, and overall wellness goals."
      },
      {
        question: "How quickly might I feel the effects?",
        answer: "Response times vary from person to person. Pitonne's current copy keeps the promise broad: support for energy, clarity, and recovery, with expectations reviewed during the consultation and personalized planning step."
      },
      {
        question: "How often can I get an Energy & Fatigue Recovery IV?",
        answer: "That depends on why you are using it and how your provider wants to structure your plan. Some patients may use it occasionally, while others may be guided toward a schedule that fits their wellness routine."
      }
    ],
    relatedServices: ["iv-therapy", "immune-boost-iv-therapy", "iv-vitamin-therapy"]
  },
  {
    slug: "skin-brightening-iv-drip",
    name: "Skin Brightening IV Drip",
    category: "iv-therapy",
    kind: "leaf",
    parentSlug: "iv-therapy",
    canonicalPath: "/services/skin-brightening-iv-drip/",
    contentSourcePath: "/assets/content/pages/skin-brightening-iv-drip.md",
    imageSourcePath: "/images/content/services/aic_office_reception_5-scaled.jpg",
    image: "/images/content/services/aic_office_reception_5-scaled.jpg",
    shortDescription: "Skin brightening IV therapy delivers antioxidants and skin-supporting nutrients directly into the bloodstream to help promote clearer, healthier-looking skin.",
    fullDescription: "Skin brightening IV therapy delivers antioxidants and skin-supporting nutrients directly into the bloodstream to help promote clearer, healthier-looking skin. This treatment may support skin repair, improve skin tone, and protect against environmental stressors such as sun exposure. Many patients use skin brightening IV drips to support radiant skin and overall skin wellness.",
    benefits: [
      "Supports skin recovery before and after sun exposure",
      "Helps promote brighter looking skin",
      "Provides antioxidant support",
      "Supports overall skin wellness",
      "Helps maintain healthy looking skin"
    ],
    keyPoints: [
      "Supports skin recovery before and after sun exposure",
      "Helps promote brighter looking skin",
      "Provides antioxidant support"
    ],
    faqs: [
      {
        question: "What is a skin brightening IV drip?",
        answer: "Skin brightening IV therapy is described on the page as an antioxidant and nutrient IV treatment intended to support clearer, healthier-looking skin. Pitonne presents it as part of an overall skin-wellness approach rather than a standalone miracle fix."
      },
      {
        question: "What may a skin brightening IV drip support?",
        answer: "The current page says it may support skin repair, skin tone, antioxidant protection, and overall skin wellness. It is framed as supportive care for a brighter, healthier-looking result."
      },
      {
        question: "Is a skin brightening IV drip a replacement for skincare or sun protection?",
        answer: "No. The safest positioning is that it can be one part of a broader routine. Daily skincare, sun protection, and provider guidance still matter if your goal is long-term skin health."
      },
      {
        question: "How often do patients usually consider skin brightening IV therapy?",
        answer: "That varies based on the person's goals and provider recommendations. Pitonne's page flow is consultation first, then a personalized plan based on your needs, timing, and expected results."
      }
    ],
    relatedServices: ["iv-therapy", "immune-boost-iv-therapy", "iv-vitamin-therapy"]
  },
  // Stem Cell Services
  {
    slug: "stem-cell-nasal-spray",
    name: "Stem Cell Nasal Spray",
    category: "stem-cell",
    kind: "leaf",
    parentSlug: "stem-cell-therapy",
    canonicalPath: "/services/stem-cell-nasal-spray/",
    contentSourcePath: "/assets/content/pages/stem-cell-nasal-spray.md",
    imageSourcePath: "/images/content/services/akira_office_lifestyle_4-scaled.jpg",
    image: "/images/content/services/akira_office_lifestyle_4-scaled.jpg",
    shortDescription: "Stem cell nasal spray delivers regenerative factors through a convenient nasal application to support brain health, cognitive function, and overall wellness.",
    fullDescription: "Stem cell nasal spray delivers regenerative factors through a convenient nasal application to support brain health, cognitive function, and overall wellness. This innovative treatment may help improve mental clarity, support memory function, and promote neurological health. The nasal delivery method allows for efficient absorption and is part of our comprehensive stem cell therapy options.",
    benefits: [
      "Supports brain health and cognitive function",
      "May help improve mental clarity",
      "Supports memory function",
      "Promotes neurological wellness",
      "Convenient nasal application"
    ],
    keyPoints: [
      "Supports brain health and cognitive function",
      "May help improve mental clarity",
      "Convenient nasal application"
    ],
    faqs: [
      {
        question: "What is stem cell nasal spray?",
        answer: "Stem cell nasal spray is a treatment that delivers regenerative factors through nasal application. It is designed to support brain health, cognitive function, and overall neurological wellness."
      },
      {
        question: "How does stem cell nasal spray work?",
        answer: "The nasal delivery method allows regenerative factors to be absorbed efficiently. Your provider will explain the mechanism and what to expect during your consultation."
      },
      {
        question: "Who may benefit from stem cell nasal spray?",
        answer: "This treatment may be considered by those interested in supporting cognitive function, mental clarity, or neurological health. A consultation helps determine if it is appropriate for your goals."
      },
      {
        question: "How often is stem cell nasal spray used?",
        answer: "Frequency depends on your treatment plan and provider recommendations. The consultation process includes discussion of timing and expected outcomes."
      }
    ],
    relatedServices: ["stem-cell-therapy", "exosome-iv-drip"]
  },
  // Medication Services
  {
    slug: "ed-medication",
    name: "ED Medication",
    category: "medication",
    kind: "leaf",
    parentSlug: "medication",
    canonicalPath: "/services/ed-medication/",
    contentSourcePath: "/assets/content/pages/ed-medication.md",
    imageSourcePath: "/images/content/services/akira_office_lifestyle_1-scaled.jpg",
    image: "/images/content/services/akira_office_lifestyle_1-scaled.jpg",
    shortDescription: "Prescription ED medication such as Viagra or Cialis helps improve blood flow and support healthy erectile function.",
    fullDescription: "Prescription ED medication such as Viagra or Cialis helps improve blood flow and support healthy erectile function. This treatment may help men achieve and maintain a stronger, longer-lasting erection while improving sexual confidence and performance. Our providers offer discreet consultations and personalized treatment plans to ensure safe, effective results tailored to your individual needs.",
    benefits: [
      "Supports erectile function",
      "Helps improve blood flow for sexual performance",
      "May help achieve and maintain an erection",
      "Supports confidence and intimacy",
      "Convenient treatment option tailored to individual needs"
    ],
    keyPoints: [
      "Supports erectile function",
      "Helps improve blood flow for sexual performance",
      "Discreet consultations available"
    ],
    faqs: [
      {
        question: "What is ED medication?",
        answer: "ED medication is prescription treatment intended to support healthy erectile function by improving blood flow. At Pitonne, it is offered through a discreet consultation and a personalized plan rather than as a generic over-the-counter recommendation."
      },
      {
        question: "How long does ED medication take to work?",
        answer: "Timing can vary depending on the medication, the dose, and the individual patient. During the consultation, your provider can explain what to expect for onset, duration, and how the treatment may fit into your routine."
      },
      {
        question: "Is ED medication safe for everyone?",
        answer: "Not always. Whether ED medication is appropriate depends on your health history, symptoms, and any other medications you are taking. That is why Pitonne uses a physician-guided review before recommending treatment."
      },
      {
        question: "How do I know which ED medication is right for me?",
        answer: "The best option depends on your goals, medical background, and treatment preferences. The consultation is used to recommend a plan that is intended to be safe, effective, and tailored to the individual."
      }
    ],
    relatedServices: ["medication"]
  }
]

export function getService(slug: string): Service | undefined {
  return services.find(s => s.slug === slug)
}

export function getServicesFromSlugs(slugs: string[]): Service[] {
  return slugs.map((slug) => getService(slug)).filter((service): service is Service => Boolean(service))
}

export function getServicesByCategory(category: Service["category"]): Service[] {
  return services.filter(s => s.category === category && s.kind === "leaf")
}

export function getParentServices(): Service[] {
  return services.filter(s => s.kind === "parent")
}

export function getChildServices(parentSlug: string): Service[] {
  return services.filter(s => s.parentSlug === parentSlug)
}

export function getServiceCategorySections(): Array<ServiceCategorySection & { services: Service[] }> {
  return serviceCategorySections.map((section) => ({
    ...section,
    services: getServicesFromSlugs(section.serviceSlugs),
  }))
}

export function getAllServiceSlugs(): string[] {
  return services.map(s => s.slug)
}
