'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWishlist, WISHLIST_LIMIT } from '@/components/wishlist-context'
import { useCart } from '@/components/cart-context'
import { products } from '@/lib/content'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function WishlistPage() {
  const { ids, toggle, count, isFull } = useWishlist()
  const { add } = useCart()

  const items = useMemo(
    () => ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products,
    [ids],
  )

  return (
    <div className="container mx-auto px-4 pt-[120px] lg:pt-[190px] pb-16 space-y-8">
      <Breadcrumbs items={[{ label: 'Wishlist' }]} />

      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Saved for later</p>
        <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center gap-3">
          <Heart className="w-8 h-8 text-[#8b1a1a] fill-[#8b1a1a]" />
          My Wishlist
          {count > 0 && (
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              isFull ? 'bg-red-100 text-red-700' : count >= WISHLIST_LIMIT - 2 ? 'bg-amber-100 text-amber-700' : 'bg-[#f0e8dc] text-[#6b5347]'
            }`}>
              {count}/{WISHLIST_LIMIT}
            </span>
          )}
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-[#e8ddd0] bg-white py-20 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-[#f0e8dc] mx-auto flex items-center justify-center">
            <Heart className="w-10 h-10 text-[#c9a45c]" />
          </div>
          <p className="text-xl font-bold text-[#2d1b15]">Your wishlist is empty</p>
          <p className="text-[#6b5347]">Save products you love by tapping the heart icon.</p>
          <Button asChild className="h-11 px-6 font-semibold bg-[#8b1a1a] hover:bg-[#6d1414] text-white">
            <Link href="/products">Explore products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((p) => {
            const firstPack = p.packPrices[0]
            return (
              <div
                key={p.id}
                className="group relative rounded-3xl border-2 border-[#e8ddd0] bg-white overflow-hidden hover:border-[#c9a45c] transition-all flex flex-col"
              >
                <button
                  onClick={() => toggle(p.id)}
                  className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center hover:bg-red-50 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
                <Link href={`/products/${p.slug}`} className="block relative aspect-square bg-[url('/product-bg.webp')] bg-cover bg-center border-b border-[#e8ddd0]">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="p-4 space-y-2 flex-1 flex flex-col">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-[#c9a45c]">{p.category}</p>
                  <Link href={`/products/${p.slug}`} className="block">
                    <h3 className="text-lg font-bold text-[#2d1b15] hover:text-[#8b1a1a] transition-colors line-clamp-1">{p.name}</h3>
                  </Link>
                  {firstPack ? (
                    <p className="text-xl font-bold text-[#8b1a1a]">₹{firstPack.price}</p>
                  ) : (
                    <p className="text-xs font-semibold text-amber-700">Price on request</p>
                  )}
                  <Button
                    className="mt-auto h-11 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold rounded-xl"
                    onClick={() => firstPack && add(p.id, firstPack)}
                    disabled={!firstPack}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
