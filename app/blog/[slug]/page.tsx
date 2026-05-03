import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getPost, getAllPostSlugs, formatGhostDate, isGhostConfigured } from "@/lib/ghost"

interface Props {
  params: Promise<{ slug: string }>
}

// Static blog posts data (fallback when Ghost is not configured)
const staticPosts: Record<string, {
  title: string
  date: string
  excerpt: string
  content: string
}> = {
  "exosome-iv-drip": {
    title: "What Is An Exosome IV Drip? Differences From Stem Cell Conditioned Media, Cost, And Risks Explained",
    date: "April 29, 2026",
    excerpt: "Learn about exosome IV drips, how they differ from stem cell conditioned media, what to expect in terms of cost, and potential risks to consider.",
    content: `
      <p>Exosome IV therapy is an emerging treatment in regenerative medicine that delivers tiny vesicles derived from stem cells directly into the bloodstream. These exosomes contain growth factors, proteins, and genetic material that may support cellular repair and regeneration.</p>
      
      <h2>What Are Exosomes?</h2>
      <p>Exosomes are small extracellular vesicles (30-150 nanometers) released by cells, including stem cells. They act as messengers between cells, carrying proteins, lipids, and RNA that can influence the behavior of recipient cells.</p>
      
      <h2>Exosomes vs. Stem Cell Conditioned Media</h2>
      <p>While both come from stem cell cultures, there are key differences:</p>
      <ul>
        <li><strong>Exosomes:</strong> Purified vesicles isolated from cell culture media, containing concentrated cellular signals</li>
        <li><strong>Conditioned Media:</strong> The entire culture fluid containing various secreted factors, including exosomes</li>
      </ul>
      <p>Exosome preparations are generally more concentrated and consistent, though both approaches have their applications.</p>
      
      <h2>Potential Applications</h2>
      <p>Exosome IV therapy is being explored for various wellness and regenerative purposes:</p>
      <ul>
        <li>Supporting cellular repair and recovery</li>
        <li>Promoting healthy aging</li>
        <li>Supporting energy and vitality</li>
        <li>Post-procedure recovery support</li>
      </ul>
      
      <h2>Cost Considerations</h2>
      <p>Exosome IV treatments are typically premium services due to the specialized sourcing and preparation required. Costs vary based on the concentration, source, and treatment protocol. It's important to discuss pricing during your consultation.</p>
      
      <h2>Potential Risks and Considerations</h2>
      <p>As with any medical treatment, there are factors to consider:</p>
      <ul>
        <li>Individual responses vary</li>
        <li>Quality and sourcing of exosomes matters</li>
        <li>Not suitable for everyone - consultation required</li>
        <li>More research is ongoing to understand full effects</li>
      </ul>
      
      <h2>Next Steps</h2>
      <p>If you're interested in learning more about exosome IV therapy, we recommend scheduling a consultation to discuss your health goals, review your medical history, and determine if this treatment may be appropriate for you.</p>
    `
  },
  "iv-therapy-fatigue": {
    title: "IV Therapy For Fatigue: When Low Energy May Point To Hydration Support",
    date: "March 16, 2026",
    excerpt: "Explore how IV therapy may help with fatigue and low energy, and when hydration support could be beneficial for your wellness.",
    content: `
      <p>Chronic fatigue and low energy are common complaints in today's fast-paced world. While there are many potential causes, dehydration and nutrient deficiencies are often overlooked factors that can contribute to persistent tiredness.</p>
      
      <h2>Understanding Fatigue</h2>
      <p>Fatigue can stem from various sources:</p>
      <ul>
        <li>Poor sleep quality</li>
        <li>Stress and mental exhaustion</li>
        <li>Dehydration</li>
        <li>Nutrient deficiencies (B vitamins, iron, magnesium)</li>
        <li>Underlying health conditions</li>
      </ul>
      
      <h2>How IV Therapy May Help</h2>
      <p>IV therapy delivers fluids, vitamins, and minerals directly into the bloodstream, bypassing the digestive system for potentially faster absorption. This may be beneficial when:</p>
      <ul>
        <li>Oral supplements aren't being absorbed efficiently</li>
        <li>Quick rehydration is needed</li>
        <li>Energy needs a boost for performance or recovery</li>
        <li>Recovering from illness or travel</li>
      </ul>
      
      <h2>What to Expect</h2>
      <p>Our Energy & Fatigue Recovery IV typically includes:</p>
      <ul>
        <li>Hydrating saline solution</li>
        <li>B-complex vitamins for energy metabolism</li>
        <li>Vitamin C for immune support</li>
        <li>Magnesium for muscle function</li>
        <li>Other nutrients tailored to your needs</li>
      </ul>
      
      <h2>Is IV Therapy Right for You?</h2>
      <p>IV therapy for fatigue may be appropriate if you're experiencing:</p>
      <ul>
        <li>Persistent tiredness despite adequate sleep</li>
        <li>Recovery from intense physical activity</li>
        <li>Jet lag or travel exhaustion</li>
        <li>Difficulty maintaining energy throughout the day</li>
      </ul>
      
      <p>A consultation helps determine if IV therapy addresses your specific situation and what formulation would be most appropriate.</p>
    `
  },
  "iv-therapy-hangover": {
    title: "IV Therapy For Hangover: What It May Help With And What It Cannot Do",
    date: "March 16, 2026",
    excerpt: "Understand how hangover IV therapy works, what symptoms it may address, and realistic expectations for recovery.",
    content: `
      <p>After a night of drinking, many people experience the familiar discomfort of a hangover. While time and rest are the traditional remedies, hangover IV therapy has become a popular option for faster relief.</p>
      
      <h2>What Causes Hangover Symptoms?</h2>
      <p>Hangovers result from several factors:</p>
      <ul>
        <li><strong>Dehydration:</strong> Alcohol is a diuretic, causing fluid loss</li>
        <li><strong>Electrolyte imbalance:</strong> Important minerals are depleted</li>
        <li><strong>Inflammation:</strong> Alcohol triggers inflammatory responses</li>
        <li><strong>Blood sugar changes:</strong> Alcohol affects glucose metabolism</li>
        <li><strong>Toxin buildup:</strong> The body processes alcohol byproducts</li>
      </ul>
      
      <h2>What Hangover IV Therapy May Help With</h2>
      <p>IV therapy can address several hangover components:</p>
      <ul>
        <li>Rapid rehydration</li>
        <li>Electrolyte replenishment</li>
        <li>Vitamin restoration (especially B vitamins)</li>
        <li>Anti-nausea support</li>
        <li>Headache relief support</li>
      </ul>
      
      <h2>What IV Therapy Cannot Do</h2>
      <p>It's important to have realistic expectations:</p>
      <ul>
        <li>It won't instantly eliminate all symptoms</li>
        <li>It doesn't speed up alcohol metabolism</li>
        <li>It's not a substitute for responsible drinking</li>
        <li>Individual results vary based on severity</li>
      </ul>
      
      <h2>When to Consider Hangover IV</h2>
      <p>Hangover IV therapy may be most beneficial when:</p>
      <ul>
        <li>You have an important commitment and need to function</li>
        <li>Symptoms are moderate to severe</li>
        <li>Oral rehydration isn't working or isn't feasible</li>
        <li>You want professional support during recovery</li>
      </ul>
      
      <p>Our team provides discreet, professional service to help you recover and return to your day.</p>
    `
  },
  "stem-cell-nasal-spray": {
    title: "Stem Cell Nasal Spray: A Convenient Approach to Regenerative Wellness",
    date: "February 28, 2026",
    excerpt: "Discover how stem cell nasal sprays work and their potential role in supporting cognitive wellness and daily recovery.",
    content: `
      <p>Stem cell nasal spray represents an innovative approach to delivering regenerative factors. By using the nasal route, these treatments may offer a convenient alternative to injections or IV therapy for certain wellness goals.</p>
      
      <h2>How Nasal Delivery Works</h2>
      <p>The nasal passage offers a unique route for delivering certain compounds:</p>
      <ul>
        <li>Rich blood supply allows for efficient absorption</li>
        <li>Direct pathway to central nervous system areas</li>
        <li>Bypasses digestive breakdown</li>
        <li>Non-invasive and convenient</li>
      </ul>
      
      <h2>Potential Applications</h2>
      <p>Stem cell nasal sprays are being explored for:</p>
      <ul>
        <li>Cognitive wellness support</li>
        <li>Mental clarity and focus</li>
        <li>Daily recovery and wellness</li>
        <li>Complementing other regenerative treatments</li>
      </ul>
      
      <h2>What to Expect</h2>
      <p>Treatment typically involves:</p>
      <ul>
        <li>Initial consultation to assess suitability</li>
        <li>Customized treatment protocol</li>
        <li>Simple self-administration</li>
        <li>Follow-up to monitor progress</li>
      </ul>
      
      <h2>Is It Right for You?</h2>
      <p>A consultation helps determine if stem cell nasal spray fits your wellness goals and health profile. Our providers review your history and objectives to recommend the most appropriate approach.</p>
    `
  },
  "iv-vitamin-therapy-benefits": {
    title: "IV Vitamin Therapy: Understanding Direct Nutrient Delivery",
    date: "February 15, 2026",
    excerpt: "Learn about IV vitamin therapy, how direct nutrient delivery works, and who may benefit from this approach to wellness.",
    content: `
      <p>IV vitamin therapy delivers essential nutrients directly into the bloodstream, bypassing the digestive system. This approach may offer advantages for absorption and effectiveness compared to oral supplements.</p>
      
      <h2>Why Consider IV Vitamins?</h2>
      <p>Several factors may make IV delivery beneficial:</p>
      <ul>
        <li>Digestive issues affecting nutrient absorption</li>
        <li>Higher doses needed than oral forms allow</li>
        <li>Faster delivery for acute needs</li>
        <li>More consistent blood levels</li>
      </ul>
      
      <h2>Common IV Vitamin Formulations</h2>
      <p>Treatments can be customized but often include:</p>
      <ul>
        <li><strong>Vitamin C:</strong> Immune support, antioxidant</li>
        <li><strong>B Vitamins:</strong> Energy metabolism, nerve function</li>
        <li><strong>Magnesium:</strong> Muscle function, relaxation</li>
        <li><strong>Zinc:</strong> Immune function, healing</li>
        <li><strong>Amino Acids:</strong> Building blocks for recovery</li>
      </ul>
      
      <h2>Who May Benefit</h2>
      <p>IV vitamin therapy may be appropriate for:</p>
      <ul>
        <li>Those with absorption issues</li>
        <li>People recovering from illness</li>
        <li>Athletes and active individuals</li>
        <li>Those with high-stress lifestyles</li>
        <li>Travelers needing immune support</li>
      </ul>
      
      <h2>What to Expect</h2>
      <p>Treatment typically takes 30-60 minutes in a comfortable setting. Our providers monitor you throughout and adjust formulations based on your needs and response.</p>
    `
  },
  "immune-boost-iv": {
    title: "Immune Boost IV Therapy: Supporting Your Body's Natural Defenses",
    date: "January 30, 2026",
    excerpt: "Explore how immune boost IV therapy may support your immune system and when it might be appropriate to consider.",
    content: `
      <p>Your immune system works constantly to protect you from illness and infection. Immune boost IV therapy aims to provide targeted nutritional support for this vital system.</p>
      
      <h2>Key Immune-Supporting Nutrients</h2>
      <p>Our immune boost formulations typically include:</p>
      <ul>
        <li><strong>Vitamin C:</strong> Essential for immune cell function</li>
        <li><strong>Zinc:</strong> Supports immune response and wound healing</li>
        <li><strong>B Vitamins:</strong> Energy for immune cell production</li>
        <li><strong>Glutathione:</strong> Master antioxidant for cellular health</li>
        <li><strong>Selenium:</strong> Supports antioxidant defenses</li>
      </ul>
      
      <h2>When to Consider Immune Support</h2>
      <p>Immune boost IV may be particularly relevant:</p>
      <ul>
        <li>During seasonal changes</li>
        <li>Before or after travel</li>
        <li>During periods of high stress</li>
        <li>When feeling run-down</li>
        <li>As part of overall wellness maintenance</li>
      </ul>
      
      <h2>What IV Therapy Cannot Do</h2>
      <p>Important to understand:</p>
      <ul>
        <li>It's not a treatment for active infections</li>
        <li>It doesn't replace medical care when ill</li>
        <li>Results vary between individuals</li>
        <li>It works best as part of overall healthy habits</li>
      </ul>
      
      <h2>Consultation First</h2>
      <p>We assess your health status and goals to recommend the most appropriate immune support strategy for your situation.</p>
    `
  }
}

