'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { categories } from '@/lib/public-content'
import { useProductsData } from '@/components/products-context'
import { Search, X, ArrowRight, TrendingUp, Sparkles, CornerDownLeft, ArrowUp, ArrowDown, Tag, Flame } from 'lucide-react'

interface SearchResult {
  id: number
  slug: string
  name: string
  localName: string
  category: string
  image: string
  price: number
  badge?: string
}

const trendingSearches = ['Moringa', 'Ghee', 'Turmeric', 'Rice', 'Honey']

const RECENT_KEY = 'annavedah_recent_searches'
const RECENT_MAX = 5

const categoryAccent: Record<string, string> = {
  Powders: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  Grains: 'bg-amber-100 text-amber-700 ring-amber-200',
  Pulses: 'bg-orange-100 text-orange-700 ring-orange-200',
  Atta: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  Essentials: 'bg-rose-100 text-rose-700 ring-rose-200',
  Papad: 'bg-sky-100 text-sky-700 ring-sky-200',
  Chutney: 'bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-200',
}

const categoryDot: Record<string, string> = {
  Powders: 'bg-emerald-500',
  Grains: 'bg-amber-500',
  Pulses: 'bg-orange-500',
  Atta: 'bg-yellow-500',
  Essentials: 'bg-rose-500',
  Papad: 'bg-sky-500',
  Chutney: 'bg-fuchsia-500',
}

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { products } = useProductsData()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [active, setActive] = useState(0)
  const [recent, setRecent] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const bestsellers = useMemo(
    () => products.filter((p) => p.badge === 'Bestseller' || p.badge === 'Popular' || p.badge === 'New').slice(0, 4),
    [products],
  )

  useEffect(() => {
    inputRef.current?.focus()
    try {
      const raw = localStorage.getItem(RECENT_KEY)
      if (raw) setRecent(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    setActive(0)
  }, [results.length])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const search = useCallback((q: string) => {
    setQuery(q)
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    const lower = q.toLowerCase()
    const matched = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower) ||
          p.localName.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower),
      )
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        localName: p.localName,
        category: p.category,
        image: p.image,
        price: p.price,
        badge: p.badge,
      }))
    setResults(matched)
  }, [products])

  const persistRecent = useCallback((term: string) => {
    const next = [term, ...recent.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, RECENT_MAX)
    setRecent(next)
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {}
  }, [recent])

  const submitQuery = useCallback(
    (term: string) => {
      const t = term.trim()
      if (!t) return
      persistRecent(t)
      onClose()
      router.push(`/products?search=${encodeURIComponent(t)}`)
    },
    [onClose, router, persistRecent],
  )

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (results.length > 0 && active >= 0 && active < results.length) {
      const r = results[active]
      persistRecent(query.trim() || r.name)
      onClose()
      router.push(`/products/${r.slug}`)
      return
    }
    submitQuery(query)
  }

  const handleResultClick = (r: SearchResult) => {
    persistRecent(r.name)
    onClose()
    router.push(`/products/${r.slug}`)
  }

  const handleTrendingClick = (term: string) => {
    search(term)
    inputRef.current?.focus()
  }

  // Global keyboard handlers (Esc + arrow nav)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (results.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((i) => (i + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive((i) => (i - 1 + results.length) % results.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, results.length])

  const clearRecent = () => {
    setRecent([])
    try {
      localStorage.removeItem(RECENT_KEY)
    } catch {}
  }

  const realCategories = categories.filter((c) => c !== 'All')

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-[#2d1b15]/70 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl mx-auto mt-[100px] lg:mt-[140px] px-4 animate-in fade-in slide-in-from-top-4 duration-300">
        {/* Soft warm glow behind the panel */}
        <div className="absolute inset-x-0 -top-6 h-32 bg-[#c9a45c]/30 blur-3xl rounded-full pointer-events-none" />

        <div className="relative bg-[#faf6f0] rounded-3xl border border-[#e8ddd0] shadow-[0_30px_80px_-20px_rgba(45,27,21,0.45)] overflow-hidden">
          {/* Hero search */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-3 px-5 sm:px-6 py-5 bg-gradient-to-b from-white to-[#faf6f0] border-b border-[#e8ddd0]">
              <div className="w-11 h-11 rounded-2xl bg-[#8b1a1a] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-[#8b1a1a]/20">
                <Search className="w-5 h-5" />
              </div>
              <input
                ref={inputRef}
                id="header-search-overlay-input"
                type="text"
                value={query}
                onChange={(e) => {
                  const val = e.target.value
                  search(val)
                }}
                autoFocus
                placeholder="Search products, ingredients, categories…"
                className="flex-1 text-lg sm:text-xl text-[#2d1b15] placeholder:text-[#6b5347]/60 outline-none bg-transparent font-medium tracking-tight"
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setResults([])
                    inputRef.current?.focus()
                  }}
                  className="p-1.5 hover:bg-[#f0e8dc] rounded-full transition-colors"
                  aria-label="Clear"
                >
                  <X className="w-4 h-4 text-[#6b5347]" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#e8ddd0] text-[10px] font-bold uppercase tracking-widest text-[#6b5347] hover:border-[#c9a45c] hover:text-[#8b1a1a] transition-colors shadow-sm"
                aria-label="Close search"
              >
                <kbd className="font-sans">esc</kbd>
              </button>
            </div>
          </form>

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto">
            {results.length > 0 ? (
              <div className="p-2 sm:p-3">
                <div className="flex items-center justify-between px-3 pt-2 pb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b5347]">
                    {results.length} result{results.length === 1 ? '' : 's'}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-[#6b5347]/60">For "{query}"</p>
                </div>
                <ul role="listbox" className="space-y-1">
                  {results.map((r, i) => {
                    const accent = categoryAccent[r.category] ?? 'bg-[#f0e8dc] text-[#6b5347] ring-[#e8ddd0]'
                    const isActive = i === active
                    return (
                      <li key={r.id} role="option" aria-selected={isActive}>
                        <button
                          onMouseEnter={() => setActive(i)}
                          onClick={() => handleResultClick(r)}
                          className={`w-full flex items-center gap-4 p-3 rounded-2xl text-left transition-all border ${
                            isActive
                              ? 'bg-white border-[#c9a45c] shadow-md'
                              : 'border-transparent hover:bg-white/70 hover:border-[#e8ddd0]'
                          }`}
                        >
                          <div className="relative w-14 h-14 rounded-xl bg-[url('/product-bg.webp')] bg-cover bg-center border border-[#e8ddd0] flex-shrink-0 overflow-hidden">
                            <Image
                              src={r.image}
                              alt={r.name}
                              fill
                              sizes="56px"
                              className="object-contain p-1.5"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-bold text-sm truncate transition-colors ${isActive ? 'text-[#8b1a1a]' : 'text-[#2d1b15]'}`}>
                                {r.name}
                              </p>
                              {r.badge && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#8b1a1a] bg-[#c9a45c]/15 ring-1 ring-[#c9a45c]/30 rounded-full px-1.5 py-0.5 flex-shrink-0">
                                  <Flame className="w-2.5 h-2.5" /> {r.badge}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ring-1 ${accent}`}>
                                <Tag className="w-2.5 h-2.5 mr-1" /> {r.category}
                              </span>
                              {r.localName !== r.name && (
                                <span className="text-[11px] text-[#6b5347] truncate italic">{r.localName}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {r.price > 0 ? (
                              <span className="text-base font-bold text-[#8b1a1a]">₹{r.price}</span>
                            ) : (
                              <span className="text-xs text-[#c9a45c] font-semibold">Enquire</span>
                            )}
                          </div>
                          <ArrowRight
                            className={`w-4 h-4 flex-shrink-0 transition-all ${
                              isActive ? 'text-[#8b1a1a] translate-x-0.5' : 'text-[#c9a45c] opacity-60'
                            }`}
                          />
                        </button>
                      </li>
                    )
                  })}
                </ul>

                <button
                  onClick={() => submitQuery(query)}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-[#8b1a1a] hover:bg-[#6d1414] text-white uppercase tracking-wider transition-colors"
                >
                  View all results for "{query}"
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : query.length >= 2 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#f0e8dc] mx-auto flex items-center justify-center mb-4">
                  <Search className="w-7 h-7 text-[#c9a45c]" />
                </div>
                <p className="text-lg font-bold text-[#2d1b15]">Nothing matches "{query}"</p>
                <p className="text-sm text-[#6b5347] mt-1 mb-5">Try a related ingredient or browse a category instead.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {realCategories.slice(0, 6).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        onClose()
                        router.push(`/products?category=${encodeURIComponent(cat)}`)
                      }}
                      className="px-3 py-1.5 rounded-full bg-white border border-[#e8ddd0] text-xs font-semibold text-[#2d1b15] hover:border-[#c9a45c] hover:text-[#8b1a1a] transition-colors"
                    >
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${categoryDot[cat] ?? 'bg-[#c9a45c]'}`} />
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-0 sm:divide-x divide-[#e8ddd0]">
                {/* Left: Popular Categories + Recent */}
                <div className="p-5 space-y-5">
                  <div>
                    <p className="text-[10px] font-bold text-[#6b5347] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Tag className="w-3 h-3" />
                      Popular Categories
                    </p>
                    <ul className="space-y-1">
                      {realCategories.slice(0, 6).map((cat) => (
                        <li key={cat}>
                          <button
                            onClick={() => {
                              onClose()
                              router.push(`/products?category=${encodeURIComponent(cat)}`)
                            }}
                            className="w-full group flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-white transition-colors"
                          >
                            <span className="flex items-center gap-2.5 text-sm font-semibold text-[#2d1b15]">
                              <span className={`w-2 h-2 rounded-full ${categoryDot[cat] ?? 'bg-[#c9a45c]'}`} />
                              {cat}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#c9a45c] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {recent.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-[#6b5347] uppercase tracking-widest">Recent Searches</p>
                        <button
                          onClick={clearRecent}
                          className="text-[10px] uppercase tracking-widest text-[#6b5347]/70 hover:text-[#8b1a1a]"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recent.map((term) => (
                          <button
                            key={term}
                            onClick={() => handleTrendingClick(term)}
                            className="px-3 py-1 rounded-full bg-white border border-[#e8ddd0] text-xs font-medium text-[#2d1b15] hover:border-[#c9a45c] hover:text-[#8b1a1a] transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Trending + Bestsellers */}
                <div className="p-5 space-y-5">
                  <div>
                    <p className="text-[10px] font-bold text-[#6b5347] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" />
                      Trending Searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleTrendingClick(term)}
                          className="group px-3 py-1.5 rounded-full bg-gradient-to-b from-white to-[#faf6f0] border border-[#e8ddd0] text-xs font-semibold text-[#2d1b15] hover:border-[#c9a45c] hover:shadow-sm hover:-translate-y-0.5 transition-all"
                        >
                          <Sparkles className="w-3 h-3 inline-block mr-1 text-[#c9a45c]" />
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-[#6b5347] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Flame className="w-3 h-3" />
                      Bestsellers
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {bestsellers.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onClose()
                            router.push(`/products/${p.slug}`)
                          }}
                          className="group flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#e8ddd0] hover:border-[#c9a45c] hover:shadow-sm transition-all text-left"
                        >
                          <div className="relative w-10 h-10 rounded-lg bg-[url('/product-bg.webp')] bg-cover bg-center flex-shrink-0 overflow-hidden">
                            <Image src={p.image} alt={p.name} fill sizes="40px" className="object-contain p-1" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#2d1b15] truncate group-hover:text-[#8b1a1a]">{p.name}</p>
                            <p className="text-[11px] font-bold text-[#8b1a1a]">
                              {p.packPrices[0] ? `₹${p.packPrices[0].price}` : 'Enquire'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer hint bar */}
          <div className="hidden sm:flex items-center justify-between gap-4 px-5 py-2.5 border-t border-[#e8ddd0] bg-white/60 text-[10px] uppercase tracking-widest text-[#6b5347] font-semibold">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <kbd className="inline-flex items-center justify-center w-5 h-5 rounded border border-[#e8ddd0] bg-white">
                  <ArrowUp className="w-2.5 h-2.5" />
                </kbd>
                <kbd className="inline-flex items-center justify-center w-5 h-5 rounded border border-[#e8ddd0] bg-white">
                  <ArrowDown className="w-2.5 h-2.5" />
                </kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="inline-flex items-center justify-center w-5 h-5 rounded border border-[#e8ddd0] bg-white">
                  <CornerDownLeft className="w-2.5 h-2.5" />
                </kbd>
                Open
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="inline-flex items-center justify-center px-1.5 h-5 rounded border border-[#e8ddd0] bg-white text-[9px]">
                  esc
                </kbd>
                Close
              </span>
            </div>
            <span className="text-[#c9a45c] font-bold">Annavedah Search</span>
          </div>
        </div>
      </div>
    </div>
  )
}
