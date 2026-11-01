import type { Ward } from './ward'

export const chiyoda: Ward = {
  slug: 'chiyoda',
  name: 'Chiyoda',
  nameJa: '千代田区',
  description:
    "Chiyoda ward is Tokyo's political and business center, home to the Imperial Palace, government ministries, and major corporate headquarters. Our professional IV therapy services cater to the busy executives and officials working in this important district.",
  descriptionJa:
    '千代田区は、皇居や官公庁、大手企業の本社が集まる、東京を代表するビジネス・行政の中心地です。 Pitonneでは、千代田区にお住まいの方やご滞在中の方へ、訪問点滴、再生医療関連の健康サポート、オンライン処方、自費血液検査をご提供しています。 ご自宅やホテル、オフィスなど、ご希望の場所へ看護師が訪問し、医師と連携しながら、お客様一人ひとりに合わせたケアをご案内しています。',
  areas: [
    {
      slug: 'kanda',
      name: 'Kanda',
      nameJa: '神田',
      description:
        "Kanda is a historic commercial area known for its bookstores and traditional atmosphere. The neighborhood's mix of traditional businesses and modern offices creates diverse demand for our services.",
      descriptionJa:
        '神田は古書店街と伝統的な雰囲気で知られる歴史ある商業エリアです。伝統的な商店とモダンなオフィスが混在するこの街では、Pitonneのサービスへの多様なニーズがあります。',
      highlights: [
        '30-minute drive from clinic',
        'Historic business district',
        'Office visits available',
        'All treatments offered'
      ],
      highlightsJa: [
        'クリニックから車で30分',
        '歴史あるビジネス地区',
        'オフィス訪問対応可能',
        '全メニュー提供'
      ],
      landmarks: ['Kanda Myojin Shrine', 'Book Town Jimbocho', 'Kanda Yabu Soba'],
      landmarksJa: ['神田明神', '神保町古書店街', 'かんだやぶそば']
    },
    {
      slug: 'otemachi',
      name: 'Otemachi',
      nameJa: '大手町',
      description:
        "Otemachi is Tokyo's premier financial district, housing the headquarters of Japan's largest banks and corporations. Executive wellness is a priority here, and our IV therapy services support peak performance.",
      descriptionJa:
        '大手町は日本を代表する金融街で、大手銀行や企業の本社が集まっています。エグゼクティブの健康管理が重視されるこのエリアで、Pitonneの点滴療法サービスが最高のパフォーマンスをサポートしています。',
      highlights: [
        '25-minute drive from clinic',
        'Financial headquarters',
        'Executive wellness focus',
        'Discreet office visits'
      ],
      highlightsJa: [
        'クリニックから車で25分',
        '金融機関の本社が集中',
        'エグゼクティブのウェルネスに特化',
        'プライバシーに配慮したオフィス訪問'
      ],
      landmarks: ['Otemachi Tower', 'Palace Hotel Tokyo', 'Wadakura Fountain Park'],
      landmarksJa: ['大手町タワー', 'パレスホテル東京', '和田倉噴水公園']
    },
    {
      slug: 'iidabashi',
      name: 'Iidabashi',
      nameJa: '飯田橋',
      description:
        "Iidabashi is a diverse area combining offices, universities, and the beautiful Kagurazaka neighborhood. The area's varied population appreciates our comprehensive wellness services.",
      descriptionJa:
        '飯田橋はオフィス、大学、そして美しい神楽坂が融合する多様なエリアです。さまざまな層の方々に、Pitonneの総合的なウェルネスサービスをご利用いただいています。',
      highlights: [
        '30-minute drive from clinic',
        'Mixed-use neighborhood',
        'University area',
        'Flexible scheduling'
      ],
      highlightsJa: [
        'クリニックから車で30分',
        '複合的な街並み',
        '大学エリア',
        '柔軟なスケジュール対応'
      ],
      landmarks: ['Tokyo Dome City', 'Kagurazaka', 'Canal Cafe'],
      landmarksJa: ['東京ドームシティ', '神楽坂', 'カナルカフェ']
    },
    {
      slug: 'akihabara',
      name: 'Akihabara',
      nameJa: '秋葉原',
      description:
        "Akihabara is world-famous as Tokyo's electronics and anime district. The area's tech professionals and visiting enthusiasts sometimes need our energy and recovery IV treatments.",
      descriptionJa:
        '秋葉原は東京の電気街・アニメの聖地として世界的に有名です。このエリアのテック系プロフェッショナルや訪問されるファンの方々が、エナジー点滴やリカバリー点滴をご利用になることがあります。',
      highlights: [
        '30-minute drive from clinic',
        'Tech and gaming district',
        'Tourist destination',
        'Energy treatments popular'
      ],
      highlightsJa: [
        'クリニックから車で30分',
        'テック・ゲームの街',
        '観光名所',
        'エナジー治療が人気'
      ],
      landmarks: ['Yodobashi Camera', 'Radio Kaikan', 'mAAch ecute'],
      landmarksJa: ['ヨドバシカメラ', 'ラジオ会館', 'マーチエキュート神田万世橋']
    }
  ]
}
