export interface Area {
  slug: string
  name: string
  nameJa: string
  description: string
  highlights: string[]
  landmarks: string[]
}

export interface Ward {
  slug: string
  name: string
  nameJa: string
  description: string
  areas: Area[]
}

export const wards: Ward[] = [
  {
    slug: "minato",
    name: "Minato",
    nameJa: "港区",
    description: "Minato is one of Tokyo's most prestigious wards, home to embassies, international businesses, and upscale residential areas. Our Nishi Azabu clinic is centrally located in Minato, providing convenient access to premium IV therapy and stem cell treatments.",
    areas: [
      {
        slug: "roppongi",
        name: "Roppongi",
        nameJa: "六本木",
        description: "Roppongi is Tokyo's premier entertainment and nightlife district, known for its vibrant clubs, international dining, and the iconic Roppongi Hills complex. Business professionals and travelers often seek our hangover IV drips and energy recovery treatments after late nights in this dynamic neighborhood.",
        highlights: [
          "5-minute drive from our Nishi Azabu clinic",
          "Popular among business travelers and expats",
          "24/7 hotel visit availability",
          "Quick response times for urgent requests"
        ],
        landmarks: ["Roppongi Hills", "Tokyo Midtown", "National Art Center"]
      },
      {
        slug: "azabu-juban",
        name: "Azabu Juban",
        nameJa: "麻布十番",
        description: "Azabu Juban is a charming neighborhood blending traditional Tokyo atmosphere with modern sophistication. Home to long-established shops and trendy cafes, this area attracts discerning residents who appreciate our discreet, personalized wellness services.",
        highlights: [
          "Walking distance from our clinic",
          "Discreet residential visits available",
          "Popular for skin brightening treatments",
          "Quiet, professional service environment"
        ],
        landmarks: ["Azabu Juban Shopping Street", "Zenpukuji Temple", "Ichinohashi Park"]
      },
      {
        slug: "hiroo",
        name: "Hiroo",
        nameJa: "広尾",
        description: "Hiroo is an upscale residential area popular with international families and embassy staff. The neighborhood's peaceful atmosphere and proximity to international schools makes it ideal for our wellness consultation services.",
        highlights: [
          "Adjacent to our Nishi Azabu location",
          "Many international residents",
          "Family-friendly wellness services",
          "Immune boost treatments popular here"
        ],
        landmarks: ["Arisugawa-no-miya Memorial Park", "National Azabu Supermarket", "Hiroo Station"]
      },
      {
        slug: "akasaka",
        name: "Akasaka",
        nameJa: "赤坂",
        description: "Akasaka is a major business and entertainment district, home to TBS headquarters, luxury hotels, and numerous corporate offices. Business executives frequently request our IV vitamin therapy and fatigue recovery treatments for maintaining peak performance.",
        highlights: [
          "10-minute drive from our clinic",
          "Corporate wellness programs available",
          "Hotel visits to major chains",
          "Energy IV drips for busy professionals"
        ],
        landmarks: ["Akasaka Sacas", "The Capitol Hotel Tokyu", "Hie Shrine"]
      },
      {
        slug: "toranomon",
        name: "Toranomon",
        nameJa: "虎ノ門",
        description: "Toranomon is Tokyo's newest business hub, featuring modern skyscrapers and the innovative Toranomon Hills development. The area's corporate professionals value our efficient, discreet IV therapy services delivered directly to their offices or hotels.",
        highlights: [
          "15-minute drive from clinic",
          "Office visit services available",
          "Popular with finance professionals",
          "Immune boost and vitamin IVs in demand"
        ],
        landmarks: ["Toranomon Hills", "Andaz Tokyo", "Atago Shrine"]
      },
      {
        slug: "shimbashi",
        name: "Shimbashi",
        nameJa: "新橋",
        description: "Shimbashi is known as the quintessential Japanese salaryman district, with countless izakayas and bars serving after-work crowds. Our hangover IV drip service is particularly popular among Shimbashi's hardworking professionals.",
        highlights: [
          "15-minute drive from clinic",
          "Hangover IV drips highly requested",
          "Early morning appointments available",
          "Quick recovery treatments"
        ],
        landmarks: ["Shimbashi Station SL Plaza", "Shiodome City Center", "Hamarikyu Gardens"]
      }
    ]
  },
  {
    slug: "shibuya",
    name: "Shibuya",
    nameJa: "渋谷区",
    description: "Shibuya ward is the heart of Tokyo's youth culture, fashion, and technology scenes. From the famous Shibuya Crossing to the trendy streets of Harajuku, this dynamic ward attracts visitors and residents who appreciate our modern approach to wellness.",
    areas: [
      {
        slug: "ebisu",
        name: "Ebisu",
        nameJa: "恵比寿",
        description: "Ebisu is a sophisticated neighborhood known for its excellent restaurants, craft beer scene, and relaxed atmosphere. Young professionals living here often choose our skin brightening and vitamin IV treatments.",
        highlights: [
          "12-minute drive from clinic",
          "Popular with young professionals",
          "Skin and beauty IVs in demand",
          "Weekend appointments available"
        ],
        landmarks: ["Yebisu Garden Place", "Tokyo Metropolitan Museum of Photography", "Ebisu Yokocho"]
      },
      {
        slug: "hiroo",
        name: "Hiroo",
        nameJa: "広尾",
        description: "The Shibuya side of Hiroo maintains the same upscale, international character as its Minato counterpart. Residents here enjoy convenient access to our full range of IV therapy and wellness services.",
        highlights: [
          "10-minute drive from clinic",
          "International community",
          "All services available",
          "Discreet home visits"
        ],
        landmarks: ["Hiroo Garden Hills", "Sacred Heart International School", "Hiroo Plaza"]
      },
      {
        slug: "daikanyama",
        name: "Daikanyama",
        nameJa: "代官山",
        description: "Daikanyama is Tokyo's most fashionable neighborhood, filled with designer boutiques, architecturally stunning buildings, and sophisticated cafes. The area's style-conscious residents appreciate our aesthetic-focused treatments.",
        highlights: [
          "15-minute drive from clinic",
          "Fashion and creative industry clients",
          "Skin brightening popular",
          "Discrete, premium service"
        ],
        landmarks: ["Daikanyama T-Site", "Hillside Terrace", "LOG ROAD DAIKANYAMA"]
      },
      {
        slug: "yoyogi",
        name: "Yoyogi",
        nameJa: "代々木",
        description: "Yoyogi offers a perfect blend of nature and urban convenience, anchored by the vast Yoyogi Park. Athletes and fitness enthusiasts in the area frequently request our energy recovery and immune boost treatments.",
        highlights: [
          "20-minute drive from clinic",
          "Popular with athletes",
          "Recovery IVs after training",
          "Immune support treatments"
        ],
        landmarks: ["Yoyogi Park", "Meiji Shrine", "NHK Broadcasting Center"]
      },
      {
        slug: "omotesando",
        name: "Omotesando",
        nameJa: "表参道",
        description: "Omotesando is Tokyo's Champs-Élysées, lined with flagship stores from the world's top fashion brands. The area's discerning clientele appreciates our premium wellness services and aesthetic treatments.",
        highlights: [
          "18-minute drive from clinic",
          "Luxury retail district",
          "Beauty and skin treatments",
          "High-end hotel visits"
        ],
        landmarks: ["Omotesando Hills", "Nezu Museum", "Cat Street"]
      },
      {
        slug: "sendagaya",
        name: "Sendagaya",
        nameJa: "千駄ヶ谷",
        description: "Sendagaya is home to the Japan National Stadium and numerous sports facilities. Athletes and sports professionals in this area frequently use our recovery IV treatments and performance support services.",
        highlights: [
          "25-minute drive from clinic",
          "Olympic venue area",
          "Athletic recovery focus",
          "Team wellness programs"
        ],
        landmarks: ["Japan National Stadium", "Tokyo Metropolitan Gymnasium", "Shogi Hall"]
      },
      {
        slug: "harajuku",
        name: "Harajuku",
        nameJa: "原宿",
        description: "Harajuku is the global center of Japanese street fashion and youth culture. The creative energy of this neighborhood attracts young professionals who value our modern approach to health and wellness.",
        highlights: [
          "20-minute drive from clinic",
          "Youth and creative industries",
          "Vitamin and energy IVs",
          "Flexible scheduling"
        ],
        landmarks: ["Takeshita Street", "Laforet Harajuku", "Meiji Jingu"]
      },
      {
        slug: "yoyogi-uehara",
        name: "Yoyogi Uehara",
        nameJa: "代々木上原",
        description: "Yoyogi Uehara is a quiet, upscale residential neighborhood known for its excellent restaurants and peaceful atmosphere. Residents here appreciate our discreet home visit services.",
        highlights: [
          "25-minute drive from clinic",
          "Quiet residential area",
          "Home visit specialists",
          "All treatments available"
        ],
        landmarks: ["Tokyo Camii Mosque", "Komaba Park", "Uehara Station"]
      }
    ]
  },
  {
    slug: "chuo",
    name: "Chuo",
    nameJa: "中央区",
    description: "Chuo ward is Tokyo's historic commercial heart, encompassing the luxury shopping district of Ginza and the traditional market area of Tsukiji. Business travelers and tourists in this central location benefit from our convenient IV therapy services.",
    areas: [
      {
        slug: "ginza",
        name: "Ginza",
        nameJa: "銀座",
        description: "Ginza is Tokyo's most prestigious shopping and entertainment district, home to department stores, galleries, and Michelin-starred restaurants. Visitors staying at Ginza's luxury hotels frequently request our concierge wellness services.",
        highlights: [
          "20-minute drive from clinic",
          "Luxury hotel partnerships",
          "Tourist and business traveler focus",
          "Same-day appointments"
        ],
        landmarks: ["Ginza Six", "Mitsukoshi Department Store", "Kabukiza Theatre"]
      },
      {
        slug: "nihonbashi",
        name: "Nihonbashi",
        nameJa: "日本橋",
        description: "Nihonbashi is Tokyo's historic commercial center, now a major financial district. The area's corporate professionals value our efficient IV therapy services for maintaining their demanding schedules.",
        highlights: [
          "25-minute drive from clinic",
          "Financial district",
          "Corporate wellness programs",
          "Office visit available"
        ],
        landmarks: ["Nihonbashi Bridge", "Coredo Muromachi", "Bank of Japan"]
      },
      {
        slug: "hatchobori",
        name: "Hatchobori",
        nameJa: "八丁堀",
        description: "Hatchobori is a business district with excellent transportation access, popular with companies and hotels. Our IV therapy services are readily available to this convenient central Tokyo location.",
        highlights: [
          "25-minute drive from clinic",
          "Business hotel area",
          "Transportation hub",
          "Quick service delivery"
        ],
        landmarks: ["Hatchobori Station", "Kayabacho Business District", "Sakuragawa Park"]
      },
      {
        slug: "tsukiji",
        name: "Tsukiji",
        nameJa: "築地",
        description: "Tsukiji remains a culinary destination even after the wholesale market's relocation. Visitors enjoying the area's famous seafood sometimes need our hangover recovery services the next morning.",
        highlights: [
          "20-minute drive from clinic",
          "Tourist destination",
          "Recovery treatments",
          "Morning appointments"
        ],
        landmarks: ["Tsukiji Outer Market", "Namiyoke Shrine", "Tsukiji Honganji Temple"]
      }
    ]
  },
  {
    slug: "chiyoda",
    name: "Chiyoda",
    nameJa: "千代田区",
    description: "Chiyoda ward is Tokyo's political and business center, home to the Imperial Palace, government ministries, and major corporate headquarters. Our professional IV therapy services cater to the busy executives and officials working in this important district.",
    areas: [
      {
        slug: "kanda",
        name: "Kanda",
        nameJa: "神田",
        description: "Kanda is a historic commercial area known for its bookstores and traditional atmosphere. The neighborhood's mix of traditional businesses and modern offices creates diverse demand for our services.",
        highlights: [
          "30-minute drive from clinic",
          "Historic business district",
          "Office visits available",
          "All treatments offered"
        ],
        landmarks: ["Kanda Myojin Shrine", "Book Town Jimbocho", "Kanda Yabu Soba"]
      },
      {
        slug: "otemachi",
        name: "Otemachi",
        nameJa: "大手町",
        description: "Otemachi is Tokyo's premier financial district, housing the headquarters of Japan's largest banks and corporations. Executive wellness is a priority here, and our IV therapy services support peak performance.",
        highlights: [
          "25-minute drive from clinic",
          "Financial headquarters",
          "Executive wellness focus",
          "Discreet office visits"
        ],
        landmarks: ["Otemachi Tower", "Palace Hotel Tokyo", "Wadakura Fountain Park"]
      },
      {
        slug: "iidabashi",
        name: "Iidabashi",
        nameJa: "飯田橋",
        description: "Iidabashi is a diverse area combining offices, universities, and the beautiful Kagurazaka neighborhood. The area's varied population appreciates our comprehensive wellness services.",
        highlights: [
          "30-minute drive from clinic",
          "Mixed-use neighborhood",
          "University area",
          "Flexible scheduling"
        ],
        landmarks: ["Tokyo Dome City", "Kagurazaka", "Canal Cafe"]
      },
      {
        slug: "akihabara",
        name: "Akihabara",
        nameJa: "秋葉原",
        description: "Akihabara is world-famous as Tokyo's electronics and anime district. The area's tech professionals and visiting enthusiasts sometimes need our energy and recovery IV treatments.",
        highlights: [
          "30-minute drive from clinic",
          "Tech and gaming district",
          "Tourist destination",
          "Energy treatments popular"
        ],
        landmarks: ["Yodobashi Camera", "Radio Kaikan", "mAAch ecute"]
      }
    ]
  },
  {
    slug: "shinagawa",
    name: "Shinagawa",
    nameJa: "品川区",
    description: "Shinagawa ward is a major business and transportation hub, home to many corporate headquarters and the Shinkansen station connecting Tokyo to western Japan. Our IV therapy services support the busy professionals passing through this vital area.",
    areas: [
      {
        slug: "gotanda",
        name: "Gotanda",
        nameJa: "五反田",
        description: "Gotanda is a commercial district with a growing startup scene and active nightlife. Young professionals and entrepreneurs here value our energy and recovery treatments.",
        highlights: [
          "15-minute drive from clinic",
          "Startup hub",
          "Nightlife district",
          "Hangover IVs popular"
        ],
        landmarks: ["TOC Building", "Gotanda Station", "Meguro River nearby"]
      },
      {
        slug: "takanawa",
        name: "Takanawa",
        nameJa: "高輪",
        description: "Takanawa is an upscale area featuring grand hotels and quiet residential streets. The neighborhood's luxury hotels frequently request our concierge IV therapy services for their guests.",
        highlights: [
          "20-minute drive from clinic",
          "Luxury hotel area",
          "Residential district",
          "Premium service focus"
        ],
        landmarks: ["Takanawa Gateway Station", "Grand Prince Hotels", "Sengakuji Temple"]
      },
      {
        slug: "osaki",
        name: "Osaki",
        nameJa: "大崎",
        description: "Osaki has transformed into a modern business district with the Gate City complex. Corporate professionals in this area use our IV therapy services for wellness and performance support.",
        highlights: [
          "20-minute drive from clinic",
          "Modern business complex",
          "Corporate clients",
          "Office visits available"
        ],
        landmarks: ["Gate City Osaki", "ThinkPark Tower", "O Art Museum"]
      }
    ]
  }
]

export function getWard(slug: string): Ward | undefined {
  return wards.find(w => w.slug === slug)
}

export function getArea(wardSlug: string, areaSlug: string): { ward: Ward; area: Area } | undefined {
  const ward = wards.find(w => w.slug === wardSlug)
  if (!ward) return undefined
  const area = ward.areas.find(a => a.slug === areaSlug)
  if (!area) return undefined
  return { ward, area }
}

export function getAllAreas(): { ward: Ward; area: Area }[] {
  return wards.flatMap(ward => 
    ward.areas.map(area => ({ ward, area }))
  )
}
