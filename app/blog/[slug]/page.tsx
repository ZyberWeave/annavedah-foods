import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { blogPosts } from '@/lib/content'

type BlogPageProps = {
  params: Promise<{ slug: string }>
}

// Tag → accent color palette (same as listing page)
const TAG_COLORS: Record<string, { bg: string; text: string; dot: string; hero: string }> = {
  Nutrition:        { bg: '#e8f5e9', text: '#2e7d32', dot: '#4caf50',  hero: 'from-[#1b5e20] to-[#388e3c]' },
  Cooking:          { bg: '#fff3e0', text: '#e65100', dot: '#ff9800',  hero: 'from-[#bf360c] to-[#e64a19]' },
  Wellness:         { bg: '#fce4ec', text: '#880e4f', dot: '#e91e63',  hero: 'from-[#880e4f] to-[#c2185b]' },
  Grains:           { bg: '#fff8e1', text: '#f57f17', dot: '#ffc107',  hero: 'from-[#e65100] to-[#f57f17]' },
  Heritage:         { bg: '#f3e5f5', text: '#6a1b9a', dot: '#9c27b0',  hero: 'from-[#4a148c] to-[#7b1fa2]' },
  Meals:            { bg: '#e8eaf6', text: '#283593', dot: '#3f51b5',  hero: 'from-[#1a237e] to-[#3949ab]' },
  Pulses:           { bg: '#e0f2f1', text: '#004d40', dot: '#009688',  hero: 'from-[#004d40] to-[#00796b]' },
  'Meal Prep':      { bg: '#e8f5e9', text: '#1b5e20', dot: '#4caf50',  hero: 'from-[#1b5e20] to-[#2e7d32]' },
  Kitchen:          { bg: '#fff3e0', text: '#bf360c', dot: '#ff5722',  hero: 'from-[#bf360c] to-[#d84315]' },
  Superfoods:       { bg: '#e8f5e9', text: '#1b5e20', dot: '#66bb6a',  hero: 'from-[#1b5e20] to-[#388e3c]' },
  Health:           { bg: '#e3f2fd', text: '#0d47a1', dot: '#2196f3',  hero: 'from-[#0d47a1] to-[#1565c0]' },
  Ayurveda:         { bg: '#f3e5f5', text: '#6a1b9a', dot: '#ba68c8',  hero: 'from-[#6a1b9a] to-[#8e24aa]' },
  Millets:          { bg: '#f9fbe7', text: '#558b2f', dot: '#aed581',  hero: 'from-[#33691e] to-[#558b2f]' },
  Ragi:             { bg: '#e8f5e9', text: '#2e7d32', dot: '#81c784',  hero: 'from-[#2e7d32] to-[#43a047]' },
  Spices:           { bg: '#fff3e0', text: '#bf360c', dot: '#ff7043',  hero: 'from-[#bf360c] to-[#e64a19]' },
  Immunity:         { bg: '#e8f5e9', text: '#1b5e20', dot: '#4caf50',  hero: 'from-[#1b5e20] to-[#2e7d32]' },
  Seasonal:         { bg: '#e3f2fd', text: '#0d47a1', dot: '#42a5f5',  hero: 'from-[#01579b] to-[#0277bd]' },
  Ghee:             { bg: '#fff8e1', text: '#f57f17', dot: '#ffd54f',  hero: 'from-[#e65100] to-[#f9a825]' },
  Sustainability:   { bg: '#f1f8e9', text: '#1b5e20', dot: '#8bc34a',  hero: 'from-[#1b5e20] to-[#558b2f]' },
  Breads:           { bg: '#efebe9', text: '#4e342e', dot: '#a1887f',  hero: 'from-[#3e2723] to-[#5d4037]' },
}

