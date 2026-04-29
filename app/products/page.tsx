'use client'

import { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { categories, products } from '@/lib/content'
import { useCart } from '@/components/cart-context'
import { ShoppingCart, Check, Search } from 'lucide-react'

function PLPProductCard({ product, add }: any) {
  const [selectedPack, setSelectedPack] = useState(product.packPrices[0])
  const currentPrice = selectedPack ? selectedPack.price : product.price

  return (
    <div className="group rounded-3xl border-2 border-[#e8ddd0] bg-white overflow-hidden hover:border-[#c9a45c] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full">
      <div className="relative aspect-square bg-[url('/product-bg.png')] bg-cover bg-center border-b border-[#e8ddd0]">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-6 transition-all duration-500 group-hover:scale-105 drop-shadow-xl group-hover:drop-shadow-2xl"
          />
        </Link>
      </div>
      <div className="p-6 space-y-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>{product.category}</span>
          {product.badge && <span className="rounded-full bg-accent/15 px-3 py-1 text-accent">{product.badge}</span>}
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
            {product.packPrices.map((pack: any) => (
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
  const { add } = useCart()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const searchParam = params.get('search')
    if (searchParam) {
      setSearchQuery(searchParam)
    }
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  return (
    <div className="container mx-auto px-4 pt-32 lg:pt-40 pb-16 space-y-12">
      <div className="space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Products</p>
        <h1 className="text-4xl font-bold text-primary md:text-5xl">Discover our full range</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Clean, nutrient-dense powders and blends crafted for daily use. Filter by category or search to find what suits your routine.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Side Filters */}
        <div className="lg:w-1/4 space-y-8 flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-[#2d1b15] mb-4">Search</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b5347] w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border-2 border-[#e8ddd0] bg-white pl-12 pr-4 py-3.5 text-lg focus:outline-none focus:border-[#c9a45c] focus:ring-4 focus:ring-[#c9a45c]/10 transition font-medium text-[#2d1b15]"
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
                  className={`w-full text-left px-5 py-4 rounded-2xl text-lg font-bold transition-all duration-300 flex justify-between items-center border-2 ${
                    selectedCategory === category
                      ? 'bg-[#8b1a1a] border-[#8b1a1a] text-white shadow-lg shadow-[#8b1a1a]/30 scale-[1.02]'
                      : 'bg-white border-[#e8ddd0] text-[#6b5347] hover:border-[#c9a45c] hover:bg-[#faf6f0] hover:text-[#2d1b15] hover:scale-[1.01]'
                  }`}
                >
                  {category}
                  {selectedCategory === category && (
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-[#e8ddd0]">
              <p className="text-2xl font-bold text-[#2d1b15]">No products found</p>
              <p className="text-[#6b5347] mt-2">Try a different category or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <PLPProductCard key={product.id} product={product} add={add} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
