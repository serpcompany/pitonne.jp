import type { Ward } from './ward'

export const chuo: Ward = {
  slug: 'chuo',
  name: 'Chuo',
  nameJa: '中央区',
  description:
    "Chuo ward is Tokyo's historic commercial heart, encompassing the luxury shopping district of Ginza and the traditional market area of Tsukiji. Business travelers and tourists in this central location benefit from our convenient IV therapy services.",
  descriptionJa:
    '中央区は、銀座や築地をはじめ、商業施設やオフィス、ホテルが集まる東京を代表するエリアです。 Pitonneでは、中央区にお住まいの方やご滞在中の方へ、訪問点滴、再生医療関連の健康サポート、オンライン処方、自費血液検査をご提供しています。 ご自宅やホテル、オフィスなど、ご希望の場所へ看護師が訪問し、医師と連携しながら、お客様一人ひとりに合わせたケアをご案内しています。',
  areas: [
    {
      slug: 'ginza',
      name: 'Ginza',
      nameJa: '銀座',
      description:
        "Ginza is Tokyo's most prestigious shopping and entertainment district, home to department stores, galleries, and Michelin-starred restaurants. Visitors staying at Ginza's luxury hotels frequently request our concierge wellness services.",
      descriptionJa:
        '銀座は東京で最も格式の高いショッピング・エンターテインメント地区で、百貨店、ギャラリー、ミシュラン星付きレストランが集まります。銀座の高級ホテルに滞在される方々が、Pitonneのコンシェルジュウェルネスサービスを頻繁にご利用されています。',
      highlights: [
        '20-minute drive from clinic',
        'Luxury hotel partnerships',
        'Tourist and business traveler focus',
        'Same-day appointments'
      ],
      highlightsJa: [
        'クリニックから車で20分',
        '高級ホテルとの提携',
        '観光客・ビジネス旅行者向け',
        '当日予約対応可能'
      ],
      landmarks: ['Ginza Six', 'Mitsukoshi Department Store', 'Kabukiza Theatre'],
      landmarksJa: ['GINZA SIX', '三越百貨店', '歌舞伎座']
    },
    {
      slug: 'nihonbashi',
      name: 'Nihonbashi',
      nameJa: '日本橋',
      description:
        "Nihonbashi is Tokyo's historic commercial center, now a major financial district. The area's corporate professionals value our efficient IV therapy services for maintaining their demanding schedules.",
      descriptionJa:
        '日本橋は東京の歴史ある商業の中心で、現在は主要な金融街となっています。このエリアのビジネスプロフェッショナルの方々が、多忙なスケジュールを維持するためにPitonneの効率的な点滴療法サービスを重宝されています。',
      highlights: [
        '25-minute drive from clinic',
        'Financial district',
        'Corporate wellness programs',
        'Office visit available'
      ],
      highlightsJa: [
        'クリニックから車で25分',
        '金融街',
        '法人向けウェルネスプログラム',
        'オフィス訪問対応可能'
      ],
      landmarks: ['Nihonbashi Bridge', 'Coredo Muromachi', 'Bank of Japan'],
      landmarksJa: ['日本橋', 'コレド室町', '日本銀行']
    },
    {
      slug: 'hatchobori',
      name: 'Hatchobori',
      nameJa: '八丁堀',
      description:
        'Hatchobori is a business district with excellent transportation access, popular with companies and hotels. Our IV therapy services are readily available to this convenient central Tokyo location.',
      descriptionJa:
        '八丁堀は交通アクセスに優れたビジネス地区で、企業やホテルが多く集まるエリアです。東京都心のこの便利なロケーションへ、Pitonneの点滴療法サービスを迅速にお届けしています。',
      highlights: [
        '25-minute drive from clinic',
        'Business hotel area',
        'Transportation hub',
        'Quick service delivery'
      ],
      highlightsJa: [
        'クリニックから車で25分',
        'ビジネスホテルエリア',
        '交通の要所',
        '迅速なサービス提供'
      ],
      landmarks: ['Hatchobori Station', 'Kayabacho Business District', 'Sakuragawa Park'],
      landmarksJa: ['八丁堀駅', '茅場町ビジネス地区', '桜川公園']
    },
    {
      slug: 'tsukiji',
      name: 'Tsukiji',
      nameJa: '築地',
      description:
        "Tsukiji remains a culinary destination even after the wholesale market's relocation. Visitors enjoying the area's famous seafood sometimes need our hangover recovery services the next morning.",
      descriptionJa:
        '築地は卸売市場の移転後もグルメの名所であり続けています。この地域の有名な海鮮料理を楽しまれた後、翌朝の二日酔い回復サービスをご利用になる方もいらっしゃいます。',
      highlights: [
        '20-minute drive from clinic',
        'Tourist destination',
        'Recovery treatments',
        'Morning appointments'
      ],
      highlightsJa: ['クリニックから車で20分', '観光名所', '回復治療', '朝の予約対応可能'],
      landmarks: ['Tsukiji Outer Market', 'Namiyoke Shrine', 'Tsukiji Honganji Temple'],
      landmarksJa: ['築地場外市場', '波除神社', '築地本願寺']
    }
  ]
}
