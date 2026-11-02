export const wardNames = [
  {
    slug: 'minato',
    name: 'Minato',
    nameJa: '港区',
    areas: [
      { slug: 'roppongi', name: 'Roppongi', nameJa: '六本木' },
      { slug: 'azabu-juban', name: 'Azabu Juban', nameJa: '麻布十番' },
      { slug: 'hiroo', name: 'Hiroo', nameJa: '広尾' },
      { slug: 'akasaka', name: 'Akasaka', nameJa: '赤坂' },
      { slug: 'toranomon', name: 'Toranomon', nameJa: '虎ノ門' },
      { slug: 'shimbashi', name: 'Shimbashi', nameJa: '新橋' }
    ]
  },
  {
    slug: 'shibuya',
    name: 'Shibuya',
    nameJa: '渋谷区',
    areas: [
      { slug: 'ebisu', name: 'Ebisu', nameJa: '恵比寿' },
      { slug: 'hiroo', name: 'Hiroo', nameJa: '広尾' },
      { slug: 'daikanyama', name: 'Daikanyama', nameJa: '代官山' },
      { slug: 'yoyogi', name: 'Yoyogi', nameJa: '代々木' },
      { slug: 'omotesando', name: 'Omotesando', nameJa: '表参道' },
      { slug: 'sendagaya', name: 'Sendagaya', nameJa: '千駄ヶ谷' },
      { slug: 'harajuku', name: 'Harajuku', nameJa: '原宿' },
      { slug: 'yoyogi-uehara', name: 'Yoyogi Uehara', nameJa: '代々木上原' }
    ]
  },
  {
    slug: 'chuo',
    name: 'Chuo',
    nameJa: '中央区',
    areas: [
      { slug: 'ginza', name: 'Ginza', nameJa: '銀座' },
      { slug: 'nihonbashi', name: 'Nihonbashi', nameJa: '日本橋' },
      { slug: 'hatchobori', name: 'Hatchobori', nameJa: '八丁堀' },
      { slug: 'tsukiji', name: 'Tsukiji', nameJa: '築地' }
    ]
  },
  {
    slug: 'chiyoda',
    name: 'Chiyoda',
    nameJa: '千代田区',
    areas: [
      { slug: 'kanda', name: 'Kanda', nameJa: '神田' },
      { slug: 'otemachi', name: 'Otemachi', nameJa: '大手町' },
      { slug: 'iidabashi', name: 'Iidabashi', nameJa: '飯田橋' },
      { slug: 'akihabara', name: 'Akihabara', nameJa: '秋葉原' }
    ]
  },
  {
    slug: 'shinagawa',
    name: 'Shinagawa',
    nameJa: '品川区',
    areas: [
      { slug: 'gotanda', name: 'Gotanda', nameJa: '五反田' },
      { slug: 'takanawa', name: 'Takanawa', nameJa: '高輪' },
      { slug: 'osaki', name: 'Osaki', nameJa: '大崎' }
    ]
  }
] as const

type WardName = (typeof wardNames)[number]

export type WardSlug = WardName['slug']

export type AreaSlug<W extends WardSlug> = Extract<WardName, { slug: W }>['areas'][number]['slug']
