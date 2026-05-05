'use client'

import Link from 'next/link'
import Image from 'next/image'
import { blogPosts } from '@/lib/content'
import { useState } from 'react'

// Tag → accent color palette
const TAG_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Nutrition:        { bg: '#e8f5e9', text: '#2e7d32', dot: '#4caf50' },
  Cooking:          { bg: '#fff3e0', text: '#e65100', dot: '#ff9800' },
  Wellness:         { bg: '#fce4ec', text: '#880e4f', dot: '#e91e63' },
  Grains:           { bg: '#fff8e1', text: '#f57f17', dot: '#ffc107' },
  Heritage:         { bg: '#f3e5f5', text: '#6a1b9a', dot: '#9c27b0' },
  Meals:            { bg: '#e8eaf6', text: '#283593', dot: '#3f51b5' },
  Pulses:           { bg: '#e0f2f1', text: '#004d40', dot: '#009688' },
  'Meal Prep':      { bg: '#e8f5e9', text: '#1b5e20', dot: '#4caf50' },
  Kitchen:          { bg: '#fff3e0', text: '#bf360c', dot: '#ff5722' },
  Superfoods:       { bg: '#e8f5e9', text: '#1b5e20', dot: '#66bb6a' },
  Health:           { bg: '#e3f2fd', text: '#0d47a1', dot: '#2196f3' },
  Rice:             { bg: '#fff8e1', text: '#e65100', dot: '#ff9800' },
  Breakfast:        { bg: '#fce4ec', text: '#880e4f', dot: '#f06292' },
  Recipes:          { bg: '#f3e5f5', text: '#4a148c', dot: '#ce93d8' },
  Ghee:             { bg: '#fff8e1', text: '#f57f17', dot: '#ffd54f' },
  Ayurveda:         { bg: '#f3e5f5', text: '#6a1b9a', dot: '#ba68c8' },
  Millets:          { bg: '#f9fbe7', text: '#558b2f', dot: '#aed581' },
  Ragi:             { bg: '#e8f5e9', text: '#2e7d32', dot: '#81c784' },
  Honey:            { bg: '#fff8e1', text: '#f57f17', dot: '#ffca28' },
  'Natural Sweeteners': { bg: '#fce4ec', text: '#880e4f', dot: '#f48fb1' },
  Spices:           { bg: '#fff3e0', text: '#bf360c', dot: '#ff7043' },
  Digestion:        { bg: '#e0f7fa', text: '#006064', dot: '#26c6da' },
  Snacks:           { bg: '#fbe9e7', text: '#bf360c', dot: '#ff5722' },
  Culture:          { bg: '#f3e5f5', text: '#4a148c', dot: '#ab47bc' },
  Fasting:          { bg: '#e8eaf6', text: '#1a237e', dot: '#5c6bc0' },
  Tradition:        { bg: '#fce4ec', text: '#880e4f', dot: '#ec407a' },
  Protein:          { bg: '#e8f5e9', text: '#1b5e20', dot: '#43a047' },
  Beans:            { bg: '#efebe9', text: '#3e2723', dot: '#795548' },
  Immunity:         { bg: '#e8f5e9', text: '#1b5e20', dot: '#4caf50' },
  Seasonal:         { bg: '#e3f2fd', text: '#0d47a1', dot: '#42a5f5' },
  'Cooking Hacks':  { bg: '#fff3e0', text: '#e65100', dot: '#ff9800' },
  Vegetables:       { bg: '#f1f8e9', text: '#33691e', dot: '#8bc34a' },
  'Time-saving':    { bg: '#e3f2fd', text: '#0277bd', dot: '#29b6f6' },
  'Cooking Tips':   { bg: '#fff3e0', text: '#e65100', dot: '#fb8c00' },
  'Comfort Food':   { bg: '#fce4ec', text: '#880e4f', dot: '#f06292' },
  Wheat:            { bg: '#fff8e1', text: '#f57f17', dot: '#ffb300' },
  Essentials:       { bg: '#efebe9', text: '#3e2723', dot: '#8d6e63' },
  Sweeteners:       { bg: '#fce4ec', text: '#ad1457', dot: '#f48fb1' },
  Convenience:      { bg: '#e8eaf6', text: '#283593', dot: '#7986cb' },
  Transparency:     { bg: '#e0f7fa', text: '#006064', dot: '#00acc1' },
  Farming:          { bg: '#f1f8e9', text: '#33691e', dot: '#7cb342' },
  Quality:          { bg: '#fff8e1', text: '#f57f17', dot: '#ffa726' },
  Chutney:          { bg: '#fce4ec', text: '#880e4f', dot: '#e91e63' },
  Condiments:       { bg: '#fff3e0', text: '#e65100', dot: '#ff7043' },
  Baking:           { bg: '#fce4ec', text: '#ad1457', dot: '#f06292' },
  'Gluten-Free':    { bg: '#e8f5e9', text: '#2e7d32', dot: '#66bb6a' },
  Sustainability:   { bg: '#f1f8e9', text: '#1b5e20', dot: '#8bc34a' },
  Environment:      { bg: '#e8f5e9', text: '#2e7d32', dot: '#4caf50' },
  Breads:           { bg: '#efebe9', text: '#4e342e', dot: '#a1887f' },
}

function getTagStyle(tag: string) {
  return TAG_COLORS[tag] ?? { bg: '#f5f5f5', text: '#555', dot: '#999' }
}

