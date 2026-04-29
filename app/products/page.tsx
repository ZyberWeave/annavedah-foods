'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { categories, products } from '@/lib/content'
import { useCart } from '@/components/cart-context'

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const { add } = useCart()

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
    <div className="container mx-auto px-4 py-16 space-y-12">
      <div className="space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Products</p>
        <h1 className="text-4xl font-bold text-primary md:text-5xl">Discover our full range</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Clean, nutrient-dense powders and blends crafted for daily use. Filter by category or search to find what suits your routine.
        </p>
      </div>

      <div className="space-y-6">
        <div className="max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border-2 border-border bg-card px-4 py-4 text-lg focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 justify-center flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card border-2 border-border text-foreground hover:border-accent hover:text-accent'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground text-sm font-semibold">
            No Results
          </div>
          <p className="text-muted-foreground">No products match your filters. Try a different keyword or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group rounded-3xl border-2 border-border bg-card overflow-hidden shadow-sm"
            >
              <div className="relative h-72 bg-white">
                <Link href={`/products/${product.slug}`} className="block h-full w-full">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <span>{product.category}</span>
                  {product.badge && <span className="rounded-full bg-accent/15 px-3 py-1 text-accent">{product.badge}</span>}
                </div>
                <Link href={`/products/${product.slug}`} className="block space-y-1">
                  <h3 className="text-2xl font-bold text-foreground">{product.name}</h3>
                  {product.localName !== product.name && (
                    <p className="text-sm text-muted-foreground">{product.localName}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </Link>
                <div className="flex flex-wrap gap-2">
                  {product.benefits.map((benefit) => (
                    <span key={benefit} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {benefit}
                    </span>
                  ))}
                </div>
                <div className="space-y-2 pt-2">
                  {product.price > 0 ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">From Rs {product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-muted-foreground">up to Rs {product.originalPrice}</span>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                      Price on request
                    </span>
                  )}
                  {product.packPrices.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {product.packPrices.map((pack) => (
                        <span key={`${product.id}-${pack.size}`} className="rounded-full bg-background border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                          {pack.size}: Rs {pack.price}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button asChild variant="outline" className="h-11 flex-1 font-semibold">
                    <Link href={`/products/${product.slug}`}>View details</Link>
                  </Button>
                  <Button className="h-11 flex-1 font-semibold" onClick={() => add(product.id)} disabled={product.price <= 0}>
                    {product.price > 0 ? 'Add to cart' : 'Enquire'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