export async function generateStaticParams() {
  // Get Ghost posts if configured
  const ghostSlugs = await getAllPostSlugs()
  
  // Combine with static post slugs
  const staticSlugs = Object.keys(staticPosts)
  const allSlugs = [...new Set([...ghostSlugs, ...staticSlugs])]
  
  return allSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  
  // Try Ghost first
  if (isGhostConfigured()) {
    const ghostPost = await getPost(slug)
    if (ghostPost) {
      return {
        title: `${ghostPost.title} | Pitonne Blog`,
        description: ghostPost.excerpt,
      }
    }
  }
  
  // Fallback to static
  const staticPost = staticPosts[slug]
  if (staticPost) {
    return {
      title: `${staticPost.title} | Pitonne Blog`,
      description: staticPost.excerpt,
    }
  }
  
  return { title: "Post Not Found" }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  
  // Try Ghost first
  let post: {
    title: string
    date: string
    content: string
    excerpt: string
    featureImage?: string | null
    readingTime?: number
    author?: { name: string; image?: string | null } | null
  } | null = null
  
  if (isGhostConfigured()) {
    const ghostPost = await getPost(slug)
    if (ghostPost) {
      post = {
        title: ghostPost.title,
        date: formatGhostDate(ghostPost.published_at),
        content: ghostPost.html,
        excerpt: ghostPost.excerpt || "",
        featureImage: ghostPost.feature_image,
        readingTime: ghostPost.reading_time,
        author: ghostPost.primary_author ? {
          name: ghostPost.primary_author.name,
          image: ghostPost.primary_author.profile_image,
        } : null,
      }
    }
  }
  
  // Fallback to static
  if (!post && staticPosts[slug]) {
    post = staticPosts[slug]
  }
  
  if (!post) {
    notFound()
  }

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">&gt;</span>
            <Link href="/blog" className="hover:text-foreground">Blog</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-foreground">Article</span>
          </nav>
          
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
              <time>{post.date}</time>
              {post.readingTime && (
                <>
                  <span>&middot;</span>
                  <span>{post.readingTime} min read</span>
                </>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground leading-tight">
              {post.title}
            </h1>
            {post.author && (
              <div className="mt-6 flex items-center gap-3">
                {post.author.image && (
                  <img 
                    src={post.author.image} 
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <span className="text-muted-foreground">By {post.author.name}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Image */}
      {post.featureImage && (
        <section className="bg-card">
          <div className="container mx-auto px-4 -mt-8">
            <div className="max-w-4xl mx-auto">
              <img 
                src={post.featureImage} 
                alt={post.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto">
            <div 
              className="prose prose-lg prose-gray max-w-none
                prose-headings:font-serif prose-headings:text-foreground
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-li:my-1
                prose-strong:text-foreground
                prose-a:text-[#4AA69D] prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-4">
            Questions About This Topic?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our team is here to help you understand your options and determine the best approach for your wellness goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="inline-block bg-[#4AA69D] text-white px-8 py-3 rounded-md text-sm font-medium hover:bg-[#3d8a83] transition-colors"
            >
              Contact Us
            </Link>
            <Link 
              href="/blog"
              className="inline-block border border-foreground text-foreground px-8 py-3 rounded-md text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
