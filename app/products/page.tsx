'use client'

import { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/content'
import { categories } from '@/lib/public-content'
import { useCart } from '@/components/cart-context'
import { useProductsData } from '@/components/products-context'
import { ShoppingCart, Check, Search, SlidersHorizontal, X, ArrowUpDown, ChevronDown } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import WishlistButton from '@/components/WishlistButton'
import TrustBadges from '@/components/TrustBadges'
import CountdownTimer from '@/components/CountdownTimer'

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'newest'

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A → Z' },
  { value: 'newest', label: 'Newest Arrivals' },
]

const dietaryTags = ['Pure', 'Farm-sourced', 'Traditional', 'Family-friendly', 'Gluten-free']

const FALLBACK_PRICE_MIN = 0
const PRICE_STEP = 50

function getProductPrices(product: Product): number[] {
  const packPrices = product.packPrices
    .map((pack) => pack.price)
    .filter((price) => Number.isFinite(price) && price > 0)

  if (packPrices.length > 0) return packPrices
  return product.price > 0 ? [product.price] : []
}

function getLowestProductPrice(product: Product): number {
  const prices = getProductPrices(product)
  return prices.length > 0 ? Math.min(...prices) : Infinity
}

function getHighestProductPrice(product: Product): number {
  const prices = getProductPrices(product)
  return prices.length > 0 ? Math.max(...prices) : 0
}

