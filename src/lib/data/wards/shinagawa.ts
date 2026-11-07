import type { WardCopy } from './ward'

export const shinagawa: WardCopy<'shinagawa'> = {
  description:
    'Shinagawa ward is a major business and transportation hub, home to many corporate headquarters and the Shinkansen station connecting Tokyo to western Japan. Our IV therapy services support the busy professionals passing through this vital area.',
  descriptionJa:
    '品川区は、多くの企業が集まるビジネス街であり、新幹線が発着する品川駅を有する東京の主要な交通拠点です。 Pitonneでは、品川区にお住まいの方やご滞在中の方へ、訪問点滴、再生医療関連の健康サポート、オンライン処方、自費血液検査をご提供しています。 ご自宅やホテル、オフィスへ看護師が訪問し、医師と連携しながら、お客様一人ひとりに合わせたケアをご案内しています。',
  areas: {
    gotanda: {
      description:
        'Gotanda is a commercial district with a growing startup scene and active nightlife. Young professionals and entrepreneurs here value our energy and recovery treatments.',
      descriptionJa:
        '五反田は成長中のスタートアップシーンと活気あるナイトライフが特徴の商業地区です。若いプロフェッショナルや起業家の方々に、Pitonneのエナジー治療やリカバリー治療が支持されています。',
      highlights: [
        '15-minute drive from clinic',
        'Startup hub',
        'Nightlife district',
        'Hangover IVs popular'
      ],
      highlightsJa: [
        'クリニックから車で15分',
        'スタートアップの集積地',
        'ナイトライフエリア',
        '二日酔い点滴が人気'
      ],
      landmarks: ['TOC Building', 'Gotanda Station', 'Meguro River nearby'],
      landmarksJa: ['TOCビル', '五反田駅', '目黒川（近隣）']
    },
    takanawa: {
      description:
        "Takanawa is an upscale area featuring grand hotels and quiet residential streets. The neighborhood's luxury hotels frequently request our concierge IV therapy services for their guests.",
      descriptionJa:
        '高輪はグランドホテルと閑静な住宅街が特徴の高級エリアです。このエリアの高級ホテルが、宿泊ゲストのためにPitonneのコンシェルジュ点滴療法サービスを頻繁にご依頼されています。',
      highlights: [
        '20-minute drive from clinic',
        'Luxury hotel area',
        'Residential district',
        'Premium service focus'
      ],
      highlightsJa: [
        'クリニックから車で20分',
        '高級ホテルエリア',
        '住宅地区',
        'プレミアムサービスに特化'
      ],
      landmarks: ['Takanawa Gateway Station', 'Grand Prince Hotels', 'Sengakuji Temple'],
      landmarksJa: ['高輪ゲートウェイ駅', 'グランドプリンスホテル', '泉岳寺']
    },
    osaki: {
      description:
        'Osaki has transformed into a modern business district with the Gate City complex. Corporate professionals in this area use our IV therapy services for wellness and performance support.',
      descriptionJa:
        '大崎はゲートシティを中心にモダンなビジネス地区へと変貌を遂げました。このエリアのビジネスプロフェッショナルの方々が、ウェルネスとパフォーマンスサポートのためにPitonneの点滴療法サービスをご利用されています。',
      highlights: [
        '20-minute drive from clinic',
        'Modern business complex',
        'Corporate clients',
        'Office visits available'
      ],
      highlightsJa: [
        'クリニックから車で20分',
        'モダンなビジネス複合施設',
        '法人のお客様',
        'オフィス訪問対応可能'
      ],
      landmarks: ['Gate City Osaki', 'ThinkPark Tower', 'O Art Museum'],
      landmarksJa: ['ゲートシティ大崎', 'シンクパークタワー', 'O美術館']
    }
  }
}
