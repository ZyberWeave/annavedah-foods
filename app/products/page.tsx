'use client'

import { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { categories, products, type Product } from '@/lib/content'
import { useCart } from '@/components/cart-context'
import { ShoppingCart, Check, Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react'
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

const PRICE_MIN = 0
const PRICE_MAX = 2500

function PLPProductCard({ product, add }: { product: Product; add: (id: number, pack?: any) => void }) {
  const [selectedPack, setSelectedPack] = useState(product.packPrices[0])
  const currentPrice = selectedPack ? selectedPack.price : product.price

  return (
    <div className="group relative rounded-3xl border-2 border-[#e8ddd0] bg-white overflow-hidden hover:border-[#c9a45c] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full">
      <div className="absolute top-3 right-3 z-10">
        <WishlistButton productId={product.id} size="md" />
      </div>
      {product.badge && (
        <span className="absolute top-3 left-3 z-10 rounded-full bg-[#8b1a1a] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 shadow-md">
          {product.badge}
        </span>
      )}
      <div className="relative aspect-square bg-[url('/product-bg.webp')] bg-cover bg-center border-b border-[#e8ddd0]">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-6 transition-all duration-500 group-hover:scale-105 drop-shadow-xl group-hover:drop-shadow-2xl"
          />
        </Link>
      </div>
      <div className="p-6 space-y-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>{product.category}</span>
        </div>
        <Link href={`/products/${product.slug}`} className="block space-y-1 group-hover:text-[#8b1a1a] transition-colors">
          <h3 className="text-2xl font-bold text-[#2d1b15] group-hover:text-[#8b1a1a]">{product.name}</h3>
          {product.localName !== product.name && (
            <p className="text-sm text-muted-foreground">{product.localName}</p>
          )}
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        </Link>

        {product.packPrices.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {product.packPrices.map((pack) => (
              <button
                key={`${product.id}-${pack.size}`}
                onClick={() => setSelectedPack(pack)}
                className={`relative px-3 py-1.5 border-2 rounded-xl text-xs font-bold transition-all duration-300 ${
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

        <div className="space-y-2 pt-2">
          {currentPrice > 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">Rs {currentPrice}</span>
            </div>
          ) : (
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
              Price on request
            </span>
          )}
        </div>

        <div className="flex gap-2 pt-4 mt-auto border-t border-[#e8ddd0]/50">
          <Button asChild variant="outline" className="flex-1 h-12 border-2 border-[#c9a45c] text-[#8b1a1a] hover:bg-[#c9a45c]/10 font-semibold rounded-xl transition-all">
            <Link href={`/products/${product.slug}`}>Details</Link>
          </Button>
          <Button
            className="flex-1 h-12 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            onClick={() => add(product.id, selectedPack)}
            disabled={currentPrice <= 0}
          >
            <ShoppingCart className="w-4 h-4 mr-1 md:mr-2" />
            {currentPrice > 0 ? 'Add' : 'Enquire'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('featured')
  const [minPrice, setMinPrice] = useState(PRICE_MIN)
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX)
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { add } = useCart()

  // Flash sale countdown — 48 hours from now
  const [flashEnd] = useState(() => new Date(Date.now() + 48 * 3600 * 1000))

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const searchParam = params.get('search')
    if (searchParam) setSearchQuery(searchParam)
    const categoryParam = params.get('category')
    if (categoryParam && categories.includes(categoryParam)) setSelectedCategory(categoryParam)
  }, [])

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const price = product.price
      const matchesPrice = price === 0 || (price >= minPrice && price <= maxPrice)
      const matchesTags =
        activeTags.length === 0 ||
        activeTags.some((tag) => product.benefits.some((b) => b.toLowerCase().includes(tag.toLowerCase())))
      return matchesCategory && matchesSearch && matchesPrice && matchesTags
    })

    const sorted = [...filtered]
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => (a.price || Infinity) - (b.price || Infinity))
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
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
  }, [selectedCategory, searchQuery, sortBy, minPrice, maxPrice, activeTags])

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearAll = () => {
    setSelectedCategory('All')
    setSearchQuery('')
    setSortBy('featured')
    setMinPrice(PRICE_MIN)
    setMaxPrice(PRICE_MAX)
    setActiveTags([])
  }

  const hasActiveFilters =
    selectedCategory !== 'All' || searchQuery !== '' || minPrice !== PRICE_MIN || maxPrice !== PRICE_MAX || activeTags.length > 0

  // Percentages for the coloured track bar
  const minPercent = ((minPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
  const maxPercent = ((maxPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100

  const FilterPanel = (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-[#2d1b15] mb-4">Search</h3>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b5347] w-5 h-5" />
          <input
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
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={50}
            value={minPrice}
            onChange={(e) => {
              const val = Math.min(Number(e.target.value), maxPrice - 50)
              setMinPrice(val)
            }}
            aria-label="Minimum price"
          />
          {/* Max thumb */}
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={50}
            value={maxPrice}
            onChange={(e) => {
              const val = Math.max(Number(e.target.value), minPrice + 50)
              setMaxPrice(val)
            }}
            className="thumb-upper"
            aria-label="Maximum price"
          />
        </div>
        <div className="flex justify-between mt-2 text-sm font-semibold text-[#6b5347]">
          <span>₹{minPrice}</span>
          <span className="text-[#8b1a1a]">₹{maxPrice}</span>
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
      <section className="relative w-full h-[420px] sm:h-[480px] md:h-[520px] lg:h-[560px] overflow-hidden">
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
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-6">
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
                {['Grains', 'Pulses', 'Powders', 'Essentials'].map((cat) => (
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
      <div id="shop-grid" className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
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
        <div className="hidden lg:block lg:w-1/4 flex-shrink-0 lg:sticky lg:top-48 lg:self-start lg:max-h-[calc(100vh-13rem)] lg:overflow-y-auto z-10 scrollbar-thin scrollbar-thumb-[#e8ddd0] scrollbar-track-transparent pr-2">
          {FilterPanel}
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
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="px-3 py-2.5 rounded-xl border-2 border-[#e8ddd0] bg-white text-sm font-bold text-[#2d1b15] focus:outline-none focus:border-[#c9a45c] cursor-pointer"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
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
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
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
            <div className="flex-1 overflow-y-auto p-5">{FilterPanel}</div>
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
