'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { products } from '@/lib/content'
import { useCart } from '@/components/cart-context'
import { useRecentlyViewed } from '@/components/recently-viewed-context'
import { ShoppingCart, Check, Truck, ShieldCheck, RefreshCcw, Star } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import ProductGallery from '@/components/ProductGallery'
import ProductTabs from '@/components/ProductTabs'
import ProductReviews from '@/components/ProductReviews'
import StickyAddToCart from '@/components/StickyAddToCart'
import WishlistButton from '@/components/WishlistButton'
import RecentlyViewed from '@/components/RecentlyViewed'

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export default function ProductDetailPage(props: ProductPageProps) {
  const params = use(props.params)
  const product = products.find((item) => item.slug === params.slug)
  if (!product) {
    notFound()
  }
  const { add } = useCart()
  const { push } = useRecentlyViewed()

  const [selectedPack, setSelectedPack] = useState(product.packPrices[0])
  const [qty, setQty] = useState(1)
  const currentPrice = selectedPack ? selectedPack.price : product.price
  const hasPrice = currentPrice > 0

  useEffect(() => {
    push(product.id)
  }, [product.id, push])

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category && p.price > 0)
    .slice(0, 4)

  return (
    <div className="container mx-auto px-4 pt-[120px] lg:pt-[190px] pb-20 lg:pb-16 space-y-12">
      <Breadcrumbs
        items={[
          { label: 'Products', href: '/products' },
          { label: product.category, href: `/products?category=${encodeURIComponent(product.category)}` },
          { label: product.name },
        ]}
      />

      <div className="grid gap-10 md:grid-cols-2 md:items-start">
        <ProductGallery images={[product.image]} alt={product.name} />

        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a45c]">{product.category}</p>
            <h1 className="text-4xl font-bold text-[#2d1b15] md:text-5xl leading-tight">{product.name}</h1>
            {product.localName !== product.name && (
              <p className="text-base text-[#6b5347] italic">{product.localName}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`w-4 h-4 ${n <= 5 ? 'fill-[#c9a45c] text-[#c9a45c]' : 'text-[#e8ddd0]'}`} />
              ))}
            </div>
            <span className="text-sm text-[#6b5347]"><span className="font-bold text-[#2d1b15]">4.8</span> · 124 reviews</span>
            {product.badge && (
              <span className="text-[10px] font-bold uppercase tracking-widest bg-[#8b1a1a] text-white px-3 py-1 rounded-full">
                {product.badge}
              </span>
            )}
          </div>

          <p className="text-lg text-[#2d1b15]/80 leading-relaxed">{product.description}</p>

          {hasPrice ? (
            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-[#8b1a1a]">₹{currentPrice}</span>
                {selectedPack && product.packPrices.length > 1 && (
                  <span className="text-sm text-[#6b5347]">/ {selectedPack.size}</span>
                )}
              </div>
              {product.packPrices.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#6b5347]">Choose pack size</p>
                  <div className="flex flex-wrap gap-3">
                    {product.packPrices.map((pack) => (
                      <button
                        key={`${product.slug}-${pack.size}`}
                        onClick={() => setSelectedPack(pack)}
                        className={`group relative flex flex-col items-center justify-center min-w-[88px] px-4 py-3 border-2 rounded-2xl transition-all duration-300 ${
                          selectedPack?.size === pack.size
                            ? 'border-[#8b1a1a] bg-[#8b1a1a] text-white shadow-lg ring-2 ring-[#8b1a1a] ring-offset-2 ring-offset-[#faf6f0]'
                            : 'border-[#e8ddd0] bg-white text-[#6b5347] hover:border-[#c9a45c] hover:shadow-md hover:-translate-y-0.5'
                        }`}
                      >
                        <span className={`text-sm font-extrabold tracking-tight ${selectedPack?.size === pack.size ? 'text-white' : 'text-[#2d1b15]'}`}>
                          {pack.size}
                        </span>
                        <span className={`text-xs font-bold mt-0.5 ${selectedPack?.size === pack.size ? 'text-white/90' : 'text-[#8b1a1a]'}`}>
                          ₹{pack.price}
                        </span>

                        {selectedPack?.size === pack.size && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#c9a45c] rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <span className="inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
              Price on request
            </span>
          )}

          <div className="flex flex-wrap gap-2">
            {product.benefits.map((benefit) => (
              <span key={benefit} className="rounded-full bg-[#c9a45c]/10 border border-[#c9a45c]/20 px-3 py-1 text-xs font-semibold text-[#8b1a1a]">
                {benefit}
              </span>
            ))}
          </div>

          {hasPrice && (
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[#6b5347]">Quantity</p>
              <div className="flex items-center border-2 border-[#e8ddd0] rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center hover:bg-[#faf6f0] transition-colors text-lg font-bold text-[#2d1b15]"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-12 text-center font-bold text-[#2d1b15] tabular-nums">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-10 h-11 flex items-center justify-center hover:bg-[#faf6f0] transition-colors text-lg font-bold text-[#2d1b15]"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              className="h-14 px-8 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold rounded-xl text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              onClick={() => add(product.id, selectedPack, qty)}
              disabled={!hasPrice}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {hasPrice ? 'Add to Cart' : 'Enquire'}
            </Button>
            <WishlistButton productId={product.id} variant="pill" />
            <Button asChild variant="outline" className="h-14 px-6 border-2 border-[#c9a45c] text-[#8b1a1a] hover:bg-[#c9a45c]/10 font-bold rounded-xl text-lg">
              <Link href="/contact">Talk to us</Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#e8ddd0]">
            {[
              { icon: Truck, label: 'Free shipping', sub: 'On orders ₹999+' },
              { icon: RefreshCcw, label: '7-day returns', sub: 'Hassle-free' },
              { icon: ShieldCheck, label: 'FSSAI', sub: 'Certified' },
            ].map((b) => {
              const Icon = b.icon
              return (
                <div key={b.label} className="text-center">
                  <Icon className="w-5 h-5 text-[#c9a45c] mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-[#2d1b15]">{b.label}</p>
                  <p className="text-[10px] text-[#6b5347]">{b.sub}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <ProductTabs product={product} />

      <ProductReviews />

      {related.length > 0 && (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a45c] mb-1">More like this</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2d1b15]">You may also like</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => {
              const firstPack = p.packPrices[0]
              return (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group block bg-white border-2 border-[#e8ddd0] rounded-2xl overflow-hidden hover:border-[#c9a45c] hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-square bg-[url('/product-bg.webp')] bg-cover bg-center">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-bold text-[#2d1b15] line-clamp-1 group-hover:text-[#8b1a1a]">{p.name}</p>
                    {firstPack && <p className="text-sm font-bold text-[#8b1a1a]">₹{firstPack.price}</p>}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <RecentlyViewed excludeId={product.id} />

      <StickyAddToCart
        product={product}
        price={currentPrice}
        packLabel={selectedPack?.size}
        onAdd={() => add(product.id, selectedPack, qty)}
        disabled={!hasPrice}
      />
    </div>
  )
}
