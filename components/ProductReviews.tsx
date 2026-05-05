'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, ThumbsUp, Verified, Loader2, MessageSquare, ChevronDown } from 'lucide-react'

type Review = {
  id: number
  productSlug: string
  name: string
  location: string
  rating: number
  title: string
  body: string
  verified: boolean
  helpful: number
  createdAt: string
}

type Stats = {
  count: number
  avg: number
  r5: number
  r4: number
  r3: number
  r2: number
  r1: number
}

function StarRow({ value, size = 'sm' }: { value: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${cls} ${n <= value ? 'fill-[#c9a45c] text-[#c9a45c]' : 'text-[#e8ddd0]'}`}
        />
      ))}
    </div>
  )
}

function InteractiveStar({ n, value, hovered, onHover, onClick }: {
  n: number; value: number; hovered: number; onHover: (n: number) => void; onClick: (n: number) => void
}) {
  const active = hovered > 0 ? n <= hovered : n <= value
  return (
    <button
      type="button"
      onClick={() => onClick(n)}
      onMouseEnter={() => onHover(n)}
      onMouseLeave={() => onHover(0)}
      className="p-0.5 transition-transform hover:scale-110"
      aria-label={`${n} stars`}
    >
      <Star className={`w-8 h-8 transition-colors duration-150 ${active ? 'fill-[#c9a45c] text-[#c9a45c]' : 'text-[#e8ddd0] hover:text-[#c9a45c]/40'}`} />
    </button>
  )
}

export default function ProductReviews({ productSlug }: { productSlug: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats>({ count: 0, avg: 0, r5: 0, r4: 0, r3: 0, r2: 0, r1: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<number | null>(null)
  const [helpfulIds, setHelpfulIds] = useState<Set<number>>(new Set())
  const [showWriteForm, setShowWriteForm] = useState(false)
  const [draft, setDraft] = useState({ name: '', location: '', rating: 5, title: '', body: '' })
  const [hoveredStar, setHoveredStar] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({})
  const [reviewTouched, setReviewTouched] = useState<Record<string, boolean>>({})
  const [visibleCount, setVisibleCount] = useState(5)

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?slug=${encodeURIComponent(productSlug)}`)
      const data = await res.json()
      setReviews(data.reviews || [])
      setStats(data.stats || { count: 0, avg: 0, r5: 0, r4: 0, r3: 0, r2: 0, r1: 0 })
    } catch {
      // Fail silently
    } finally {
      setLoading(false)
    }
  }, [productSlug])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const filtered = filter ? reviews.filter((r) => r.rating === filter) : reviews
  const displayedReviews = filtered.slice(0, visibleCount)

  const counts = [5, 4, 3, 2, 1].map((n) => ({
    n,
    c: stats[`r${n}` as keyof Stats] as number || 0,
    pct: stats.count > 0 ? ((stats[`r${n}` as keyof Stats] as number || 0) / stats.count) * 100 : 0,
  }))

  const markHelpful = async (id: number) => {
    if (helpfulIds.has(id)) return
    setHelpfulIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    try {
      await fetch('/api/reviews/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: id }),
      })
    } catch {}
  }

  const validateReviewField = (field: string, value: string) => {
    let error = ''
    if (field === 'name') {
      if (!value.trim()) error = 'Name is required'
      else if (value.trim().length < 2) error = 'Name must be at least 2 characters'
    }
    if (field === 'title') {
      if (!value.trim()) error = 'Review title is required'
      else if (value.trim().length < 3) error = 'Title must be at least 3 characters'
    }
    if (field === 'body') {
      if (!value.trim()) error = 'Review body is required'
      else if (value.trim().length < 20) error = 'Please write at least 20 characters'
    }
    setReviewErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleReviewBlur = (field: string, value: string) => {
    setReviewTouched(prev => ({ ...prev, [field]: true }))
    validateReviewField(field, value)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate all fields
    const nameErr = !draft.name.trim() ? 'Name is required' : draft.name.trim().length < 2 ? 'Name must be at least 2 characters' : ''
    const titleErr = !draft.title.trim() ? 'Review title is required' : draft.title.trim().length < 3 ? 'Title must be at least 3 characters' : ''
    const bodyErr = !draft.body.trim() ? 'Review body is required' : draft.body.trim().length < 20 ? 'Please write at least 20 characters' : ''
    
    setReviewErrors({ name: nameErr, title: titleErr, body: bodyErr })
    setReviewTouched({ name: true, title: true, body: true })
    
    if (nameErr || titleErr || bodyErr) return

    setSubmitting(true)
    setSubmitError('')

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug,
          name: draft.name,
          location: draft.location,
          rating: draft.rating,
          title: draft.title,
          reviewBody: draft.body,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error || 'Failed to submit review')
        return
      }

      setSubmitted(true)
      setTimeout(() => {
        setShowWriteForm(false)
        setSubmitted(false)
        setDraft({ name: '', location: '', rating: 5, title: '', body: '' })
        setReviewErrors({})
        setReviewTouched({})
      }, 3000)
    } catch {
      setSubmitError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const ratingLabels = ['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent']

  return (
    <div className="rounded-3xl border-2 border-[#e8ddd0] bg-white overflow-hidden">
      {/* Header / Summary */}
      <div className="p-6 md:p-8 border-b border-[#e8ddd0] grid md:grid-cols-[260px_1fr] gap-8">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <h3 className="text-xl font-bold text-[#2d1b15] mb-3">Customer Reviews</h3>

          {loading ? (
            <div className="flex items-center gap-2 text-[#6b5347]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading reviews...</span>
            </div>
          ) : stats.count === 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-8 h-8 text-[#e8ddd0]" />
              </div>
              <p className="text-sm text-[#6b5347]">No reviews yet</p>
              <p className="text-xs text-[#a39189]">Be the first to share your experience!</p>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-bold text-[#2d1b15] tabular-nums">{stats.avg.toFixed(1)}</span>
                <span className="text-sm text-[#6b5347]">/ 5</span>
              </div>
              <StarRow value={Math.round(stats.avg)} size="lg" />
              <p className="text-sm text-[#6b5347] mt-2">Based on {stats.count} review{stats.count !== 1 ? 's' : ''}</p>
            </>
          )}

          <button
            onClick={() => setShowWriteForm((s) => !s)}
            className="mt-4 px-5 py-2.5 bg-[#8b1a1a] hover:bg-[#6d1414] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            {showWriteForm ? 'Cancel' : 'Write a review'}
          </button>
        </div>

        {/* Rating bars */}
        {stats.count > 0 && (
          <div className="space-y-2">
            {counts.map(({ n, c, pct }) => (
              <button
                key={n}
                onClick={() => setFilter(filter === n ? null : n)}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  filter === n ? 'bg-[#c9a45c]/10 ring-1 ring-[#c9a45c]/30' : 'hover:bg-[#faf6f0]'
                }`}
              >
                <span className="text-sm font-semibold text-[#2d1b15] w-12 text-left">{n} star</span>
                <div className="flex-1 h-2.5 bg-[#e8ddd0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#c9a45c] to-[#d4b06a] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-[#6b5347] w-8 text-right tabular-nums">{c}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Write Review Form */}
      {showWriteForm && (
        <div className="p-6 md:p-8 border-b border-[#e8ddd0] bg-gradient-to-br from-[#faf6f0]/50 to-[#f5ede4]/30">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-200">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold text-[#2d1b15] text-lg">Thank you for your review!</p>
              <p className="text-sm text-[#6b5347] mt-1">Your review has been submitted and will appear after moderation.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5 max-w-xl">
              <h4 className="text-lg font-bold text-[#2d1b15]">Share your experience</h4>

              {submitError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {submitError}
                </div>
              )}

              {/* Rating */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#6b5347] block mb-2">Your rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <InteractiveStar
                      key={n}
                      n={n}
                      value={draft.rating}
                      hovered={hoveredStar}
                      onHover={setHoveredStar}
                      onClick={(v) => setDraft((d) => ({ ...d, rating: v }))}
                    />
                  ))}
                  <span className="ml-3 text-sm font-semibold text-[#6b5347]">
                    {ratingLabels[hoveredStar || draft.rating]}
                  </span>
                </div>
              </div>

              {/* Name + Location */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#6b5347] block mb-1.5">Your name *</label>
                  <input
                    placeholder="e.g., Priya Sharma"
                    value={draft.name}
                    onChange={(e) => {
                      setDraft((d) => ({ ...d, name: e.target.value }))
                      if (reviewTouched.name) validateReviewField('name', e.target.value)
                    }}
                    onBlur={() => handleReviewBlur('name', draft.name)}
                    className={`w-full px-4 py-2.5 rounded-xl border-2 focus:outline-none bg-white transition-colors ${
                      reviewTouched.name && reviewErrors.name ? 'border-red-400' : 'border-[#e8ddd0] focus:border-[#c9a45c]'
                    }`}
                  />
                  {reviewTouched.name && reviewErrors.name && (
                    <p className="text-red-500 text-[11px] mt-1">{reviewErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#6b5347] block mb-1.5">Location</label>
                  <input
                    placeholder="e.g., Mumbai"
                    value={draft.location}
                    onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-[#e8ddd0] focus:border-[#c9a45c] focus:outline-none bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#6b5347] block mb-1.5">Review title *</label>
                <input
                  placeholder="Summarize your experience"
                  value={draft.title}
                  onChange={(e) => {
                    setDraft((d) => ({ ...d, title: e.target.value }))
                    if (reviewTouched.title) validateReviewField('title', e.target.value)
                  }}
                  onBlur={() => handleReviewBlur('title', draft.title)}
                  className={`w-full px-4 py-2.5 rounded-xl border-2 focus:outline-none bg-white transition-colors ${
                    reviewTouched.title && reviewErrors.title ? 'border-red-400' : 'border-[#e8ddd0] focus:border-[#c9a45c]'
                  }`}
                />
                {reviewTouched.title && reviewErrors.title && (
                  <p className="text-red-500 text-[11px] mt-1">{reviewErrors.title}</p>
                )}
              </div>

              {/* Body */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#6b5347] block mb-1.5">Your review *</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your experience (minimum 20 characters)..."
                  value={draft.body}
                  onChange={(e) => {
                    setDraft((d) => ({ ...d, body: e.target.value }))
                    if (reviewTouched.body) validateReviewField('body', e.target.value)
                  }}
                  onBlur={() => handleReviewBlur('body', draft.body)}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none bg-white resize-none transition-colors ${
                    reviewTouched.body && reviewErrors.body ? 'border-red-400' : 'border-[#e8ddd0] focus:border-[#c9a45c]'
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  {reviewTouched.body && reviewErrors.body ? (
                    <p className="text-red-500 text-[11px]">{reviewErrors.body}</p>
                  ) : <span />}
                  <span className={`text-[10px] tabular-nums ${draft.body.length < 20 ? 'text-[#a39189]' : 'text-green-600'}`}>
                    {draft.body.length}/20 min
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#8b1a1a] hover:bg-[#6d1414] disabled:bg-[#b57a7a] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all hover:shadow-lg flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Submitting...' : 'Submit review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowWriteForm(false)}
                  className="px-6 py-2.5 border-2 border-[#e8ddd0] text-[#6b5347] hover:bg-[#faf6f0] text-sm font-bold uppercase tracking-wider rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Review List */}
      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#c9a45c]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center">
          {filter ? (
            <>
              <p className="text-sm text-[#6b5347]">No {filter}-star reviews yet.</p>
              <button
                onClick={() => setFilter(null)}
                className="mt-2 text-sm font-semibold text-[#8b1a1a] hover:underline"
              >
                Show all reviews
              </button>
            </>
          ) : (
            <p className="text-sm text-[#6b5347]">No reviews yet. Be the first to share your thoughts!</p>
          )}
        </div>
      ) : (
        <>
          <ul className="divide-y divide-[#e8ddd0]">
            {displayedReviews.map((r) => (
              <li key={r.id} className="p-6 md:p-8 space-y-3 hover:bg-[#faf6f0]/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c9a45c] to-[#8b1a1a] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#2d1b15]">{r.name}</p>
                          {r.verified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                              <Verified className="w-3 h-3" /> Verified Purchase
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6b5347]">
                          {r.location && `${r.location} · `}
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <StarRow value={r.rating} />
                </div>
                <h5 className="font-bold text-[#2d1b15]">{r.title}</h5>
                <p className="text-sm text-[#2d1b15] leading-relaxed">{r.body}</p>
                <button
                  onClick={() => markHelpful(r.id)}
                  disabled={helpfulIds.has(r.id)}
                  className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                    helpfulIds.has(r.id)
                      ? 'border-[#c9a45c] bg-[#c9a45c]/10 text-[#8b1a1a] cursor-default'
                      : 'border-[#e8ddd0] text-[#6b5347] hover:border-[#c9a45c] hover:bg-[#c9a45c]/5'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Helpful ({r.helpful + (helpfulIds.has(r.id) ? 1 : 0)})
                </button>
              </li>
            ))}
          </ul>

          {/* Load More */}
          {filtered.length > visibleCount && (
            <div className="p-4 border-t border-[#e8ddd0] text-center">
              <button
                onClick={() => setVisibleCount((c) => c + 5)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#8b1a1a] hover:bg-[#faf6f0] rounded-xl transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
                Show more reviews ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