function getTagStyle(tag: string) {
  return TAG_COLORS[tag] ?? { bg: '#f5f5f5', text: '#555', dot: '#999', hero: 'from-[#2d1b15] to-[#8b1a1a]' }
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find((entry) => entry.slug === slug)
  if (!post) return { title: 'Blog Post Not Found | Annavedah Foods' }
  return {
    title: `${post.title} | Annavedah Foods Blog`,
    description: post.summary,
    keywords: ['blog', 'nutrition', 'Ayurveda', 'traditional foods', ...post.tags],
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params
  const post = blogPosts.find((entry) => entry.slug === slug)
  if (!post) notFound()

  const postIndex = blogPosts.findIndex((e) => e.slug === slug)
  const primaryTag = post!.tags[0]
  const tagStyle = getTagStyle(primaryTag)
  const readTime = Math.max(2, Math.ceil(post!.body.join(' ').split(' ').length / 180))
  const formattedDate = new Date(post!.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  // Prev / Next posts
  const prevPost = postIndex > 0 ? blogPosts[postIndex - 1] : null
  const nextPost = postIndex < blogPosts.length - 1 ? blogPosts[postIndex + 1] : null

  // Related posts (same tag, not this one)
  const related = blogPosts
    .filter((p) => p.slug !== slug && p.tags.some((t) => post!.tags.includes(t)))
    .slice(0, 3)

  return (
    <div className="min-h-screen" style={{ background: '#faf6f0' }}>

      {/* Hero banner */}
      <div
        className={`relative overflow-hidden site-page-gap pb-20 bg-gradient-to-br ${tagStyle.hero}`}
        style={{ backgroundImage: `linear-gradient(135deg, #2d1b15 0%, #8b1a1a 100%)` }}
      >
        {/* Dot grid decoration */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        {/* Orb glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${tagStyle.dot}, transparent)`, transform: 'translate(20%, -20%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${tagStyle.dot}, transparent)`, transform: 'translate(-20%, 20%)' }} />

        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-semibold mb-8 group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Back to Journal
          </Link>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {post!.tags.map((tag) => {
              const ts = getTagStyle(tag)
              return (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: ts.dot }} />
                  {tag}
                </span>
              )
            })}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
            {post!.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-5 text-white/60 text-sm">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formattedDate}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {readTime} min read
            </span>
            <span className="ml-auto text-white/30 text-xs font-mono">
              #{String(postIndex + 1).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Hero image */}
      {post!.image && (
        <div className="container mx-auto px-4 max-w-4xl -mt-12 relative z-10 mb-8">
          <div className="relative w-full h-64 md:h-96 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20">
            <Image src={post!.image} alt={post!.title} fill className="object-cover" priority />
          </div>
        </div>
      )}

      {/* Article body */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid lg:grid-cols-[1fr_280px] gap-12 items-start">

          {/* Main content */}
          <article>
            {/* Summary pull-quote */}
            <div
              className="rounded-2xl p-6 mb-10 border-l-4"
              style={{ background: tagStyle.bg, borderColor: tagStyle.dot }}
            >
              <p className="text-lg font-semibold italic leading-relaxed" style={{ color: tagStyle.text }}>
                "{post!.summary}"
              </p>
            </div>

            {/* Body paragraphs with decorative first-letter */}
            <div className="space-y-7">
              {post!.body.map((paragraph, index) => (
                <div key={index} className="relative">
                  {index === 0 ? (
                    <p
                      className="text-lg leading-relaxed first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none"
                      style={{ color: '#3d2b20', ['--tw-first-letter-color' as string]: tagStyle.dot }}
                    >
                      <span
                        style={{
                          float: 'left',
                          fontSize: '4rem',
                          lineHeight: '0.85',
                          marginRight: '0.15em',
                          marginTop: '0.05em',
                          fontWeight: 900,
                          color: tagStyle.dot,
                          fontFamily: 'Georgia, serif',
                        }}
                      >
                        {paragraph[0]}
                      </span>
                      {paragraph.slice(1)}
                    </p>
                  ) : (
                    <p className="text-lg leading-relaxed" style={{ color: '#3d2b20' }}>
                      {paragraph}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-12">
              <div className="h-px flex-1" style={{ background: '#e8ddd0' }} />
              <div className="w-2 h-2 rounded-full" style={{ background: tagStyle.dot }} />
              <div className="w-2 h-2 rounded-full" style={{ background: '#e8ddd0' }} />
              <div className="w-2 h-2 rounded-full" style={{ background: tagStyle.dot }} />
              <div className="h-px flex-1" style={{ background: '#e8ddd0' }} />
            </div>

            {/* Prev / Next navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevPost && (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="group flex flex-col gap-1 p-5 rounded-2xl border-2 border-[#e8ddd0] hover:border-[#c9a45c] transition-all"
                  style={{ background: '#fff' }}
                >
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#b0a090' }}>← Previous</span>
                  <span className="text-sm font-semibold group-hover:text-[#8b1a1a] transition-colors line-clamp-2" style={{ color: '#2d1b15' }}>
                    {prevPost.title}
                  </span>
                </Link>
              )}
              {nextPost && (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="group flex flex-col gap-1 p-5 rounded-2xl border-2 border-[#e8ddd0] hover:border-[#c9a45c] transition-all text-right sm:ml-auto w-full"
                  style={{ background: '#fff' }}
                >
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#b0a090' }}>Next →</span>
                  <span className="text-sm font-semibold group-hover:text-[#8b1a1a] transition-colors line-clamp-2" style={{ color: '#2d1b15' }}>
                    {nextPost.title}
                  </span>
                </Link>
              )}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky site-sticky-top">
            {/* About this topic */}
            <div
              className="rounded-2xl p-6"
              style={{ background: '#fff', border: '2px solid #e8ddd0' }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#b0a090' }}>Topics</p>
              <div className="flex flex-wrap gap-2">
                {post!.tags.map((tag) => {
                  const ts = getTagStyle(tag)
                  return (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{ background: ts.bg, color: ts.text }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: ts.dot }} />
                      {tag}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <div
                className="rounded-2xl p-6"
                style={{ background: '#fff', border: '2px solid #e8ddd0' }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#b0a090' }}>Related Articles</p>
                <div className="space-y-4">
                  {related.map((rp) => {
                    const rt = getTagStyle(rp.tags[0])
                    return (
                      <Link
                        key={rp.slug}
                        href={`/blog/${rp.slug}`}
                        className="group block"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-1 h-12 rounded-full shrink-0 mt-1" style={{ background: rt.dot }} />
                          <p className="text-sm font-semibold leading-snug group-hover:text-[#8b1a1a] transition-colors" style={{ color: '#2d1b15' }}>
                            {rp.title}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* CTA card */}
            <div
              className="rounded-2xl p-6 text-white relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #2d1b15, #8b1a1a)' }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c9a45c, transparent)', transform: 'translate(30%, -30%)' }} />
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#c9a45c' }}>Annavedah Shop</p>
              <p className="text-sm font-semibold text-white/90 mb-4 leading-relaxed">
                Explore our range of traditional, farm-sourced foods.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                style={{ background: '#c9a45c', color: '#2d1b15' }}
              >
                Shop Now
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