// Decorative SVG patterns per category "feel"
const CARD_PATTERNS = [
  "radial-gradient(circle at 20% 80%, rgba(201,164,92,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,26,26,0.08) 0%, transparent 50%)",
  "radial-gradient(circle at 80% 80%, rgba(201,164,92,0.12) 0%, transparent 50%), radial-gradient(circle at 20% 20%, rgba(139,26,26,0.06) 0%, transparent 50%)",
  "radial-gradient(ellipse at 50% 0%, rgba(201,164,92,0.18) 0%, transparent 60%)",
  "radial-gradient(ellipse at 50% 100%, rgba(139,26,26,0.10) 0%, transparent 60%)",
  "radial-gradient(circle at 10% 50%, rgba(201,164,92,0.12) 0%, transparent 50%), radial-gradient(circle at 90% 50%, rgba(139,26,26,0.08) 0%, transparent 50%)",
]

// All unique tags
const allTags = Array.from(new Set(blogPosts.flatMap((p) => p.tags))).sort()

export default function BlogIndexPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filtered = activeTag
    ? blogPosts.filter((p) => p.tags.includes(activeTag))
    : blogPosts

  return (
    <div className="min-h-screen" style={{ background: '#faf6f0' }}>
      {/* Hero Header */}
      <div
        className="relative overflow-hidden pt-[120px] lg:pt-[190px] pb-16"
        style={{
          background: 'linear-gradient(135deg, #2d1b15 0%, #8b1a1a 50%, #6d1414 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c9a45c, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c9a45c, transparent)', transform: 'translate(-30%, 30%)' }} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #c9a45c 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ background: 'rgba(201,164,92,0.2)', color: '#c9a45c', border: '1px solid rgba(201,164,92,0.3)' }}>
            Annavedah Journal
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 leading-tight">
            Ideas for Everyday<br />
            <span style={{ color: '#c9a45c' }}>Nourishment</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
            Practical recipes, routines, and traditional wisdom to help you use Annavedah products with confidence.
          </p>
          <p className="text-white/40 text-sm">{blogPosts.length} articles</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-14">
        {/* Tag filter bar */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          <button
            onClick={() => setActiveTag(null)}
            className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border-2"
            style={
              activeTag === null
                ? { background: '#8b1a1a', color: '#fff', borderColor: '#8b1a1a' }
                : { background: '#fff', color: '#6b5347', borderColor: '#e8ddd0' }
            }
          >
            All Posts
          </button>
          {allTags.map((tag) => {
            const style = getTagStyle(tag)
            const isActive = activeTag === tag
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(isActive ? null : tag)}
                className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border-2"
                style={
                  isActive
                    ? { background: style.dot, color: '#fff', borderColor: style.dot }
                    : { background: '#fff', color: style.text, borderColor: '#e8ddd0' }
                }
              >
                {tag}
              </button>
            )
          })}
        </div>

        {/* Blog grid — alternating card sizes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
          {filtered.map((post, index) => {
            const primaryTag = post.tags[0]
            const tagStyle = getTagStyle(primaryTag)
            const pattern = CARD_PATTERNS[index % CARD_PATTERNS.length]
            const isFeatured = index === 0 && !activeTag // first card spans 2 cols
            const readTime = Math.max(2, Math.ceil(post.body.join(' ').split(' ').length / 180))
            const formattedDate = new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={`group block rounded-3xl overflow-hidden border-2 border-transparent hover:border-[#c9a45c] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${isFeatured ? 'md:col-span-2' : ''}`}
                style={{ background: '#fff' }}
              >
                {/* Card top accent strip */}
                <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${tagStyle.dot}, ${tagStyle.text})` }} />

                {/* Blog image */}
                {post.image && (
                  <div className={`relative w-full overflow-hidden ${isFeatured ? 'h-64 md:h-80' : 'h-48'}`}>
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}

                {/* Decorative pattern area */}
                <div
                  className="relative px-7 pt-8 pb-6 flex-1"
                  style={{ backgroundImage: pattern }}
                >
                  {/* Reading time + date */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#b0a090' }}>
                      {formattedDate}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: tagStyle.bg, color: tagStyle.text }}>
                      {readTime} min read
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    className={`font-bold leading-snug mb-3 group-hover:text-[#8b1a1a] transition-colors ${isFeatured ? 'text-3xl md:text-4xl' : 'text-xl'}`}
                    style={{ color: '#2d1b15' }}
                  >
                    {post.title}
                  </h2>

                  {/* Summary */}
                  <p className="text-sm leading-relaxed mb-5" style={{ color: '#6b5347' }}>
                    {post.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag) => {
                      const ts = getTagStyle(tag)
                      return (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide"
                          style={{ background: ts.bg, color: ts.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: ts.dot }} />
                          {tag}
                        </span>
                      )
                    })}
                  </div>

                  {/* CTA arrow */}
                  <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#8b1a1a' }}>
                    Read article
                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>

                {/* Bottom number badge */}
                <div className="px-7 pb-5 flex justify-end">
                  <span
                    className="text-5xl font-black opacity-[0.06] select-none"
                    style={{ color: tagStyle.dot, lineHeight: 1 }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl font-bold" style={{ color: '#2d1b15' }}>No posts in this category yet.</p>
            <button onClick={() => setActiveTag(null)} className="mt-4 text-sm font-semibold underline" style={{ color: '#8b1a1a' }}>
              View all posts
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
