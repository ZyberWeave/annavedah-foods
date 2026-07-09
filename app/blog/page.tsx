'use client'

import Link from 'next/link'
import Image from 'next/image'
import { blogPosts } from '@/lib/content'
import { useState, useMemo } from 'react'

export default function BlogIndexPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return blogPosts
    const q = searchQuery.toLowerCase().trim()
    return blogPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [searchQuery])

  return (
    <div className="min-h-screen" style={{ background: '#faf6f0' }}>
      {/* Hero Header */}
      <div
        className="relative overflow-hidden site-page-gap pb-16"
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
        {/* Search bar */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: '#b0a090' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              id="blog-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by title, topic, or keyword..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm border-2 outline-none transition-all duration-200"
              style={{
                background: '#fff',
                color: '#2d1b15',
                borderColor: searchQuery ? '#c9a45c' : '#e8ddd0',
                boxShadow: searchQuery ? '0 0 0 3px rgba(201,164,92,0.15)' : 'none',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                style={{ background: '#e8ddd0', color: '#6b5347' }}
                aria-label="Clear search"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs mt-2 text-center" style={{ color: '#b0a090' }}>
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'} for &ldquo;{searchQuery}&rdquo;
            </p>
          )}
        </div>

        {/* Blog grid — alternating card sizes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
          {filtered.map((post, index) => {
            const isFeatured = index === 0 && !searchQuery // first card spans 2 cols
            const readTime = Math.max(2, Math.ceil(post.body.join(' ').split(' ').length / 180))
            const formattedDate = new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={`group flex flex-col rounded-3xl overflow-hidden border-2 border-transparent hover:border-[#c9a45c] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${isFeatured ? 'md:col-span-2' : ''}`}
                style={{ background: '#fff' }}
              >
                {/* Blog image */}
                {post.image && (
                  <div className={`relative w-full shrink-0 overflow-hidden ${isFeatured ? 'h-64 md:h-80' : 'h-48'}`}>
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}

                {/* Card content */}
                <div className="relative px-7 pt-8 pb-6 flex-1 flex flex-col">
                  {/* Reading time + date */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#b0a090' }}>
                      {formattedDate}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: '#f5f0e8', color: '#6b5347' }}>
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
                  <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide"
                        style={{ background: '#f5f0e8', color: '#6b5347' }}
                      >
                        {tag}
                      </span>
                    ))}
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


              </Link>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4" style={{ color: '#d5ccc0' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="text-2xl font-bold mb-2" style={{ color: '#2d1b15' }}>No articles found</p>
            <p className="text-sm mb-4" style={{ color: '#6b5347' }}>Try a different search term or keyword</p>
            <button onClick={() => setSearchQuery('')} className="text-sm font-semibold underline" style={{ color: '#8b1a1a' }}>
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
