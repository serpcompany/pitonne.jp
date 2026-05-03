import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

const posts: Record<string, { title: string; date: string; content: string[] }> = {
  "exosome-iv-drip": {
    title: "What Is An Exosome IV Drip? Differences From Stem Cell Conditioned Media, Cost, And Risks Explained",
    date: "April 29, 2026",
    content: [
      "Exosome IV drips have gained attention in the wellness and regenerative medicine space. But what exactly are they, and how do they differ from other stem cell-related treatments?",
      "Exosomes are tiny vesicles released by cells that carry proteins, lipids, and genetic material. They play a role in cell-to-cell communication and may support various biological processes. When delivered intravenously, exosomes are thought to support cellular function and recovery.",
      "Unlike stem cell treatments that involve administering actual stem cells, exosome therapy uses the signaling molecules derived from stem cells. This makes them different from stem cell conditioned media, which contains the full range of substances secreted by stem cells in culture.",
      "The cost of exosome IV drips can vary significantly depending on the source, concentration, and provider. At Pitonne, we offer transparent pricing and detailed consultations to help you understand what you're receiving.",
      "As with any treatment, there are potential risks to consider. While exosome therapy is generally considered safe when performed by qualified professionals, individual responses may vary. We recommend discussing your medical history and expectations during a consultation.",
    ],
  },
  "iv-therapy-fatigue": {
    title: "IV Therapy For Fatigue: When Low Energy May Point To Hydration Support",
    date: "March 16, 2026",
    content: [
      "Fatigue is a common complaint among busy professionals, travelers, and those with demanding lifestyles. While there are many potential causes of low energy, dehydration and nutrient deficiencies are often overlooked factors.",
      "IV therapy delivers fluids, vitamins, and minerals directly into the bloodstream, bypassing the digestive system for more efficient absorption. This can be particularly helpful when fatigue is related to dehydration or vitamin deficiencies.",
      "Common IV therapy components for fatigue include B vitamins, which play a crucial role in energy metabolism, magnesium for muscle function and relaxation, and vitamin C for immune support and antioxidant protection.",
      "It's important to note that IV therapy is not a cure-all for fatigue. Persistent low energy should be evaluated by a healthcare provider to rule out underlying conditions. IV therapy works best as part of a comprehensive approach to wellness.",
      "At Pitonne, our registered nurses can provide IV therapy in the comfort of your home or hotel. We offer personalized consultations to determine if IV therapy may be appropriate for your situation.",
    ],
  },
  "iv-therapy-hangover": {
    title: "IV Therapy For Hangover: What It May Help With And What It Cannot Do",
    date: "March 16, 2026",
    content: [
      "Hangover IV therapy has become popular for rapid recovery after drinking. But what can it actually help with, and what are its limitations?",
      "Alcohol consumption leads to dehydration, electrolyte imbalances, and inflammation. IV therapy addresses dehydration directly by delivering fluids into the bloodstream, which can help relieve symptoms like headache and fatigue more quickly than oral hydration alone.",
      "Our hangover IV typically includes saline for hydration, B vitamins depleted by alcohol metabolism, anti-nausea medication when appropriate, and electrolytes to restore balance.",
      "However, IV therapy cannot reverse all effects of alcohol. It won't eliminate alcohol from your system faster, prevent long-term effects of heavy drinking, or address underlying issues with alcohol consumption.",
      "For best results, we recommend combining IV therapy with rest, proper nutrition, and moderate alcohol consumption. If you experience frequent severe hangovers, it may be worth discussing your drinking patterns with a healthcare provider.",
    ],
  },
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const post = posts[slug]
  
  if (!post) {
    return {
      title: "Post Not Found | Pitonne Blog",
    }
  }

  return {
    title: `${post.title} | Pitonne Blog`,
    description: post.content[0],
  }
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const post = posts[slug]

  if (!post) {
    notFound()
  }

  return (
    <>
      {/* Article Header */}
      <section className="relative bg-[#faf9f7] overflow-hidden py-16 lg:py-20">
        <div className="container mx-auto px-4 relative z-10">
          <nav className="text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">&gt;</span>
            <Link href="/blog" className="hover:text-foreground">Blog</Link>
            <span className="mx-2">&gt;</span>
            <span className="truncate max-w-[200px] inline-block align-bottom">Article</span>
          </nav>
          
          <time className="text-sm text-muted-foreground">{post.date}</time>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif mt-4 max-w-4xl">
            {post.title}
          </h1>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto prose prose-lg">
            {post.content.map((paragraph, index) => (
              <p key={index} className="text-muted-foreground mb-6 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </article>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif mb-6">Have Questions?</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
            Contact us to learn more about our services or to schedule a consultation.
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
              className="inline-block border border-[#1a1a1a] text-[#1a1a1a] px-8 py-3 rounded-md text-sm font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
