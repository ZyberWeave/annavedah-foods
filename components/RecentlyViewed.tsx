'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo } from 'react'
import { useRecentlyViewed } from '@/components/recently-viewed-context'
import { products } from '@/lib/content'
import { Clock } from 'lucide-react'

export default function RecentlyViewed({ excludeId }: { excludeId?: number }) {
  const { ids } = useRecentlyViewed()

  const list = useMemo(() => {
    return ids
      .filter((id) => id !== excludeId)
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean)
      .slice(0, 8)
  }, [ids, excludeId])

  if (list.length === 0) return null

  return (
    <section className="py-12 border-t border-[#e8ddd0]">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a45c] flex items-center gap-2 mb-1">
              <Clock className="w-3.5 h-3.5" /> History
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2d1b15]">Recently viewed</h2>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
          {list.map((p) => {
            if (!p) return null
            const firstPack = p.packPrices[0]
            return (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group flex-shrink-0 w-44 snap-start bg-white border-2 border-[#e8ddd0] rounded-2xl overflow-hidden hover:border-[#c9a45c] hover:shadow-lg transition-all"
              >
                <div className="relative aspect-square bg-[url('/product-bg.webp')] bg-cover bg-center">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="176px"
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-sm font-bold text-[#2d1b15] line-clamp-1 group-hover:text-[#8b1a1a] transition-colors">{p.name}</p>
                  <p className="text-xs text-[#6b5347]">{p.category}</p>
                  {firstPack && <p className="text-sm font-bold text-[#8b1a1a]">₹{firstPack.price}</p>}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