function PLPProductCard({ product, add }: { product: Product; add: (id: number, pack?: any) => void }) {
  const [selectedPack, setSelectedPack] = useState(product.packPrices[0])
  const currentPrice = selectedPack ? selectedPack.price : product.price

  return (
    <div className="group relative rounded-2xl md:rounded-3xl border-2 border-[#e8ddd0] bg-white overflow-hidden hover:border-[#c9a45c] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full">
      <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10">
        <WishlistButton productId={product.id} size="sm" />
      </div>
      {product.badge && (
        <span className="absolute top-2 left-2 md:top-3 md:left-3 z-10 rounded-full bg-[#8b1a1a] text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-2 md:px-3 py-1 shadow-md">
          {product.badge}
        </span>
      )}
      <div className="relative aspect-square bg-[url('/product-bg.webp')] bg-cover bg-center border-b border-[#e8ddd0]">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-3 md:p-6 transition-all duration-500 group-hover:scale-105 drop-shadow-xl group-hover:drop-shadow-2xl"
          />
        </Link>
      </div>
      <div className="p-3 md:p-6 space-y-2 md:space-y-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span className="truncate">{product.category}</span>
        </div>
        <Link href={`/products/${product.slug}`} className="block space-y-1 group-hover:text-[#8b1a1a] transition-colors">
          <h3 className="text-sm sm:text-base md:text-2xl leading-tight font-bold text-[#2d1b15] group-hover:text-[#8b1a1a] line-clamp-2">{product.name}</h3>
          {product.localName !== product.name && (
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{product.localName}</p>
          )}
          <p className="hidden md:block text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        </Link>

        {product.packPrices.length > 0 && (
          <div className="flex flex-wrap gap-1 md:gap-2 pt-1 md:pt-2">
            {product.packPrices.map((pack) => (
              <button
                key={`${product.id}-${pack.size}`}
                onClick={() => setSelectedPack(pack)}
                className={`relative px-2 py-1 md:px-3 md:py-1.5 border-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all duration-300 ${
                  selectedPack?.size === pack.size
                    ? 'border-[#8b1a1a] bg-[#8b1a1a]/5 text-[#8b1a1a] shadow-inner ring-1 ring-[#8b1a1a]'
                    : 'border-[#e8ddd0] bg-white text-[#6b5347] hover:border-[#c9a45c] hover:shadow-sm'
                }`}
              >
                {pack.size}
                {selectedPack?.size === pack.size && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#c9a45c] rounded-full border-2 border-white flex items-center justify-center z-10">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto space-y-1 md:space-y-2 pt-1 md:pt-2">
          {currentPrice > 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl md:text-3xl font-bold text-primary">Rs {currentPrice}</span>
            </div>
          ) : (
            <span className="inline-flex rounded-full bg-amber-100 px-2 md:px-3 py-1 text-[11px] md:text-sm font-semibold text-amber-800">
              Price on request
            </span>
          )}
        </div>

        <div className="flex gap-1 md:gap-2 pt-3 md:pt-4 border-t border-[#e8ddd0]/50">
          <Button asChild variant="outline" className="flex-1 h-9 md:h-12 px-2 border-2 border-[#c9a45c] text-[#8b1a1a] hover:bg-[#c9a45c]/10 font-semibold rounded-lg md:rounded-xl transition-all text-xs md:text-sm">
            <Link href={`/products/${product.slug}`}>Details</Link>
          </Button>
          <Button
            className="flex-1 h-9 md:h-12 px-2 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-semibold rounded-lg md:rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-xs md:text-sm"
            onClick={() => add(product.id, selectedPack)}
            disabled={currentPrice <= 0}
          >
            <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" />
            {currentPrice > 0 ? 'Add' : 'Enquire'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const STORAGE_KEY = 'annavedah_product_filters'
  const { products } = useProductsData()
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('featured')
  const [minPrice, setMinPrice] = useState<number | null>(null)
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [isRestored, setIsRestored] = useState(false)
  const { add } = useCart()

  // Flash sale countdown — 48 hours from now
  const [flashEnd] = useState(() => new Date(Date.now() + 48 * 3600 * 1000))

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hasUrlParams = params.has('search') || params.has('category') || params.has('tag') || params.has('sort')

    if (hasUrlParams) {
      const searchParam = params.get('search')
      if (searchParam) setSearchQuery(searchParam)
      const categoryParam = params.get('category')
      if (categoryParam && categories.includes(categoryParam)) setSelectedCategory(categoryParam)
      const tagParam = params.get('tag')
      if (tagParam) setActiveTags(tagParam.split(',').filter(Boolean))
      const sortParam = params.get('sort') as SortKey | null
      if (sortParam && sortOptions.some((o) => o.value === sortParam)) setSortBy(sortParam)
    } else {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY)
        if (raw) {
          const saved = JSON.parse(raw)
          if (saved.selectedCategory) setSelectedCategory(saved.selectedCategory)
          if (typeof saved.searchQuery === 'string') setSearchQuery(saved.searchQuery)
          if (saved.sortBy) setSortBy(saved.sortBy)
          if (typeof saved.minPrice === 'number' || saved.minPrice === null) setMinPrice(saved.minPrice)
          if (typeof saved.maxPrice === 'number' || saved.maxPrice === null) setMaxPrice(saved.maxPrice)
          if (Array.isArray(saved.activeTags)) setActiveTags(saved.activeTags)
        }
      } catch (e) {
        console.error(e)
      }
    }
    setIsRestored(true)
  }, [])

  useEffect(() => {
    if (!isRestored) return
    try {
      const data = { selectedCategory, searchQuery, sortBy, minPrice, maxPrice, activeTags }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error(e)
    }
  }, [selectedCategory, searchQuery, sortBy, minPrice, maxPrice, activeTags, isRestored])

  const priceBounds = useMemo(() => {
    const prices = products.flatMap(getProductPrices)
    if (prices.length === 0) {
      return { min: FALLBACK_PRICE_MIN, max: FALLBACK_PRICE_MIN }
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  }, [products])

  const rawMinPrice = minPrice ?? priceBounds.min
  const rawMaxPrice = maxPrice ?? priceBounds.max
  const boundedMinPrice = Math.min(Math.max(rawMinPrice, priceBounds.min), priceBounds.max)
  const boundedMaxPrice = Math.min(Math.max(rawMaxPrice, priceBounds.min), priceBounds.max)
  const currentMinPrice = Math.min(boundedMinPrice, boundedMaxPrice)
  const currentMaxPrice = Math.max(boundedMinPrice, boundedMaxPrice)

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const prices = getProductPrices(product)
      const matchesPrice =
        prices.length === 0 ||
        prices.some((price) => price >= currentMinPrice && price <= currentMaxPrice)
      const matchesTags =
        activeTags.length === 0 ||
        activeTags.some((tag) => product.benefits.some((b) => b.toLowerCase().includes(tag.toLowerCase())))
      return matchesCategory && matchesSearch && matchesPrice && matchesTags
    })

    const sorted = [...filtered]
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => getLowestProductPrice(a) - getLowestProductPrice(b))
        break
      case 'price-desc':
        sorted.sort((a, b) => getHighestProductPrice(b) - getHighestProductPrice(a))
        break
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'newest':
        sorted.sort((a, b) => b.id - a.id)
        break
      case 'featured':
      default:
        sorted.sort((a, b) => {
          const order = { Bestseller: 0, Popular: 1, New: 2 }
          const aRank = a.badge ? (order as any)[a.badge] ?? 99 : 99
          const bRank = b.badge ? (order as any)[b.badge] ?? 99 : 99
          return aRank - bRank
        })
    }
    return sorted
  }, [products, selectedCategory, searchQuery, sortBy, currentMinPrice, currentMaxPrice, activeTags])

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearAll = () => {
    setSelectedCategory('All')
    setSearchQuery('')
    setSortBy('featured')
    setMinPrice(null)
    setMaxPrice(null)
    setActiveTags([])
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch (e) {}
  }

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    searchQuery !== '' ||
    minPrice !== null ||
    maxPrice !== null ||
    activeTags.length > 0

  // Percentages for the coloured track bar
  const priceSpan = Math.max(1, priceBounds.max - priceBounds.min)
  const minPercent = ((currentMinPrice - priceBounds.min) / priceSpan) * 100
  const maxPercent = ((currentMaxPrice - priceBounds.min) / priceSpan) * 100

  const renderFilterPanel = () => (
    <div className="space-y-8 pb-20">
      <div>
        <h3 className="text-xl font-bold text-[#2d1b15] mb-4">Search</h3>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b5347] w-5 h-5" />
          <input
            id="catalog-search-input"
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border-2 border-[#e8ddd0] bg-white pl-12 pr-4 py-3.5 text-base focus:outline-none focus:border-[#c9a45c] focus:ring-4 focus:ring-[#c9a45c]/10 transition font-medium text-[#2d1b15]"
          />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-[#2d1b15] mb-4">Categories</h3>
        <div className="flex flex-col gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex justify-between items-center border-2 ${
                selectedCategory === category
                  ? 'bg-[#8b1a1a] border-[#8b1a1a] text-white shadow-lg shadow-[#8b1a1a]/30'
                  : 'bg-white border-[#e8ddd0] text-[#6b5347] hover:border-[#c9a45c] hover:bg-[#faf6f0]'
              }`}
            >
              {category}
              {selectedCategory === category && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-[#2d1b15] mb-4">Price Range</h3>
        <div className="dual-range-slider">
          {/* Background track */}
          <div className="slider-track" />
          {/* Coloured range between thumbs */}
          <div
            className="slider-range"
            style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
          />
          {/* Min thumb */}
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            step={PRICE_STEP}
            value={currentMinPrice}
            onChange={(e) => {
              const val = Math.min(Number(e.target.value), currentMaxPrice)
              setMinPrice(val)
            }}
            aria-label="Minimum price"
          />
          {/* Max thumb */}
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            step={PRICE_STEP}
            value={currentMaxPrice}
            onChange={(e) => {
              const val = Math.max(Number(e.target.value), currentMinPrice)
              setMaxPrice(val)
            }}
            className="thumb-upper"
            aria-label="Maximum price"
          />
        </div>
        <div className="flex justify-between mt-2 text-sm font-semibold text-[#6b5347]">
          <span>₹{currentMinPrice}</span>
          <span className="text-[#8b1a1a]">₹{currentMaxPrice}</span>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-[#2d1b15] mb-4">Dietary &amp; Quality</h3>
        <div className="flex flex-wrap gap-2">
          {dietaryTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border-2 transition-all ${
                activeTags.includes(tag)
                  ? 'border-[#8b1a1a] bg-[#8b1a1a] text-white'
                  : 'border-[#e8ddd0] bg-white text-[#6b5347] hover:border-[#c9a45c]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="w-full py-3 rounded-xl border-2 border-[#e8ddd0] text-[#8b1a1a] hover:bg-[#faf6f0] text-sm font-bold uppercase tracking-wider transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <div className="pb-16">
      {/* ══════════════ SHOP HERO BANNER ══════════════ */}
      <section className="relative w-full min-h-[420px] sm:h-[480px] md:h-[520px] lg:h-[560px] overflow-hidden">
        {/* Background image */}
        <Image
          src="/Banners/shop-hero.png"
          alt="Annavedah Foods — Premium organic products"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0e08]/90 via-[#1a0e08]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0e08]/70 via-transparent to-[#1a0e08]/30" />

        {/* Decorative floating elements */}
        <div className="absolute top-8 right-8 w-24 h-24 rounded-full bg-[#c9a45c]/10 blur-2xl animate-pulse" />
        <div className="absolute bottom-16 right-1/4 w-32 h-32 rounded-full bg-[#8b1a1a]/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Content */}
        <div className="relative sm:absolute inset-0 flex items-center py-10 sm:py-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-5 sm:space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white/90 text-xs font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#c9a45c] animate-pulse" />
                सात्विक · पौष्टिक · परिपूर्ण
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                Discover Our
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5e6c8] via-[#c9a45c] to-[#f5e6c8]">
                  Full Range
                </span>
              </h1>

              {/* Subline */}
              <p className="text-base sm:text-lg text-white/75 max-w-lg leading-relaxed">
                Farm-fresh, nutrient-dense powders, grains, and essentials crafted for your daily wellness. Pure, traditional, and uncompromised.
              </p>

              {/* Category quick-links */}
              <div className="flex flex-wrap gap-2 pt-2">
                {['Grains', 'Pulses', 'Powders', 'Essentials', 'Snacks'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); document.getElementById('shop-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                    className="px-4 py-2 rounded-full border border-white/25 bg-white/5 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider hover:bg-white/15 hover:border-[#c9a45c] transition-all duration-300"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Trust stats */}
              <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                <div>
                  <p className="text-2xl font-bold text-[#c9a45c]">80+</p>
                  <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Products</p>
                </div>
                <div className="w-px h-10 bg-white/15" />
                <div>
                  <p className="text-2xl font-bold text-[#c9a45c]">100%</p>
                  <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Natural</p>
                </div>
                <div className="w-px h-10 bg-white/15" />
                <div>
                  <p className="text-2xl font-bold text-[#c9a45c]">7+</p>
                  <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Categories</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => document.getElementById('shop-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 hover:text-white/70 transition-colors group cursor-pointer"
          aria-label="Scroll to products"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest">Explore</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </section>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <div id="shop-grid" className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 scroll-mt-[calc(var(--site-header-offset)+1rem)]">
      <Breadcrumbs items={[{ label: 'Products' }]} />

      <div className="rounded-3xl bg-gradient-to-r from-[#8b1a1a] via-[#8b1a1a] to-[#6d1414] text-white px-6 py-6 md:py-5 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xl overflow-hidden">
        <div className="min-w-0">
          <p className="text-[#f5e6c8] text-xs font-bold uppercase tracking-widest mb-1">Limited time</p>
          <p className="text-xl md:text-2xl font-bold">Festive offer · Up to 15% off select essentials</p>
        </div>
        <div className="shrink-0">
          <CountdownTimer endsAt={flashEnd} label="Offer ends in" compact />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Desktop sidebar */}
        <div className="hidden lg:block lg:w-1/4 flex-shrink-0 lg:sticky lg:top-[120px] lg:self-start lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto z-10 scrollbar-thin scrollbar-thumb-[#e8ddd0] scrollbar-track-transparent pr-3">
          {renderFilterPanel()}
        </div>

        {/* Mobile filter trigger + Sort + Results */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between gap-3 bg-white border-2 border-[#e8ddd0] rounded-2xl p-3 lg:p-4">
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 border-2 border-[#e8ddd0] rounded-xl text-sm font-bold text-[#2d1b15] hover:border-[#c9a45c] transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="ml-1 w-2 h-2 rounded-full bg-[#8b1a1a]" />}
            </button>

            <p className="text-sm text-[#6b5347] hidden lg:block">
              <span className="font-bold text-[#2d1b15]">{filteredProducts.length}</span> products
            </p>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-[#6b5347] hidden sm:block" />
              <label htmlFor="sort" className="sr-only">Sort by</label>
              <div className="relative">
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="appearance-none rounded-xl border-2 border-[#e8ddd0] bg-white px-3 py-2.5 pr-10 text-sm font-bold text-[#2d1b15] focus:outline-none focus:border-[#c9a45c] cursor-pointer"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b5347]"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-[#e8ddd0]">
              <p className="text-2xl font-bold text-[#2d1b15]">No products found</p>
              <p className="text-[#6b5347] mt-2">Try a different category, price range, or clear your filters.</p>
              {hasActiveFilters && (
                <Button onClick={clearAll} className="mt-4 bg-[#8b1a1a] hover:bg-[#6d1414] text-white">
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 md:gap-8 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <PLPProductCard key={product.id} product={product} add={add} />
              ))}
            </div>
          )}

          <div className="pt-8">
            <TrustBadges />
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[#faf6f0] flex flex-col">
            <div className="p-5 border-b border-[#e8ddd0] flex items-center justify-between bg-white">
              <h3 className="text-lg font-bold text-[#8b1a1a] uppercase tracking-wider">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} className="p-2 hover:bg-[#f0e8dc] rounded-full" aria-label="Close">
                <X className="w-5 h-5 text-[#2d1b15]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{renderFilterPanel()}</div>
            <div className="p-4 border-t border-[#e8ddd0] bg-white">
              <Button
                className="w-full h-12 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold uppercase tracking-wider rounded-xl"
                onClick={() => setFiltersOpen(false)}
              >
                Show {filteredProducts.length} results
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>{/* end shop-grid */}
    </div>
  )
}
