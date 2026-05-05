'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { toast } from 'sonner'

export const WISHLIST_LIMIT = 10

type WishlistContextValue = {
  ids: number[]
  toggle: (id: number) => void
  has: (id: number) => boolean
  count: number
  clear: () => void
  isFull: boolean
  /** Merge external IDs (e.g. from server after login). Dedupes & caps at WISHLIST_LIMIT. */
  mergeIds: (incoming: number[]) => void
}

const STORAGE_KEY = 'annavedah_wishlist'

const WishlistContext = createContext<WishlistContextValue | null>(null)

function loadFromStorage(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.slice(0, WISHLIST_LIMIT)
    }
  } catch {}
  return []
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>(loadFromStorage)
  const isHydrated = useRef(false)

  // Mark as hydrated after first mount to avoid writing stale [] on SSR
  useEffect(() => {
    // Re-read in case SSR returned [] and client has data
    if (!isHydrated.current) {
      const stored = loadFromStorage()
      if (stored.length > 0) setIds(stored)
      isHydrated.current = true
    }
  }, [])

  // Persist to localStorage only after hydration
  useEffect(() => {
    if (isHydrated.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    }
  }, [ids])

  const toggle = useCallback((id: number) => {
    setIds((prev) => {
      // Removing — always allowed
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id)
      }
      // Adding — check limit
      if (prev.length >= WISHLIST_LIMIT) {
        toast.warning('Wishlist is full', {
          description: `You can save up to ${WISHLIST_LIMIT} items. Remove an item to add more.`,
        })
        return prev
      }
      return [...prev, id]
    })
  }, [])

  const mergeIds = useCallback((incoming: number[]) => {
    setIds((prev) => {
      const merged = [...new Set([...prev, ...incoming])]
      if (merged.length > WISHLIST_LIMIT) {
        toast.info('Wishlist trimmed', {
          description: `Only the first ${WISHLIST_LIMIT} items were kept.`,
        })
      }
      return merged.slice(0, WISHLIST_LIMIT)
    })
  }, [])

  const has = useCallback((id: number) => ids.includes(id), [ids])
  const clear = useCallback(() => setIds([]), [])

  return (
    <WishlistContext.Provider value={{ ids, toggle, has, count: ids.length, clear, isFull: ids.length >= WISHLIST_LIMIT, mergeIds }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
