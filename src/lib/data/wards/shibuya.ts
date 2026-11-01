import type { Ward } from './ward'

export const shibuya: Ward = {
  slug: 'shibuya',
  name: 'Shibuya',
  nameJa: '渋谷区',
  description:
    "Shibuya ward is the heart of Tokyo's youth culture, fashion, and technology scenes. From the famous Shibuya Crossing to the trendy streets of Harajuku, this dynamic ward attracts visitors and residents who appreciate our modern approach to wellness.",
  descriptionJa:
    '渋谷区は、流行や文化の発信地として知られ、オフィスや商業施設、住宅街が調和する東京を代表するエリアです。 Pitonneでは、渋谷区にお住まいの方やご滞在中の方へ、訪問点滴、再生医療関連の健康サポート、オンライン処方、自費血液検査をご提供しています。 ご自宅やホテル、オフィスへ看護師が訪問し、医師と連携しながら、お客様一人ひとりに合わせたケアをご案内しています。',
  areas: [
    {
      slug: 'ebisu',
      name: 'Ebisu',
      nameJa: '恵比寿',
      description:
        'Ebisu is a sophisticated neighborhood known for its excellent restaurants, craft beer scene, and relaxed atmosphere. Young professionals living here often choose our skin brightening and vitamin IV treatments.',
      descriptionJa:
        '恵比寿は優れたレストラン、クラフトビール文化、リラックスした雰囲気で知られる洗練された街です。ここに住む若いプロフェッショナルの方々は、美白点滴やビタミン点滴をよくご利用されます。',
      highlights: [
        '12-minute drive from clinic',
        'Popular with young professionals',
        'Skin and beauty IVs in demand',
        'Weekend appointments available'
      ],
      highlightsJa: [
        'クリニックから車で12分',
        '若いプロフェッショナルに人気',
        '美容・美白点滴が好評',
        '週末の予約も対応可能'
      ],
      landmarks: [
        'Yebisu Garden Place',
        'Tokyo Metropolitan Museum of Photography',
        'Ebisu Yokocho'
      ],
      landmarksJa: ['恵比寿ガーデンプレイス', '東京都写真美術館', '恵比寿横丁']
    },
    {
      slug: 'hiroo',
      name: 'Hiroo',
      nameJa: '広尾',
      description:
        'The Shibuya side of Hiroo maintains the same upscale, international character as its Minato counterpart. Residents here enjoy convenient access to our full range of IV therapy and wellness services.',
      descriptionJa:
        '渋谷区側の広尾も、港区側と同様に高級で国際色豊かな雰囲気を保っています。このエリアの居住者の方々は、Pitonneの点滴療法やウェルネスサービスの全メニューを便利にご利用いただけます。',
      highlights: [
        '10-minute drive from clinic',
        'International community',
        'All services available',
        'Discreet home visits'
      ],
      highlightsJa: [
        'クリニックから車で10分',
        '国際的なコミュニティ',
        '全サービス対応可能',
        'プライバシーに配慮した自宅訪問'
      ],
      landmarks: ['Hiroo Garden Hills', 'Sacred Heart International School', 'Hiroo Plaza'],
      landmarksJa: ['広尾ガーデンヒルズ', '聖心インターナショナルスクール', '広尾プラザ']
    },
    {
      slug: 'daikanyama',
      name: 'Daikanyama',
      nameJa: '代官山',
      description:
        "Daikanyama is Tokyo's most fashionable neighborhood, filled with designer boutiques, architecturally stunning buildings, and sophisticated cafes. The area's style-conscious residents appreciate our aesthetic-focused treatments.",
      descriptionJa:
        '代官山は東京で最もファッショナブルな街で、デザイナーズブティック、建築美あふれるビル、洗練されたカフェが立ち並びます。美意識の高い住民の方々に、Pitonneの美容特化型トリートメントが支持されています。',
      highlights: [
        '15-minute drive from clinic',
        'Fashion and creative industry clients',
        'Skin brightening popular',
        'Discrete, premium service'
      ],
      highlightsJa: [
        'クリニックから車で15分',
        'ファッション・クリエイティブ業界のお客様',
        '美白点滴が人気',
        'プライバシーに配慮したプレミアムサービス'
      ],
      landmarks: ['Daikanyama T-Site', 'Hillside Terrace', 'LOG ROAD DAIKANYAMA'],
      landmarksJa: ['代官山 蔦屋書店', 'ヒルサイドテラス', 'ログロード代官山']
    },
    {
      slug: 'yoyogi',
      name: 'Yoyogi',
      nameJa: '代々木',
      description:
        'Yoyogi offers a perfect blend of nature and urban convenience, anchored by the vast Yoyogi Park. Athletes and fitness enthusiasts in the area frequently request our energy recovery and immune boost treatments.',
      descriptionJa:
        '代々木は広大な代々木公園を中心に、自然と都市の利便性が完璧に融合したエリアです。このエリアのアスリートやフィットネス愛好家の方々が、エネルギー回復や免疫力アップの治療を頻繁にご利用されています。',
      highlights: [
        '20-minute drive from clinic',
        'Popular with athletes',
        'Recovery IVs after training',
        'Immune support treatments'
      ],
      highlightsJa: [
        'クリニックから車で20分',
        'アスリートに人気',
        'トレーニング後のリカバリー点滴',
        '免疫サポート治療'
      ],
      landmarks: ['Yoyogi Park', 'Meiji Shrine', 'NHK Broadcasting Center'],
      landmarksJa: ['代々木公園', '明治神宮', 'NHK放送センター']
    },
    {
      slug: 'omotesando',
      name: 'Omotesando',
      nameJa: '表参道',
      description:
        "Omotesando is Tokyo's Champs-Élysées, lined with flagship stores from the world's top fashion brands. The area's discerning clientele appreciates our premium wellness services and aesthetic treatments.",
      descriptionJa:
        '表参道は東京のシャンゼリゼとも呼ばれ、世界のトップファッションブランドの旗艦店が立ち並びます。目の肥えたお客様に、Pitonneのプレミアムウェルネスサービスや美容トリートメントが支持されています。',
      highlights: [
        '18-minute drive from clinic',
        'Luxury retail district',
        'Beauty and skin treatments',
        'High-end hotel visits'
      ],
      highlightsJa: [
        'クリニックから車で18分',
        '高級ショッピングエリア',
        '美容・美肌トリートメント',
        '高級ホテルへの訪問対応'
      ],
      landmarks: ['Omotesando Hills', 'Nezu Museum', 'Cat Street'],
      landmarksJa: ['表参道ヒルズ', '根津美術館', 'キャットストリート']
    },
    {
      slug: 'sendagaya',
      name: 'Sendagaya',
      nameJa: '千駄ヶ谷',
      description:
        'Sendagaya is home to the Japan National Stadium and numerous sports facilities. Athletes and sports professionals in this area frequently use our recovery IV treatments and performance support services.',
      descriptionJa:
        '千駄ヶ谷は国立競技場をはじめ、多くのスポーツ施設が集まるエリアです。このエリアのアスリートやスポーツ関係者の方々が、リカバリー点滴やパフォーマンスサポートサービスを頻繁にご利用されています。',
      highlights: [
        '25-minute drive from clinic',
        'Olympic venue area',
        'Athletic recovery focus',
        'Team wellness programs'
      ],
      highlightsJa: [
        'クリニックから車で25分',
        'オリンピック会場エリア',
        'アスリートのリカバリーに特化',
        'チーム向けウェルネスプログラム'
      ],
      landmarks: ['Japan National Stadium', 'Tokyo Metropolitan Gymnasium', 'Shogi Hall'],
      landmarksJa: ['国立競技場', '東京体育館', '将棋会館']
    },
    {
      slug: 'harajuku',
      name: 'Harajuku',
      nameJa: '原宿',
      description:
        'Harajuku is the global center of Japanese street fashion and youth culture. The creative energy of this neighborhood attracts young professionals who value our modern approach to health and wellness.',
      descriptionJa:
        '原宿は日本のストリートファッションとユースカルチャーの世界的中心地です。このエリアのクリエイティブなエネルギーが、Pitonneのモダンなヘルス＆ウェルネスアプローチを支持する若いプロフェッショナルを惹きつけています。',
      highlights: [
        '20-minute drive from clinic',
        'Youth and creative industries',
        'Vitamin and energy IVs',
        'Flexible scheduling'
      ],
      highlightsJa: [
        'クリニックから車で20分',
        '若者・クリエイティブ業界',
        'ビタミン・エナジー点滴',
        '柔軟なスケジュール対応'
      ],
      landmarks: ['Takeshita Street', 'Laforet Harajuku', 'Meiji Jingu'],
      landmarksJa: ['竹下通り', 'ラフォーレ原宿', '明治神宮']
    },
    {
      slug: 'yoyogi-uehara',
      name: 'Yoyogi Uehara',
      nameJa: '代々木上原',
      description:
        'Yoyogi Uehara is a quiet, upscale residential neighborhood known for its excellent restaurants and peaceful atmosphere. Residents here appreciate our discreet home visit services.',
      descriptionJa:
        '代々木上原は優れたレストランと穏やかな雰囲気で知られる閑静な高級住宅街です。このエリアの住民の方々に、Pitonneのプライバシーに配慮した自宅訪問サービスが好評です。',
      highlights: [
        '25-minute drive from clinic',
        'Quiet residential area',
        'Home visit specialists',
        'All treatments available'
      ],
      highlightsJa: [
        'クリニックから車で25分',
        '閑静な住宅エリア',
        '自宅訪問の専門スタッフ',
        '全メニュー対応可能'
      ],
      landmarks: ['Tokyo Camii Mosque', 'Komaba Park', 'Uehara Station'],
      landmarksJa: ['東京ジャーミイ', '駒場公園', '代々木上原駅']
    }
  ]
}
