'use client'

import { useState } from 'react'
import { Star, ThumbsUp, Verified } from 'lucide-react'

type Review = {
  id: string
  name: string
  location: string
  rating: number
  date: string
  title: string
  body: string
  verified: boolean
  helpful: number
}

const seed: Review[] = [
  {
    id: 'r1',
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    date: '2026-04-12',
    title: 'Genuinely pure quality',
    body: 'Switched to Annavedah three months ago and the difference is real. The aroma, the texture, the taste — everything feels truly farm-fresh. My family loves it.',
    verified: true,
    helpful: 24,
  },
  {
    id: 'r2',
    name: 'Rahul Desai',
    location: 'Pune',
    rating: 5,
    date: '2026-03-28',
    title: 'Worth every rupee',
    body: 'Was skeptical about the price at first but quality justifies it. Packaging is excellent and arrived sealed properly. Will definitely reorder.',
    verified: true,
    helpful: 18,
  },
  {
    id: 'r3',
    name: 'Anita Kulkarni',
    location: 'Bengaluru',
    rating: 4,
    date: '2026-03-15',
    title: 'Great product, slow delivery',
    body: 'Product itself is wonderful and feels authentic. Took a bit longer than expected to arrive though. Otherwise very happy.',
    verified: true,
    helpful: 9,
  },
  {
    id: 'r4',
    name: 'Suresh Patil',
    location: 'Nashik',
    rating: 5,
    date: '2026-02-20',
    title: 'Reminds me of grandmother\'s kitchen',
    body: 'This is exactly the kind of pure, unprocessed food I grew up with. Brings back childhood memories. Highly recommended.',
    verified: false,
    helpful: 31,
  },
]

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

export default function ProductReviews() {
  const [filter, setFilter] = useState<number | null>(null)
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set())
  const [showWriteForm, setShowWriteForm] = useState(false)
  const [draft, setDraft] = useState({ name: '', rating: 5, title: '', body: '' })
  const [submitted, setSubmitted] = useState(false)
  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({})
  const [reviewTouched, setReviewTouched] = useState<Record<string, boolean>>({})

  const filtered = filter ? seed.filter((r) => r.rating === filter) : seed
  const avg = seed.reduce((s, r) => s + r.rating, 0) / seed.length
  const counts = [5, 4, 3, 2, 1].map((n) => ({
    n,
    c: seed.filter((r) => r.rating === n).length,
    pct: (seed.filter((r) => r.rating === n).length / seed.length) * 100,
  }))

  const markHelpful = (id: string) => {
    setHelpfulIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    // Validate all fields
    const nameErr = !draft.name.trim() ? 'Name is required' : draft.name.trim().length < 2 ? 'Name must be at least 2 characters' : ''
    const titleErr = !draft.title.trim() ? 'Review title is required' : draft.title.trim().length < 3 ? 'Title must be at least 3 characters' : ''
    const bodyErr = !draft.body.trim() ? 'Review body is required' : draft.body.trim().length < 20 ? 'Please write at least 20 characters' : ''
    
    setReviewErrors({ name: nameErr, title: titleErr, body: bodyErr })
    setReviewTouched({ name: true, title: true, body: true })
    
    if (nameErr || titleErr || bodyErr) return

    setSubmitted(true)
    setTimeout(() => {
      setShowWriteForm(false)
      setSubmitted(false)
      setDraft({ name: '', rating: 5, title: '', body: '' })
      setReviewErrors({})
      setReviewTouched({})
    }, 2000)
  }

  return (
    <div className="rounded-3xl border-2 border-[#e8ddd0] bg-white overflow-hidden">
      <div className="p-6 md:p-8 border-b border-[#e8ddd0] grid md:grid-cols-[260px_1fr] gap-8">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <h3 className="text-xl font-bold text-[#2d1b15] mb-3">Customer Reviews</h3>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-5xl font-bold text-[#2d1b15] tabular-nums">{avg.toFixed(1)}</span>
            <span className="text-sm text-[#6b5347]">/ 5</span>
          </div>
          <StarRow value={Math.round(avg)} size="lg" />
          <p className="text-sm text-[#6b5347] mt-2">Based on {seed.length} reviews</p>
          <button
            onClick={() => setShowWriteForm((s) => !s)}
            className="mt-4 px-5 py-2.5 bg-[#8b1a1a] hover:bg-[#6d1414] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-colors"
          >
            Write a review
          </button>
        </div>

        <div className="space-y-2">
          {counts.map(({ n, c, pct }) => (
            <button
              key={n}
              onClick={() => setFilter(filter === n ? null : n)}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors ${filter === n ? 'bg-[#c9a45c]/10' : 'hover:bg-[#faf6f0]'}`}
            >
              <span className="text-sm font-semibold text-[#2d1b15] w-12 text-left">{n} star</span>
              <div className="flex-1 h-2 bg-[#e8ddd0] rounded-full overflow-hidden">
                <div className="h-full bg-[#c9a45c]" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-[#6b5347] w-8 text-right tabular-nums">{c}</span>
            </button>
          ))}
        </div>
      </div>

      {showWriteForm && (
        <div className="p-6 md:p-8 border-b border-[#e8ddd0] bg-[#faf6f0]/30">
          {submitted ? (
            <div className="text-center py-6">
              <p className="font-bold text-[#2d1b15] text-lg">Thank you!</p>
              <p className="text-sm text-[#6b5347] mt-1">Your review has been submitted for moderation.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4 max-w-xl">
              <h4 className="text-lg font-bold text-[#2d1b15]">Share your experience</h4>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#6b5347] block mb-1.5">Your rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, rating: n }))}
                      className="p-1"
                      aria-label={`${n} stars`}
                    >
                      <Star className={`w-7 h-7 ${n <= draft.rating ? 'fill-[#c9a45c] text-[#c9a45c]' : 'text-[#e8ddd0]'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <input
                    placeholder="Your name"
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
                  <input
                    placeholder="Review title"
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
              </div>
              <div>
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
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#8b1a1a] hover:bg-[#6d1414] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-colors"
                >
                  Submit review
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

      <ul className="divide-y divide-[#e8ddd0]">
        {filtered.map((r) => (
          <li key={r.id} className="p-6 md:p-8 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-[#2d1b15]">{r.name}</p>
                  {r.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                      <Verified className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6b5347]">
                  {r.location} · {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <StarRow value={r.rating} />
            </div>
            <h5 className="font-bold text-[#2d1b15]">{r.title}</h5>
            <p className="text-sm text-[#2d1b15] leading-relaxed">{r.body}</p>
            <button
              onClick={() => markHelpful(r.id)}
              className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                helpfulIds.has(r.id)
                  ? 'border-[#c9a45c] bg-[#c9a45c]/10 text-[#8b1a1a]'
                  : 'border-[#e8ddd0] text-[#6b5347] hover:border-[#c9a45c]'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              Helpful ({r.helpful + (helpfulIds.has(r.id) ? 1 : 0)})
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
