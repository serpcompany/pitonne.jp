export interface Area {
  slug: string
  name: string
  nameJa: string
  description: string
  descriptionJa: string
  highlights: string[]
  highlightsJa: string[]
  landmarks: string[]
  landmarksJa: string[]
}

export interface Ward {
  slug: string
  name: string
  nameJa: string
  description: string
  descriptionJa: string
  areas: Area[]
}

export const wards: Ward[] = [
  {
    slug: "minato",
    name: "Minato",
    nameJa: "港区",
    description: "Minato is one of Tokyo's most prestigious wards, home to embassies, international businesses, and upscale residential areas. Our Nishi Azabu clinic is centrally located in Minato, providing convenient access to premium IV therapy and stem cell treatments.",
    descriptionJa: "港区は、大使館や外資系企業、高級住宅街が集まる、東京を代表する国際色豊かなエリアです。 Pitonneは西麻布を拠点としており、港区にお住まいの方やご滞在中の方へ、訪問点滴、再生医療関連の健康サポート、オンライン処方、自費血液検査をご提供しています。 ご自宅やホテル、オフィスへ看護師が訪問し、医師と連携しながら、お客様一人ひとりに合わせたケアをご案内しています。",
    areas: [
      {
        slug: "roppongi",
        name: "Roppongi",
        nameJa: "六本木",
        description: "Roppongi is Tokyo's premier entertainment and nightlife district, known for its vibrant clubs, international dining, and the iconic Roppongi Hills complex. Business professionals and travelers often seek our hangover IV drips and energy recovery treatments after late nights in this dynamic neighborhood.",
        descriptionJa: "六本木は東京を代表するエンターテインメント・ナイトライフエリアで、活気あるクラブ、国際色豊かなレストラン、そして象徴的な六本木ヒルズで知られています。ビジネスプロフェッショナルや旅行者の方々が、この活気あふれる街での夜を楽しんだ後、二日酔い点滴やエネルギー回復治療をよくご利用されます。",
        highlights: [
          "5-minute drive from our Nishi Azabu clinic",
          "Popular among business travelers and expats",
          "24/7 hotel visit availability",
          "Quick response times for urgent requests"
        ],
        highlightsJa: [
          "西麻布クリニックから車で5分",
          "ビジネス旅行者や在日外国人に人気",
          "24時間ホテル訪問対応",
          "緊急リクエストへの迅速な対応"
        ],
        landmarks: ["Roppongi Hills", "Tokyo Midtown", "National Art Center"],
        landmarksJa: ["六本木ヒルズ", "東京ミッドタウン", "国立新美術館"]
      },
      {
        slug: "azabu-juban",
        name: "Azabu Juban",
        nameJa: "麻布十番",
        description: "Azabu Juban is a charming neighborhood blending traditional Tokyo atmosphere with modern sophistication. Home to long-established shops and trendy cafes, this area attracts discerning residents who appreciate our discreet, personalized wellness services.",
        descriptionJa: "麻布十番は、東京の伝統的な雰囲気とモダンな洗練さが融合した魅力的な街です。老舗の商店やトレンドのカフェが並び、Pitonneの上質でプライバシーに配慮したウェルネスサービスを大切にする方々に支持されています。",
        highlights: [
          "Walking distance from our clinic",
          "Discreet residential visits available",
          "Popular for skin brightening treatments",
          "Quiet, professional service environment"
        ],
        highlightsJa: [
          "クリニックから徒歩圏内",
          "プライバシーに配慮した自宅訪問が可能",
          "美白点滴が人気",
          "静かでプロフェッショナルなサービス環境"
        ],
        landmarks: ["Azabu Juban Shopping Street", "Zenpukuji Temple", "Ichinohashi Park"],
        landmarksJa: ["麻布十番商店街", "善福寺", "一の橋公園"]
      },
      {
        slug: "hiroo",
        name: "Hiroo",
        nameJa: "広尾",
        description: "Hiroo is an upscale residential area popular with international families and embassy staff. The neighborhood's peaceful atmosphere and proximity to international schools makes it ideal for our wellness consultation services.",
        descriptionJa: "広尾は国際的なファミリーや大使館関係者に人気の高級住宅エリアです。穏やかな雰囲気とインターナショナルスクールへの近さから、Pitonneのウェルネスカウンセリングに最適な環境です。",
        highlights: [
          "Adjacent to our Nishi Azabu location",
          "Many international residents",
          "Family-friendly wellness services",
          "Immune boost treatments popular here"
        ],
        highlightsJa: [
          "西麻布のクリニックに隣接",
          "多数の外国人居住者",
          "ご家族向けウェルネスサービス",
          "免疫力アップ治療が人気"
        ],
        landmarks: ["Arisugawa-no-miya Memorial Park", "National Azabu Supermarket", "Hiroo Station"],
        landmarksJa: ["有栖川宮記念公園", "ナショナル麻布スーパーマーケット", "広尾駅"]
      },
      {
        slug: "akasaka",
        name: "Akasaka",
        nameJa: "赤坂",
        description: "Akasaka is a major business and entertainment district, home to TBS headquarters, luxury hotels, and numerous corporate offices. Business executives frequently request our IV vitamin therapy and fatigue recovery treatments for maintaining peak performance.",
        descriptionJa: "赤坂はTBS本社、高級ホテル、多数の企業オフィスが集まるビジネス・エンターテインメント地区です。ビジネスエグゼクティブの方々が、最高のパフォーマンスを維持するためにビタミン点滴や疲労回復治療を頻繁にご利用されています。",
        highlights: [
          "10-minute drive from our clinic",
          "Corporate wellness programs available",
          "Hotel visits to major chains",
          "Energy IV drips for busy professionals"
        ],
        highlightsJa: [
          "クリニックから車で10分",
          "法人向けウェルネスプログラムあり",
          "主要ホテルへの訪問対応",
          "多忙なビジネスパーソン向けエナジー点滴"
        ],
        landmarks: ["Akasaka Sacas", "The Capitol Hotel Tokyu", "Hie Shrine"],
        landmarksJa: ["赤坂サカス", "ザ・キャピトルホテル東急", "日枝神社"]
      },
      {
        slug: "toranomon",
        name: "Toranomon",
        nameJa: "虎ノ門",
        description: "Toranomon is Tokyo's newest business hub, featuring modern skyscrapers and the innovative Toranomon Hills development. The area's corporate professionals value our efficient, discreet IV therapy services delivered directly to their offices or hotels.",
        descriptionJa: "虎ノ門は東京の最新ビジネスハブで、モダンな高層ビルや革新的な虎ノ門ヒルズが特徴です。このエリアのビジネスプロフェッショナルの方々は、オフィスやホテルに直接お届けする効率的でプライバシーに配慮した点滴療法サービスを重宝されています。",
        highlights: [
          "15-minute drive from clinic",
          "Office visit services available",
          "Popular with finance professionals",
          "Immune boost and vitamin IVs in demand"
        ],
        highlightsJa: [
          "クリニックから車で15分",
          "オフィス訪問サービスあり",
          "金融業界のプロフェッショナルに人気",
          "免疫力アップ・ビタミン点滴が好評"
        ],
        landmarks: ["Toranomon Hills", "Andaz Tokyo", "Atago Shrine"],
        landmarksJa: ["虎ノ門ヒルズ", "アンダーズ東京", "愛宕神社"]
      },
      {
        slug: "shimbashi",
        name: "Shimbashi",
        nameJa: "新橋",
        description: "Shimbashi is known as the quintessential Japanese salaryman district, with countless izakayas and bars serving after-work crowds. Our hangover IV drip service is particularly popular among Shimbashi's hardworking professionals.",
        descriptionJa: "新橋は日本のサラリーマンの街として知られ、仕事帰りの人々で賑わう居酒屋やバーが数多く立ち並びます。Pitonneの二日酔い点滴サービスは、新橋で働く勤勉なプロフェッショナルの方々に特に人気です。",
        highlights: [
          "15-minute drive from clinic",
          "Hangover IV drips highly requested",
          "Early morning appointments available",
          "Quick recovery treatments"
        ],
        highlightsJa: [
          "クリニックから車で15分",
          "二日酔い点滴のご要望多数",
          "早朝の予約も対応可能",
          "迅速な回復治療"
        ],
        landmarks: ["Shimbashi Station SL Plaza", "Shiodome City Center", "Hamarikyu Gardens"],
        landmarksJa: ["新橋駅SL広場", "汐留シティセンター", "浜離宮恩賜庭園"]
      }
    ]
  },
  {
    slug: "shibuya",
    name: "Shibuya",
    nameJa: "渋谷区",
    description: "Shibuya ward is the heart of Tokyo's youth culture, fashion, and technology scenes. From the famous Shibuya Crossing to the trendy streets of Harajuku, this dynamic ward attracts visitors and residents who appreciate our modern approach to wellness.",
    descriptionJa: "渋谷区は、流行や文化の発信地として知られ、オフィスや商業施設、住宅街が調和する東京を代表するエリアです。 Pitonneでは、渋谷区にお住まいの方やご滞在中の方へ、訪問点滴、再生医療関連の健康サポート、オンライン処方、自費血液検査をご提供しています。 ご自宅やホテル、オフィスへ看護師が訪問し、医師と連携しながら、お客様一人ひとりに合わせたケアをご案内しています。",
    areas: [
      {
        slug: "ebisu",
        name: "Ebisu",
        nameJa: "恵比寿",
        description: "Ebisu is a sophisticated neighborhood known for its excellent restaurants, craft beer scene, and relaxed atmosphere. Young professionals living here often choose our skin brightening and vitamin IV treatments.",
        descriptionJa: "恵比寿は優れたレストラン、クラフトビール文化、リラックスした雰囲気で知られる洗練された街です。ここに住む若いプロフェッショナルの方々は、美白点滴やビタミン点滴をよくご利用されます。",
        highlights: [
          "12-minute drive from clinic",
          "Popular with young professionals",
          "Skin and beauty IVs in demand",
          "Weekend appointments available"
        ],
        highlightsJa: [
          "クリニックから車で12分",
          "若いプロフェッショナルに人気",
          "美容・美白点滴が好評",
          "週末の予約も対応可能"
        ],
        landmarks: ["Yebisu Garden Place", "Tokyo Metropolitan Museum of Photography", "Ebisu Yokocho"],
        landmarksJa: ["恵比寿ガーデンプレイス", "東京都写真美術館", "恵比寿横丁"]
      },
      {
        slug: "hiroo",
        name: "Hiroo",
        nameJa: "広尾",
        description: "The Shibuya side of Hiroo maintains the same upscale, international character as its Minato counterpart. Residents here enjoy convenient access to our full range of IV therapy and wellness services.",
        descriptionJa: "渋谷区側の広尾も、港区側と同様に高級で国際色豊かな雰囲気を保っています。このエリアの居住者の方々は、Pitonneの点滴療法やウェルネスサービスの全メニューを便利にご利用いただけます。",
        highlights: [
          "10-minute drive from clinic",
          "International community",
          "All services available",
          "Discreet home visits"
        ],
        highlightsJa: [
          "クリニックから車で10分",
          "国際的なコミュニティ",
          "全サービス対応可能",
          "プライバシーに配慮した自宅訪問"
        ],
        landmarks: ["Hiroo Garden Hills", "Sacred Heart International School", "Hiroo Plaza"],
        landmarksJa: ["広尾ガーデンヒルズ", "聖心インターナショナルスクール", "広尾プラザ"]
      },
      {
        slug: "daikanyama",
        name: "Daikanyama",
        nameJa: "代官山",
        description: "Daikanyama is Tokyo's most fashionable neighborhood, filled with designer boutiques, architecturally stunning buildings, and sophisticated cafes. The area's style-conscious residents appreciate our aesthetic-focused treatments.",
        descriptionJa: "代官山は東京で最もファッショナブルな街で、デザイナーズブティック、建築美あふれるビル、洗練されたカフェが立ち並びます。美意識の高い住民の方々に、Pitonneの美容特化型トリートメントが支持されています。",
        highlights: [
          "15-minute drive from clinic",
          "Fashion and creative industry clients",
          "Skin brightening popular",
          "Discrete, premium service"
        ],
        highlightsJa: [
          "クリニックから車で15分",
          "ファッション・クリエイティブ業界のお客様",
          "美白点滴が人気",
          "プライバシーに配慮したプレミアムサービス"
        ],
        landmarks: ["Daikanyama T-Site", "Hillside Terrace", "LOG ROAD DAIKANYAMA"],
        landmarksJa: ["代官山 蔦屋書店", "ヒルサイドテラス", "ログロード代官山"]
      },
      {
        slug: "yoyogi",
        name: "Yoyogi",
        nameJa: "代々木",
        description: "Yoyogi offers a perfect blend of nature and urban convenience, anchored by the vast Yoyogi Park. Athletes and fitness enthusiasts in the area frequently request our energy recovery and immune boost treatments.",
        descriptionJa: "代々木は広大な代々木公園を中心に、自然と都市の利便性が完璧に融合したエリアです。このエリアのアスリートやフィットネス愛好家の方々が、エネルギー回復や免疫力アップの治療を頻繁にご利用されています。",
        highlights: [
          "20-minute drive from clinic",
          "Popular with athletes",
          "Recovery IVs after training",
          "Immune support treatments"
        ],
        highlightsJa: [
          "クリニックから車で20分",
          "アスリートに人気",
          "トレーニング後のリカバリー点滴",
          "免疫サポート治療"
        ],
        landmarks: ["Yoyogi Park", "Meiji Shrine", "NHK Broadcasting Center"],
        landmarksJa: ["代々木公園", "明治神宮", "NHK放送センター"]
      },
      {
        slug: "omotesando",
        name: "Omotesando",
        nameJa: "表参道",
        description: "Omotesando is Tokyo's Champs-Élysées, lined with flagship stores from the world's top fashion brands. The area's discerning clientele appreciates our premium wellness services and aesthetic treatments.",
        descriptionJa: "表参道は東京のシャンゼリゼとも呼ばれ、世界のトップファッションブランドの旗艦店が立ち並びます。目の肥えたお客様に、Pitonneのプレミアムウェルネスサービスや美容トリートメントが支持されています。",
        highlights: [
          "18-minute drive from clinic",
          "Luxury retail district",
          "Beauty and skin treatments",
          "High-end hotel visits"
        ],
        highlightsJa: [
          "クリニックから車で18分",
          "高級ショッピングエリア",
          "美容・美肌トリートメント",
          "高級ホテルへの訪問対応"
        ],
        landmarks: ["Omotesando Hills", "Nezu Museum", "Cat Street"],
        landmarksJa: ["表参道ヒルズ", "根津美術館", "キャットストリート"]
      },
      {
        slug: "sendagaya",
        name: "Sendagaya",
        nameJa: "千駄ヶ谷",
        description: "Sendagaya is home to the Japan National Stadium and numerous sports facilities. Athletes and sports professionals in this area frequently use our recovery IV treatments and performance support services.",
        descriptionJa: "千駄ヶ谷は国立競技場をはじめ、多くのスポーツ施設が集まるエリアです。このエリアのアスリートやスポーツ関係者の方々が、リカバリー点滴やパフォーマンスサポートサービスを頻繁にご利用されています。",
        highlights: [
          "25-minute drive from clinic",
          "Olympic venue area",
          "Athletic recovery focus",
          "Team wellness programs"
        ],
        highlightsJa: [
          "クリニックから車で25分",
          "オリンピック会場エリア",
          "アスリートのリカバリーに特化",
          "チーム向けウェルネスプログラム"
        ],
        landmarks: ["Japan National Stadium", "Tokyo Metropolitan Gymnasium", "Shogi Hall"],
        landmarksJa: ["国立競技場", "東京体育館", "将棋会館"]
      },
      {
        slug: "harajuku",
        name: "Harajuku",
        nameJa: "原宿",
        description: "Harajuku is the global center of Japanese street fashion and youth culture. The creative energy of this neighborhood attracts young professionals who value our modern approach to health and wellness.",
        descriptionJa: "原宿は日本のストリートファッションとユースカルチャーの世界的中心地です。このエリアのクリエイティブなエネルギーが、Pitonneのモダンなヘルス＆ウェルネスアプローチを支持する若いプロフェッショナルを惹きつけています。",
        highlights: [
          "20-minute drive from clinic",
          "Youth and creative industries",
          "Vitamin and energy IVs",
          "Flexible scheduling"
        ],
        highlightsJa: [
          "クリニックから車で20分",
          "若者・クリエイティブ業界",
          "ビタミン・エナジー点滴",
          "柔軟なスケジュール対応"
        ],
        landmarks: ["Takeshita Street", "Laforet Harajuku", "Meiji Jingu"],
        landmarksJa: ["竹下通り", "ラフォーレ原宿", "明治神宮"]
      },
      {
        slug: "yoyogi-uehara",
        name: "Yoyogi Uehara",
        nameJa: "代々木上原",
        description: "Yoyogi Uehara is a quiet, upscale residential neighborhood known for its excellent restaurants and peaceful atmosphere. Residents here appreciate our discreet home visit services.",
        descriptionJa: "代々木上原は優れたレストランと穏やかな雰囲気で知られる閑静な高級住宅街です。このエリアの住民の方々に、Pitonneのプライバシーに配慮した自宅訪問サービスが好評です。",
        highlights: [
          "25-minute drive from clinic",
          "Quiet residential area",
          "Home visit specialists",
          "All treatments available"
        ],
        highlightsJa: [
          "クリニックから車で25分",
          "閑静な住宅エリア",
          "自宅訪問の専門スタッフ",
          "全メニュー対応可能"
        ],
        landmarks: ["Tokyo Camii Mosque", "Komaba Park", "Uehara Station"],
        landmarksJa: ["東京ジャーミイ", "駒場公園", "代々木上原駅"]
      }
    ]
  },
  {
    slug: "chuo",
    name: "Chuo",
    nameJa: "中央区",
    description: "Chuo ward is Tokyo's historic commercial heart, encompassing the luxury shopping district of Ginza and the traditional market area of Tsukiji. Business travelers and tourists in this central location benefit from our convenient IV therapy services.",
    descriptionJa: "中央区は、銀座や築地をはじめ、商業施設やオフィス、ホテルが集まる東京を代表するエリアです。 Pitonneでは、中央区にお住まいの方やご滞在中の方へ、訪問点滴、再生医療関連の健康サポート、オンライン処方、自費血液検査をご提供しています。 ご自宅やホテル、オフィスなど、ご希望の場所へ看護師が訪問し、医師と連携しながら、お客様一人ひとりに合わせたケアをご案内しています。",
    areas: [
      {
        slug: "ginza",
        name: "Ginza",
        nameJa: "銀座",
        description: "Ginza is Tokyo's most prestigious shopping and entertainment district, home to department stores, galleries, and Michelin-starred restaurants. Visitors staying at Ginza's luxury hotels frequently request our concierge wellness services.",
        descriptionJa: "銀座は東京で最も格式の高いショッピング・エンターテインメント地区で、百貨店、ギャラリー、ミシュラン星付きレストランが集まります。銀座の高級ホテルに滞在される方々が、Pitonneのコンシェルジュウェルネスサービスを頻繁にご利用されています。",
        highlights: [
          "20-minute drive from clinic",
          "Luxury hotel partnerships",
          "Tourist and business traveler focus",
          "Same-day appointments"
        ],
        highlightsJa: [
          "クリニックから車で20分",
          "高級ホテルとの提携",
          "観光客・ビジネス旅行者向け",
          "当日予約対応可能"
        ],
        landmarks: ["Ginza Six", "Mitsukoshi Department Store", "Kabukiza Theatre"],
        landmarksJa: ["GINZA SIX", "三越百貨店", "歌舞伎座"]
      },
      {
        slug: "nihonbashi",
        name: "Nihonbashi",
        nameJa: "日本橋",
        description: "Nihonbashi is Tokyo's historic commercial center, now a major financial district. The area's corporate professionals value our efficient IV therapy services for maintaining their demanding schedules.",
        descriptionJa: "日本橋は東京の歴史ある商業の中心で、現在は主要な金融街となっています。このエリアのビジネスプロフェッショナルの方々が、多忙なスケジュールを維持するためにPitonneの効率的な点滴療法サービスを重宝されています。",
        highlights: [
          "25-minute drive from clinic",
          "Financial district",
          "Corporate wellness programs",
          "Office visit available"
        ],
        highlightsJa: [
          "クリニックから車で25分",
          "金融街",
          "法人向けウェルネスプログラム",
          "オフィス訪問対応可能"
        ],
        landmarks: ["Nihonbashi Bridge", "Coredo Muromachi", "Bank of Japan"],
        landmarksJa: ["日本橋", "コレド室町", "日本銀行"]
      },
      {
        slug: "hatchobori",
        name: "Hatchobori",
        nameJa: "八丁堀",
        description: "Hatchobori is a business district with excellent transportation access, popular with companies and hotels. Our IV therapy services are readily available to this convenient central Tokyo location.",
        descriptionJa: "八丁堀は交通アクセスに優れたビジネス地区で、企業やホテルが多く集まるエリアです。東京都心のこの便利なロケーションへ、Pitonneの点滴療法サービスを迅速にお届けしています。",
        highlights: [
          "25-minute drive from clinic",
          "Business hotel area",
          "Transportation hub",
          "Quick service delivery"
        ],
        highlightsJa: [
          "クリニックから車で25分",
          "ビジネスホテルエリア",
          "交通の要所",
          "迅速なサービス提供"
        ],
        landmarks: ["Hatchobori Station", "Kayabacho Business District", "Sakuragawa Park"],
        landmarksJa: ["八丁堀駅", "茅場町ビジネス地区", "桜川公園"]
      },
      {
        slug: "tsukiji",
        name: "Tsukiji",
        nameJa: "築地",
        description: "Tsukiji remains a culinary destination even after the wholesale market's relocation. Visitors enjoying the area's famous seafood sometimes need our hangover recovery services the next morning.",
        descriptionJa: "築地は卸売市場の移転後もグルメの名所であり続けています。この地域の有名な海鮮料理を楽しまれた後、翌朝の二日酔い回復サービスをご利用になる方もいらっしゃいます。",
        highlights: [
          "20-minute drive from clinic",
          "Tourist destination",
          "Recovery treatments",
          "Morning appointments"
        ],
        highlightsJa: [
          "クリニックから車で20分",
          "観光名所",
          "回復治療",
          "朝の予約対応可能"
        ],
        landmarks: ["Tsukiji Outer Market", "Namiyoke Shrine", "Tsukiji Honganji Temple"],
        landmarksJa: ["築地場外市場", "波除神社", "築地本願寺"]
      }
    ]
  },
  {
    slug: "chiyoda",
    name: "Chiyoda",
    nameJa: "千代田区",
    description: "Chiyoda ward is Tokyo's political and business center, home to the Imperial Palace, government ministries, and major corporate headquarters. Our professional IV therapy services cater to the busy executives and officials working in this important district.",
    descriptionJa: "千代田区は、皇居や官公庁、大手企業の本社が集まる、東京を代表するビジネス・行政の中心地です。 Pitonneでは、千代田区にお住まいの方やご滞在中の方へ、訪問点滴、再生医療関連の健康サポート、オンライン処方、自費血液検査をご提供しています。 ご自宅やホテル、オフィスなど、ご希望の場所へ看護師が訪問し、医師と連携しながら、お客様一人ひとりに合わせたケアをご案内しています。",
    areas: [
      {
        slug: "kanda",
        name: "Kanda",
        nameJa: "神田",
        description: "Kanda is a historic commercial area known for its bookstores and traditional atmosphere. The neighborhood's mix of traditional businesses and modern offices creates diverse demand for our services.",
        descriptionJa: "神田は古書店街と伝統的な雰囲気で知られる歴史ある商業エリアです。伝統的な商店とモダンなオフィスが混在するこの街では、Pitonneのサービスへの多様なニーズがあります。",
        highlights: [
          "30-minute drive from clinic",
          "Historic business district",
          "Office visits available",
          "All treatments offered"
        ],
        highlightsJa: [
          "クリニックから車で30分",
          "歴史あるビジネス地区",
          "オフィス訪問対応可能",
          "全メニュー提供"
        ],
        landmarks: ["Kanda Myojin Shrine", "Book Town Jimbocho", "Kanda Yabu Soba"],
        landmarksJa: ["神田明神", "神保町古書店街", "かんだやぶそば"]
      },
      {
        slug: "otemachi",
        name: "Otemachi",
        nameJa: "大手町",
        description: "Otemachi is Tokyo's premier financial district, housing the headquarters of Japan's largest banks and corporations. Executive wellness is a priority here, and our IV therapy services support peak performance.",
        descriptionJa: "大手町は日本を代表する金融街で、大手銀行や企業の本社が集まっています。エグゼクティブの健康管理が重視されるこのエリアで、Pitonneの点滴療法サービスが最高のパフォーマンスをサポートしています。",
        highlights: [
          "25-minute drive from clinic",
          "Financial headquarters",
          "Executive wellness focus",
          "Discreet office visits"
        ],
        highlightsJa: [
          "クリニックから車で25分",
          "金融機関の本社が集中",
          "エグゼクティブのウェルネスに特化",
          "プライバシーに配慮したオフィス訪問"
        ],
        landmarks: ["Otemachi Tower", "Palace Hotel Tokyo", "Wadakura Fountain Park"],
        landmarksJa: ["大手町タワー", "パレスホテル東京", "和田倉噴水公園"]
      },
      {
        slug: "iidabashi",
        name: "Iidabashi",
        nameJa: "飯田橋",
        description: "Iidabashi is a diverse area combining offices, universities, and the beautiful Kagurazaka neighborhood. The area's varied population appreciates our comprehensive wellness services.",
        descriptionJa: "飯田橋はオフィス、大学、そして美しい神楽坂が融合する多様なエリアです。さまざまな層の方々に、Pitonneの総合的なウェルネスサービスをご利用いただいています。",
        highlights: [
          "30-minute drive from clinic",
          "Mixed-use neighborhood",
          "University area",
          "Flexible scheduling"
        ],
        highlightsJa: [
          "クリニックから車で30分",
          "複合的な街並み",
          "大学エリア",
          "柔軟なスケジュール対応"
        ],
        landmarks: ["Tokyo Dome City", "Kagurazaka", "Canal Cafe"],
        landmarksJa: ["東京ドームシティ", "神楽坂", "カナルカフェ"]
      },
      {
        slug: "akihabara",
        name: "Akihabara",
        nameJa: "秋葉原",
        description: "Akihabara is world-famous as Tokyo's electronics and anime district. The area's tech professionals and visiting enthusiasts sometimes need our energy and recovery IV treatments.",
        descriptionJa: "秋葉原は東京の電気街・アニメの聖地として世界的に有名です。このエリアのテック系プロフェッショナルや訪問されるファンの方々が、エナジー点滴やリカバリー点滴をご利用になることがあります。",
        highlights: [
          "30-minute drive from clinic",
          "Tech and gaming district",
          "Tourist destination",
          "Energy treatments popular"
        ],
        highlightsJa: [
          "クリニックから車で30分",
          "テック・ゲームの街",
          "観光名所",
          "エナジー治療が人気"
        ],
        landmarks: ["Yodobashi Camera", "Radio Kaikan", "mAAch ecute"],
        landmarksJa: ["ヨドバシカメラ", "ラジオ会館", "マーチエキュート神田万世橋"]
      }
    ]
  },
  {
    slug: "shinagawa",
    name: "Shinagawa",
    nameJa: "品川区",
    description: "Shinagawa ward is a major business and transportation hub, home to many corporate headquarters and the Shinkansen station connecting Tokyo to western Japan. Our IV therapy services support the busy professionals passing through this vital area.",
    descriptionJa: "品川区は、多くの企業が集まるビジネス街であり、新幹線が発着する品川駅を有する東京の主要な交通拠点です。 Pitonneでは、品川区にお住まいの方やご滞在中の方へ、訪問点滴、再生医療関連の健康サポート、オンライン処方、自費血液検査をご提供しています。 ご自宅やホテル、オフィスへ看護師が訪問し、医師と連携しながら、お客様一人ひとりに合わせたケアをご案内しています。",
    areas: [
      {
        slug: "gotanda",
        name: "Gotanda",
        nameJa: "五反田",
        description: "Gotanda is a commercial district with a growing startup scene and active nightlife. Young professionals and entrepreneurs here value our energy and recovery treatments.",
        descriptionJa: "五反田は成長中のスタートアップシーンと活気あるナイトライフが特徴の商業地区です。若いプロフェッショナルや起業家の方々に、Pitonneのエナジー治療やリカバリー治療が支持されています。",
        highlights: [
          "15-minute drive from clinic",
          "Startup hub",
          "Nightlife district",
          "Hangover IVs popular"
        ],
        highlightsJa: [
          "クリニックから車で15分",
          "スタートアップの集積地",
          "ナイトライフエリア",
          "二日酔い点滴が人気"
        ],
        landmarks: ["TOC Building", "Gotanda Station", "Meguro River nearby"],
        landmarksJa: ["TOCビル", "五反田駅", "目黒川（近隣）"]
      },
      {
        slug: "takanawa",
        name: "Takanawa",
        nameJa: "高輪",
        description: "Takanawa is an upscale area featuring grand hotels and quiet residential streets. The neighborhood's luxury hotels frequently request our concierge IV therapy services for their guests.",
        descriptionJa: "高輪はグランドホテルと閑静な住宅街が特徴の高級エリアです。このエリアの高級ホテルが、宿泊ゲストのためにPitonneのコンシェルジュ点滴療法サービスを頻繁にご依頼されています。",
        highlights: [
          "20-minute drive from clinic",
          "Luxury hotel area",
          "Residential district",
          "Premium service focus"
        ],
        highlightsJa: [
          "クリニックから車で20分",
          "高級ホテルエリア",
          "住宅地区",
          "プレミアムサービスに特化"
        ],
        landmarks: ["Takanawa Gateway Station", "Grand Prince Hotels", "Sengakuji Temple"],
        landmarksJa: ["高輪ゲートウェイ駅", "グランドプリンスホテル", "泉岳寺"]
      },
      {
        slug: "osaki",
        name: "Osaki",
        nameJa: "大崎",
        description: "Osaki has transformed into a modern business district with the Gate City complex. Corporate professionals in this area use our IV therapy services for wellness and performance support.",
        descriptionJa: "大崎はゲートシティを中心にモダンなビジネス地区へと変貌を遂げました。このエリアのビジネスプロフェッショナルの方々が、ウェルネスとパフォーマンスサポートのためにPitonneの点滴療法サービスをご利用されています。",
        highlights: [
          "20-minute drive from clinic",
          "Modern business complex",
          "Corporate clients",
          "Office visits available"
        ],
        highlightsJa: [
          "クリニックから車で20分",
          "モダンなビジネス複合施設",
          "法人のお客様",
          "オフィス訪問対応可能"
        ],
        landmarks: ["Gate City Osaki", "ThinkPark Tower", "O Art Museum"],
        landmarksJa: ["ゲートシティ大崎", "シンクパークタワー", "O美術館"]
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
