// Static blog post data - used as fallback when Sanity CMS is not configured

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  publishedAt: string
  category: string
  categorySlug: string
  author: {
    name: string
    role: string
  }
  readingTime: number
  featured?: boolean
}

export const blogPosts: BlogPost[] = [
  {
    slug: "iv-vitamin-therapy-benefits",
    title: "The Complete Guide to IV Vitamin Therapy: Benefits, Process, and What to Expect",
    excerpt: "Discover how IV vitamin therapy delivers essential nutrients directly to your bloodstream for maximum absorption and faster results than oral supplements.",
    content: `
      <h2>What is IV Vitamin Therapy?</h2>
      <p>IV vitamin therapy is a medical treatment that delivers vitamins, minerals, and other essential nutrients directly into your bloodstream through an intravenous drip. Unlike oral supplements that must pass through your digestive system, IV therapy bypasses the gut entirely, allowing for nearly 100% absorption of nutrients.</p>
      
      <p>At Pitonne, we offer customized IV vitamin cocktails tailored to your specific health needs and wellness goals. Whether you're looking to boost your energy, strengthen your immune system, or recover from a long flight, our medical team will create the perfect formula for you.</p>
      
      <h2>Key Benefits of IV Vitamin Therapy</h2>
      
      <h3>1. Maximum Nutrient Absorption</h3>
      <p>When you take vitamins orally, your body typically absorbs only 20-50% of the nutrients due to the digestive process. IV therapy delivers nutrients directly to your cells, ensuring you receive the full benefit of every vitamin and mineral.</p>
      
      <h3>2. Immediate Results</h3>
      <p>Because the nutrients enter your bloodstream directly, many clients report feeling the effects within hours rather than days or weeks. This makes IV therapy ideal for situations where you need quick results, such as recovering from jet lag or preparing for an important event.</p>
      
      <h3>3. Customizable Formulas</h3>
      <p>Every person's nutritional needs are different. Our medical team can customize your IV drip based on your specific health concerns, lifestyle, and goals. Popular additions include B-complex vitamins, vitamin C, magnesium, and glutathione.</p>
      
      <h3>4. Hydration Boost</h3>
      <p>IV therapy also provides deep hydration, which is essential for overall health and particularly beneficial after travel, exercise, or illness. The saline solution used in IV drips helps replenish fluids at the cellular level.</p>
      
      <h2>What to Expect During Your Session</h2>
      
      <p>Your IV vitamin therapy session at Pitonne is designed to be comfortable and relaxing:</p>
      
      <ol>
        <li><strong>Consultation:</strong> Our medical team will discuss your health history, current concerns, and wellness goals to determine the best IV formula for you.</li>
        <li><strong>Preparation:</strong> You'll be seated in a comfortable chair in our private treatment room. A small needle will be inserted into your arm.</li>
        <li><strong>Treatment:</strong> The IV drip typically takes 30-60 minutes depending on the formula. You can read, work on your laptop, or simply relax during this time.</li>
        <li><strong>Post-Treatment:</strong> After the session, you're free to return to your normal activities immediately. Many clients report feeling energized and refreshed.</li>
      </ol>
      
      <h2>Popular IV Therapy Options at Pitonne</h2>
      
      <p>We offer several signature IV therapy formulas:</p>
      
      <ul>
        <li><strong>Energy & Fatigue Recovery:</strong> Perfect for busy professionals or those experiencing chronic fatigue</li>
        <li><strong>Immune Boost:</strong> High-dose vitamin C and zinc to support your immune system</li>
        <li><strong>Hangover Recovery:</strong> Rapid rehydration and nausea relief</li>
        <li><strong>Skin Brightening:</strong> Glutathione and vitamin C for a radiant complexion</li>
        <li><strong>Exosome IV Drip:</strong> Our premium anti-aging treatment with cutting-edge exosome technology</li>
      </ul>
      
      <h2>Is IV Therapy Right for You?</h2>
      
      <p>IV vitamin therapy is safe for most adults and can benefit anyone looking to optimize their health. It's particularly popular among:</p>
      
      <ul>
        <li>Frequent travelers dealing with jet lag</li>
        <li>Busy professionals seeking an energy boost</li>
        <li>Athletes looking to enhance recovery</li>
        <li>Those preparing for or recovering from events</li>
        <li>Anyone interested in preventive wellness</li>
      </ul>
      
      <p>Contact Pitonne today to schedule your consultation and discover how IV vitamin therapy can help you feel your best.</p>
    `,
    publishedAt: "2024-12-15",
    category: "IV Therapy",
    categorySlug: "iv-therapy",
    author: {
      name: "Pitonne Medical Team",
      role: "Wellness Experts"
    },
    readingTime: 6,
    featured: true
  },
  {
    slug: "stem-cell-therapy-explained",
    title: "Understanding Stem Cell Therapy: A Revolutionary Approach to Wellness",
    excerpt: "Learn about the science behind stem cell therapy and how exosome treatments are changing the landscape of regenerative medicine.",
    content: `
      <h2>The Science of Stem Cell Therapy</h2>
      <p>Stem cell therapy represents one of the most exciting frontiers in modern medicine. At its core, this treatment harnesses your body's natural healing mechanisms to repair, regenerate, and rejuvenate tissues at the cellular level.</p>
      
      <p>At Pitonne, we specialize in exosome-based treatments, which utilize the communication signals from stem cells to deliver powerful regenerative benefits without the need for actual stem cell transplantation.</p>
      
      <h2>What Are Exosomes?</h2>
      <p>Exosomes are tiny vesicles (30-150 nanometers) released by cells, particularly stem cells, that carry proteins, lipids, and genetic material. Think of them as "messenger packages" that cells use to communicate with each other. When delivered therapeutically, exosomes can:</p>
      
      <ul>
        <li>Reduce inflammation throughout the body</li>
        <li>Promote tissue repair and regeneration</li>
        <li>Support cellular communication and function</li>
        <li>Enhance skin health and appearance</li>
        <li>Support cognitive function</li>
      </ul>
      
      <h2>Exosome IV Drip: Our Premium Treatment</h2>
      <p>Our Exosome IV Drip delivers billions of exosomes directly into your bloodstream, allowing them to travel throughout your body and support cellular health from head to toe. This treatment is particularly popular among clients seeking:</p>
      
      <ul>
        <li>Anti-aging benefits</li>
        <li>Enhanced energy and vitality</li>
        <li>Improved skin quality</li>
        <li>Faster recovery from physical stress</li>
        <li>Overall wellness optimization</li>
      </ul>
      
      <h2>Stem Cell Nasal Spray: Targeted Cognitive Support</h2>
      <p>Our Stem Cell Nasal Spray offers a unique delivery method that targets the brain and nervous system directly. The nasal passage provides a direct route to the brain, bypassing the blood-brain barrier and delivering exosomes where they can support cognitive function and mental clarity.</p>
      
      <p>This treatment is ideal for:</p>
      <ul>
        <li>Professionals seeking mental clarity</li>
        <li>Those experiencing brain fog</li>
        <li>Anyone interested in cognitive optimization</li>
        <li>Individuals seeking neuroprotective benefits</li>
      </ul>
      
      <h2>What Makes Pitonne Different</h2>
      <p>At Pitonne, we combine cutting-edge science with personalized care. Our treatments are administered by licensed medical professionals in a discreet, comfortable setting. We also offer the convenience of in-home or hotel visits throughout Tokyo, making it easy to prioritize your wellness no matter how busy your schedule.</p>
      
      <p>Contact us to learn more about how stem cell-derived treatments can support your health and wellness goals.</p>
    `,
    publishedAt: "2024-11-28",
    category: "Stem Cell Therapy",
    categorySlug: "stem-cell-therapy",
    author: {
      name: "Pitonne Medical Team",
      role: "Wellness Experts"
    },
    readingTime: 5
  },
  {
    slug: "hangover-iv-drip-tokyo",
    title: "The Best Hangover Cure in Tokyo: IV Drip Therapy",
    excerpt: "Discover why IV drip therapy is the fastest and most effective way to recover from a hangover, especially for busy travelers and professionals in Tokyo.",
    content: `
      <h2>Why Hangovers Hit Hard</h2>
      <p>A hangover is your body's response to alcohol's toxic effects. When you drink, your body works overtime to metabolize alcohol, depleting essential nutrients and causing dehydration. Common hangover symptoms include:</p>
      
      <ul>
        <li>Severe headache</li>
        <li>Nausea and stomach discomfort</li>
        <li>Extreme fatigue</li>
        <li>Dizziness</li>
        <li>Sensitivity to light and sound</li>
        <li>Difficulty concentrating</li>
      </ul>
      
      <h2>Why IV Therapy Works Better Than Traditional Remedies</h2>
      <p>Coffee, greasy food, and pain relievers might provide temporary relief, but they don't address the root cause of your hangover. IV therapy works because it directly targets the underlying issues:</p>
      
      <h3>Rapid Rehydration</h3>
      <p>Alcohol is a diuretic, meaning it causes your body to lose fluids faster than normal. IV therapy delivers fluids directly to your bloodstream, rehydrating you at the cellular level in minutes rather than hours.</p>
      
      <h3>Nutrient Replenishment</h3>
      <p>Alcohol depletes B vitamins, vitamin C, magnesium, and other essential nutrients. Our hangover IV includes a carefully balanced blend of vitamins and minerals to restore what you've lost.</p>
      
      <h3>Anti-Nausea Medication</h3>
      <p>Our IV formula can include anti-nausea medication to provide immediate relief from stomach discomfort, allowing you to keep food and water down.</p>
      
      <h3>Pain Relief</h3>
      <p>We can add anti-inflammatory medication to help relieve headache and body aches quickly and effectively.</p>
      
      <h2>Perfect for Tokyo Travelers and Professionals</h2>
      <p>Tokyo's business and entertainment culture often involves social drinking. Whether you're entertaining clients in Roppongi, celebrating a deal in Ginza, or enjoying Tokyo's nightlife, we understand that sometimes recovery needs to be quick.</p>
      
      <p>Our mobile service brings hangover relief directly to your hotel room or home. There's no need to struggle through a commute or sit in a clinic when you're feeling your worst. We come to you, providing discreet, professional service wherever you are in central Tokyo.</p>
      
      <h2>What to Expect</h2>
      <p>A typical hangover IV session at Pitonne takes about 30-45 minutes. Most clients report feeling significantly better within 30 minutes of starting the drip, and the effects continue to improve over the following hours.</p>
      
      <p>Many of our clients schedule early morning appointments before important meetings, ensuring they're at their best when it matters most.</p>
      
      <h2>Book Your Recovery Session</h2>
      <p>Don't let a hangover derail your day. Contact Pitonne to schedule your in-room IV therapy session. We offer same-day appointments throughout central Tokyo, including Roppongi, Azabu, Shibuya, Ginza, and surrounding areas.</p>
    `,
    publishedAt: "2024-11-15",
    category: "IV Therapy",
    categorySlug: "iv-therapy",
    author: {
      name: "Pitonne Medical Team",
      role: "Wellness Experts"
    },
    readingTime: 5
  },
  {
    slug: "jet-lag-recovery-tips",
    title: "Beat Jet Lag Fast: Expert Tips for International Travelers",
    excerpt: "Learn proven strategies for overcoming jet lag, including how IV therapy can help you adjust to Tokyo time quickly.",
    content: `
      <h2>Understanding Jet Lag</h2>
      <p>Jet lag occurs when your internal body clock (circadian rhythm) is out of sync with the local time zone. Flying across multiple time zones disrupts your sleep-wake cycle, hormone production, and various bodily functions.</p>
      
      <p>Common jet lag symptoms include:</p>
      <ul>
        <li>Difficulty sleeping or staying awake</li>
        <li>Fatigue and weakness</li>
        <li>Difficulty concentrating</li>
        <li>Digestive problems</li>
        <li>General malaise</li>
      </ul>
      
      <h2>Pre-Flight Preparation</h2>
      
      <h3>Adjust Your Schedule Before You Leave</h3>
      <p>If you're traveling east (like from the US to Japan), try going to bed and waking up an hour earlier each day for several days before your trip. This gradual adjustment can reduce the shock to your system.</p>
      
      <h3>Stay Hydrated</h3>
      <p>Dehydration worsens jet lag symptoms. Start increasing your water intake a few days before your flight and continue during the journey. Avoid alcohol and caffeine, which can dehydrate you further.</p>
      
      <h3>Rest Up</h3>
      <p>Don't start your trip exhausted. Get plenty of sleep in the days leading up to your departure.</p>
      
      <h2>During Your Flight</h2>
      
      <ul>
        <li>Set your watch to your destination's time zone as soon as you board</li>
        <li>Sleep according to your destination's schedule</li>
        <li>Move around the cabin regularly to improve circulation</li>
        <li>Stay hydrated with water and avoid alcohol</li>
        <li>Use eye masks and earplugs to improve sleep quality</li>
      </ul>
      
      <h2>After Arrival in Tokyo</h2>
      
      <h3>Get Natural Light</h3>
      <p>Sunlight is the most powerful cue for resetting your circadian rhythm. Spend time outside during daylight hours, especially in the morning.</p>
      
      <h3>Stay Active</h3>
      <p>Light exercise can help reset your body clock and improve your energy levels. Even a short walk around your hotel neighborhood can help.</p>
      
      <h3>Avoid Long Naps</h3>
      <p>While it's tempting to crash when you arrive, long naps can make it harder to adjust. If you must nap, limit it to 20-30 minutes.</p>
      
      <h2>How IV Therapy Accelerates Recovery</h2>
      <p>At Pitonne, we offer specialized IV therapy designed specifically for jet lag recovery. Our treatment includes:</p>
      
      <ul>
        <li><strong>Rapid Rehydration:</strong> Air travel is extremely dehydrating. Our IV delivers fluids directly to restore hydration quickly.</li>
        <li><strong>B-Vitamins:</strong> These essential vitamins support energy production and help your body cope with the stress of travel.</li>
        <li><strong>Vitamin C:</strong> Supports immune function, which can be compromised by travel and lack of sleep.</li>
        <li><strong>Magnesium:</strong> Helps with sleep quality and muscle relaxation.</li>
        <li><strong>Electrolytes:</strong> Restore the balance disrupted by air travel and dehydration.</li>
      </ul>
      
      <p>Many business travelers schedule an IV session shortly after arriving in Tokyo, allowing them to recover quickly and be at their best for important meetings the next day.</p>
      
      <h2>Mobile Service for Maximum Convenience</h2>
      <p>We understand that the last thing you want to do after a long flight is travel across the city. That's why we bring our services directly to your hotel or residence. Simply book your appointment, and our medical team will arrive at your location with everything needed for your treatment.</p>
      
      <p>Contact Pitonne to schedule your jet lag recovery session and start your Tokyo visit feeling refreshed and energized.</p>
    `,
    publishedAt: "2024-10-30",
    category: "Wellness Tips",
    categorySlug: "wellness",
    author: {
      name: "Pitonne Medical Team",
      role: "Wellness Experts"
    },
    readingTime: 6
  },
  {
    slug: "glutathione-skin-brightening",
    title: "Glutathione IV Therapy: The Secret to Radiant, Brighter Skin",
    excerpt: "Discover why glutathione is called the 'master antioxidant' and how IV therapy can help you achieve a brighter, more even skin tone.",
    content: `
      <h2>What is Glutathione?</h2>
      <p>Glutathione is a powerful antioxidant naturally produced by your body. Often called the "master antioxidant," it plays a crucial role in detoxification, immune function, and protecting your cells from oxidative stress.</p>
      
      <p>When it comes to skin health, glutathione is particularly notable for its ability to:</p>
      <ul>
        <li>Inhibit melanin production</li>
        <li>Neutralize free radicals</li>
        <li>Support cellular repair</li>
        <li>Reduce oxidative stress</li>
      </ul>
      
      <h2>How Glutathione Brightens Skin</h2>
      <p>Glutathione works by inhibiting tyrosinase, the enzyme responsible for melanin production. By reducing melanin synthesis, glutathione can help:</p>
      
      <ul>
        <li>Brighten overall skin tone</li>
        <li>Reduce the appearance of dark spots</li>
        <li>Even out skin discoloration</li>
        <li>Create a more radiant complexion</li>
      </ul>
      
      <p>Unlike topical treatments that only affect the skin's surface, IV glutathione works from the inside out, delivering the antioxidant directly to your cells for maximum effectiveness.</p>
      
      <h2>Why IV Delivery is Superior</h2>
      <p>While glutathione supplements are available in oral form, they have limited effectiveness because the digestive system breaks down much of the glutathione before it can be absorbed. IV therapy bypasses the digestive system entirely, delivering 100% of the glutathione directly to your bloodstream.</p>
      
      <p>This means you get:</p>
      <ul>
        <li>Maximum absorption</li>
        <li>Faster results</li>
        <li>Higher effective doses</li>
        <li>More consistent outcomes</li>
      </ul>
      
      <h2>What to Expect from Treatment</h2>
      <p>At Pitonne, our Skin Brightening IV includes high-dose glutathione along with complementary nutrients like vitamin C, which enhances glutathione's effectiveness.</p>
      
      <p>Most clients begin to notice improvements after 4-6 sessions, with optimal results typically seen after 10-12 sessions. We recommend weekly treatments initially, then maintenance sessions every 2-4 weeks to sustain results.</p>
      
      <h2>Additional Benefits</h2>
      <p>While many clients seek glutathione for its skin-brightening effects, the benefits extend far beyond cosmetics:</p>
      
      <ul>
        <li><strong>Detoxification:</strong> Glutathione is essential for liver function and helps remove toxins from your body</li>
        <li><strong>Immune Support:</strong> Supports the function of immune cells</li>
        <li><strong>Anti-Aging:</strong> Protects cells from oxidative damage that contributes to aging</li>
        <li><strong>Energy:</strong> Supports mitochondrial function for better cellular energy production</li>
      </ul>
      
      <h2>Is Glutathione IV Right for You?</h2>
      <p>Glutathione IV therapy is safe for most adults and is particularly popular among those who:</p>
      
      <ul>
        <li>Want to achieve a brighter, more even skin tone</li>
        <li>Are dealing with hyperpigmentation or dark spots</li>
        <li>Seek anti-aging benefits</li>
        <li>Want to support overall health and detoxification</li>
      </ul>
      
      <p>Contact Pitonne to schedule your consultation and learn how our Skin Brightening IV can help you achieve your skincare goals.</p>
    `,
    publishedAt: "2024-10-15",
    category: "IV Therapy",
    categorySlug: "iv-therapy",
    author: {
      name: "Pitonne Medical Team",
      role: "Wellness Experts"
    },
    readingTime: 5
  },
  {
    slug: "immune-boost-winter-wellness",
    title: "Strengthen Your Immune System This Winter with IV Therapy",
    excerpt: "As cold and flu season approaches, learn how IV vitamin therapy can help fortify your immune system and keep you healthy.",
    content: `
      <h2>Why Winter Challenges Your Immune System</h2>
      <p>Winter brings unique challenges for your immune system. Cold, dry air, less sunlight, more time spent indoors with others, and the physical stress of temperature changes all contribute to increased vulnerability to illness.</p>
      
      <p>Add to this the demands of travel during the holiday season, and it's no wonder that colds and flu are so common during winter months.</p>
      
      <h2>Key Nutrients for Immune Health</h2>
      
      <h3>Vitamin C</h3>
      <p>Perhaps the most well-known immune-supporting nutrient, vitamin C supports the production and function of white blood cells, your body's primary defense against pathogens. It's also a powerful antioxidant that protects immune cells from oxidative damage.</p>
      
      <h3>Zinc</h3>
      <p>This essential mineral is crucial for immune cell development and function. Zinc deficiency is associated with increased susceptibility to infections and slower wound healing.</p>
      
      <h3>B Vitamins</h3>
      <p>B vitamins support energy production and help your body cope with stress. They also play important roles in immune cell function and antibody production.</p>
      
      <h3>Vitamin D</h3>
      <p>Often called the "sunshine vitamin," vitamin D is essential for immune function. Many people become deficient during winter months due to reduced sun exposure.</p>
      
      <h2>The IV Advantage</h2>
      <p>While you can get these nutrients from food and supplements, IV therapy offers distinct advantages:</p>
      
      <ul>
        <li><strong>Higher Doses:</strong> IV allows us to deliver much higher doses than would be tolerable orally</li>
        <li><strong>Complete Absorption:</strong> 100% of nutrients reach your bloodstream</li>
        <li><strong>Immediate Effects:</strong> Your cells receive nutrients within minutes</li>
        <li><strong>Hydration:</strong> IV therapy also provides deep hydration, which supports overall immune function</li>
      </ul>
      
      <h2>Our Immune Boost IV</h2>
      <p>Pitonne's Immune Boost IV is specially formulated with high-dose vitamin C, zinc, B-complex vitamins, and other immune-supporting nutrients. This powerful combination helps:</p>
      
      <ul>
        <li>Strengthen your body's natural defenses</li>
        <li>Support recovery if you're already feeling under the weather</li>
        <li>Reduce the duration and severity of cold symptoms</li>
        <li>Boost energy during the demanding winter season</li>
      </ul>
      
      <h2>When to Get an Immune Boost IV</h2>
      <p>Consider scheduling an Immune Boost IV:</p>
      
      <ul>
        <li>Before traveling, especially long flights</li>
        <li>At the first sign of cold symptoms</li>
        <li>During high-stress periods when your immune system is compromised</li>
        <li>Regularly throughout winter as preventive care</li>
        <li>After exposure to someone who is sick</li>
      </ul>
      
      <h2>Convenient Mobile Service</h2>
      <p>Don't want to venture out in the cold when you're feeling vulnerable? We bring our services directly to your home or hotel. Our medical team will arrive with everything needed for your treatment, allowing you to stay comfortable while receiving care.</p>
      
      <p>Stay healthy this winter. Contact Pitonne to schedule your Immune Boost IV and give your immune system the support it needs.</p>
    `,
    publishedAt: "2024-10-01",
    category: "IV Therapy",
    categorySlug: "iv-therapy",
    author: {
      name: "Pitonne Medical Team",
      role: "Wellness Experts"
    },
    readingTime: 5
  }
]

// Helper functions
export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug)
}

export function getPostsByCategory(categorySlug: string): BlogPost[] {
  return blogPosts.filter(post => post.categorySlug === categorySlug)
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter(post => post.featured)
}

export const categories = [
  { slug: "iv-therapy", name: "IV Therapy", description: "Learn about our IV vitamin treatments and their benefits" },
  { slug: "stem-cell-therapy", name: "Stem Cell Therapy", description: "Discover regenerative medicine and exosome treatments" },
  { slug: "wellness", name: "Wellness Tips", description: "General health and wellness advice for busy professionals" }
]

export function getCategoryBySlug(slug: string) {
  return categories.find(cat => cat.slug === slug)
}
