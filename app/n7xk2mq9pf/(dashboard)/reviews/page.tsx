'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, Check, X, Trash2, Loader2, Filter, Eye, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

type Review = {
  id: number
  productSlug: string
  name: string
  location: string
  rating: number
  title: string
  body: string
  status: string
  verified: boolean
  helpful: number
  createdAt: string
}

type Stats = {
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reviews${statusFilter ? `?status=${statusFilter}` : ''}`)
      const data = await res.json()
      setReviews(data.reviews || [])
      setStats(data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 })
    } catch {
      // Fail silently
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const updateStatus = async (id: number, status: string) => {
    setActionLoading(id)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        fetchReviews()
      }
    } catch {
      // Fail silently
    } finally {
      setActionLoading(null)
    }
  }

  const deleteReview = async (id: number) => {
    setActionLoading(id)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        fetchReviews()
      }
    } catch {
      // Fail silently
    } finally {
      setActionLoading(null)
      setDeleteConfirm(null)
    }
  }

  const statusConfig: Record<string, { icon: any; color: string; bg: string; border: string }> = {
    pending: { icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    approved: { icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
    rejected: { icon: XCircle, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  }

  const filterTabs = [
    { key: 'pending', label: 'Pending', count: stats.pending, icon: Clock },
    { key: 'approved', label: 'Approved', count: stats.approved, icon: CheckCircle },
    { key: 'rejected', label: 'Rejected', count: stats.rejected, icon: XCircle },
    { key: '', label: 'All', count: stats.total, icon: Eye },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Product Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">Moderate customer reviews before they appear on product pages</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
            <AlertTriangle className="w-4 h-4" />
            {stats.pending} pending
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews', value: stats.total, icon: Star, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
        ].map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className={`${card.bg} ${card.border} border rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${card.color}`} />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</span>
              </div>
              <p className={`text-2xl font-bold ${card.color} tabular-nums`}>{card.value}</p>
            </div>
          )
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border border-border w-fit">
        {filterTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === tab.key
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums ${
                statusFilter === tab.key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Review List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">No {statusFilter || ''} reviews</p>
          <p className="text-sm text-muted-foreground mt-1">
            {statusFilter === 'pending'
              ? 'All caught up! No reviews waiting for moderation.'
              : 'No reviews found with this filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const config = statusConfig[review.status] || statusConfig.pending
            const StatusIcon = config.icon
            const isLoading = actionLoading === review.id

            return (
              <div key={review.id} className="bg-card rounded-xl border border-border overflow-hidden transition-all hover:shadow-sm">
                <div className="p-5">
                  {/* Top bar */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary text-sm font-bold shrink-0 border border-primary/10">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{review.name}</p>
                          {review.verified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${config.color} ${config.bg} border ${config.border} rounded-full px-2 py-0.5`}>
                            <StatusIcon className="w-3 h-3" /> {review.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {review.location && `${review.location} · `}
                          {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          {' · '}
                          <span className="font-medium text-primary">{review.productSlug}</span>
                        </p>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-4 h-4 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="ml-[52px]">
                    <h4 className="font-semibold text-foreground mb-1">{review.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="tabular-nums">{review.helpful} helpful votes</span>
                      <span>Review #{review.id}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 ml-[52px] pt-3 border-t border-border">
                    {review.status !== 'approved' && (
                      <button
                        onClick={() => updateStatus(review.id, 'approved')}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button
                        onClick={() => updateStatus(review.id, 'rejected')}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                        Reject
                      </button>
                    )}
                    {review.status === 'approved' && (
                      <button
                        onClick={() => updateStatus(review.id, 'pending')}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                        Move to Pending
                      </button>
                    )}
                    <div className="flex-1" />
                    {deleteConfirm === review.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-destructive font-semibold">Delete permanently?</span>
                        <button
                          onClick={() => deleteReview(review.id)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes, delete'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(review.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
