import type { WardCopy } from './ward'

export const minato: WardCopy<'minato'> = {
  description:
    "Minato is one of Tokyo's most prestigious wards, home to embassies, international businesses, and upscale residential areas. Our Nishi Azabu clinic is centrally located in Minato, providing convenient access to premium IV therapy and stem cell treatments.",
  descriptionJa:
    '港区は、大使館や外資系企業、高級住宅街が集まる、東京を代表する国際色豊かなエリアです。 Pitonneは西麻布を拠点としており、港区にお住まいの方やご滞在中の方へ、訪問点滴、再生医療関連の健康サポート、オンライン処方、自費血液検査をご提供しています。 ご自宅やホテル、オフィスへ看護師が訪問し、医師と連携しながら、お客様一人ひとりに合わせたケアをご案内しています。',
  areas: {
    roppongi: {
      description:
        "Roppongi is Tokyo's premier entertainment and nightlife district, known for its vibrant clubs, international dining, and the iconic Roppongi Hills complex. Business professionals and travelers often seek our hangover IV drips and energy recovery treatments after late nights in this dynamic neighborhood.",
      descriptionJa:
        '六本木は東京を代表するエンターテインメント・ナイトライフエリアで、活気あるクラブ、国際色豊かなレストラン、そして象徴的な六本木ヒルズで知られています。ビジネスプロフェッショナルや旅行者の方々が、この活気あふれる街での夜を楽しんだ後、二日酔い点滴やエネルギー回復治療をよくご利用されます。',
      highlights: [
        '5-minute drive from our Nishi Azabu clinic',
        'Popular among business travelers and expats',
        '24/7 hotel visit availability',
        'Quick response times for urgent requests'
      ],
      highlightsJa: [
        '西麻布クリニックから車で5分',
        'ビジネス旅行者や在日外国人に人気',
        '24時間ホテル訪問対応',
        '緊急リクエストへの迅速な対応'
      ],
      landmarks: ['Roppongi Hills', 'Tokyo Midtown', 'National Art Center'],
      landmarksJa: ['六本木ヒルズ', '東京ミッドタウン', '国立新美術館']
    },
    'azabu-juban': {
      description:
        'Azabu Juban is a charming neighborhood blending traditional Tokyo atmosphere with modern sophistication. Home to long-established shops and trendy cafes, this area attracts discerning residents who appreciate our discreet, personalized wellness services.',
      descriptionJa:
        '麻布十番は、東京の伝統的な雰囲気とモダンな洗練さが融合した魅力的な街です。老舗の商店やトレンドのカフェが並び、Pitonneの上質でプライバシーに配慮したウェルネスサービスを大切にする方々に支持されています。',
      highlights: [
        'Walking distance from our clinic',
        'Discreet residential visits available',
        'Popular for skin brightening treatments',
        'Quiet, professional service environment'
      ],
      highlightsJa: [
        'クリニックから徒歩圏内',
        'プライバシーに配慮した自宅訪問が可能',
        '美白点滴が人気',
        '静かでプロフェッショナルなサービス環境'
      ],
      landmarks: ['Azabu Juban Shopping Street', 'Zenpukuji Temple', 'Ichinohashi Park'],
      landmarksJa: ['麻布十番商店街', '善福寺', '一の橋公園']
    },
    hiroo: {
      description:
        "Hiroo is an upscale residential area popular with international families and embassy staff. The neighborhood's peaceful atmosphere and proximity to international schools makes it ideal for our wellness consultation services.",
      descriptionJa:
        '広尾は国際的なファミリーや大使館関係者に人気の高級住宅エリアです。穏やかな雰囲気とインターナショナルスクールへの近さから、Pitonneのウェルネスカウンセリングに最適な環境です。',
      highlights: [
        'Adjacent to our Nishi Azabu location',
        'Many international residents',
        'Family-friendly wellness services',
        'Immune boost treatments popular here'
      ],
      highlightsJa: [
        '西麻布のクリニックに隣接',
        '多数の外国人居住者',
        'ご家族向けウェルネスサービス',
        '免疫力アップ治療が人気'
      ],
      landmarks: ['Arisugawa-no-miya Memorial Park', 'National Azabu Supermarket', 'Hiroo Station'],
      landmarksJa: ['有栖川宮記念公園', 'ナショナル麻布スーパーマーケット', '広尾駅']
    },
    akasaka: {
      description:
        'Akasaka is a major business and entertainment district, home to TBS headquarters, luxury hotels, and numerous corporate offices. Business executives frequently request our IV vitamin therapy and fatigue recovery treatments for maintaining peak performance.',
      descriptionJa:
        '赤坂はTBS本社、高級ホテル、多数の企業オフィスが集まるビジネス・エンターテインメント地区です。ビジネスエグゼクティブの方々が、最高のパフォーマンスを維持するためにビタミン点滴や疲労回復治療を頻繁にご利用されています。',
      highlights: [
        '10-minute drive from our clinic',
        'Corporate wellness programs available',
        'Hotel visits to major chains',
        'Energy IV drips for busy professionals'
      ],
      highlightsJa: [
        'クリニックから車で10分',
        '法人向けウェルネスプログラムあり',
        '主要ホテルへの訪問対応',
        '多忙なビジネスパーソン向けエナジー点滴'
      ],
      landmarks: ['Akasaka Sacas', 'The Capitol Hotel Tokyu', 'Hie Shrine'],
      landmarksJa: ['赤坂サカス', 'ザ・キャピトルホテル東急', '日枝神社']
    },
    toranomon: {
      description:
        "Toranomon is Tokyo's newest business hub, featuring modern skyscrapers and the innovative Toranomon Hills development. The area's corporate professionals value our efficient, discreet IV therapy services delivered directly to their offices or hotels.",
      descriptionJa:
        '虎ノ門は東京の最新ビジネスハブで、モダンな高層ビルや革新的な虎ノ門ヒルズが特徴です。このエリアのビジネスプロフェッショナルの方々は、オフィスやホテルに直接お届けする効率的でプライバシーに配慮した点滴療法サービスを重宝されています。',
      highlights: [
        '15-minute drive from clinic',
        'Office visit services available',
        'Popular with finance professionals',
        'Immune boost and vitamin IVs in demand'
      ],
      highlightsJa: [
        'クリニックから車で15分',
        'オフィス訪問サービスあり',
        '金融業界のプロフェッショナルに人気',
        '免疫力アップ・ビタミン点滴が好評'
      ],
      landmarks: ['Toranomon Hills', 'Andaz Tokyo', 'Atago Shrine'],
      landmarksJa: ['虎ノ門ヒルズ', 'アンダーズ東京', '愛宕神社']
    },
    shimbashi: {
      description:
        "Shimbashi is known as the quintessential Japanese salaryman district, with countless izakayas and bars serving after-work crowds. Our hangover IV drip service is particularly popular among Shimbashi's hardworking professionals.",
      descriptionJa:
        '新橋は日本のサラリーマンの街として知られ、仕事帰りの人々で賑わう居酒屋やバーが数多く立ち並びます。Pitonneの二日酔い点滴サービスは、新橋で働く勤勉なプロフェッショナルの方々に特に人気です。',
      highlights: [
        '15-minute drive from clinic',
        'Hangover IV drips highly requested',
        'Early morning appointments available',
        'Quick recovery treatments'
      ],
      highlightsJa: [
        'クリニックから車で15分',
        '二日酔い点滴のご要望多数',
        '早朝の予約も対応可能',
        '迅速な回復治療'
      ],
      landmarks: ['Shimbashi Station SL Plaza', 'Shiodome City Center', 'Hamarikyu Gardens'],
      landmarksJa: ['新橋駅SL広場', '汐留シティセンター', '浜離宮恩賜庭園']
    }
  }
}
