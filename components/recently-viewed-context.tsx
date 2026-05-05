'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

const STORAGE_KEY = 'annavedah_recently_viewed'
const MAX_ITEMS = 12

type RecentlyViewedContextValue = {
  ids: number[]
  push: (id: number) => void
  clear: () => void
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null)

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setIds(JSON.parse(raw))
    } catch {}
  }, [])

  const push = useCallback((id: number) => {
    setIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX_ITEMS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setIds([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <RecentlyViewedContext.Provider value={{ ids, push, clear }}>
      {children}
    </RecentlyViewedContext.Provider>
  )
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext)
  if (!ctx) throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider')
  return ctx
}
