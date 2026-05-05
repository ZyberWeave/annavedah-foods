'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { categories, products, banners } from '@/lib/content'

export default function MegaMenu() {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  const enter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }

  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  const realCategories = categories.filter((c) => c !== 'All')

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <Link
        href="/products"
        className="relative py-2 transition-colors duration-300 hover:text-[#c9a45c] group text-[#2d1b15] inline-flex items-center gap-1"
      >
        Products
        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#c9a45c] transition-all duration-300 group-hover:w-full" />
      </Link>

      <div
        className={`absolute left-1/2 -translate-x-1/2 top-full pt-2 transition-all duration-300 ${
          open ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="bg-white shadow-2xl rounded-2xl border border-[#e8ddd0] overflow-hidden w-[880px] max-w-[92vw]">
          <div className="grid grid-cols-12 gap-0">
            <div className="col-span-4 bg-[#faf6f0] p-6 border-r border-[#e8ddd0]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c9a45c] mb-3">Shop by category</p>
              <ul className="space-y-1">
                {realCategories.map((cat) => (
                  <li key={cat}>
                    <Link
                      href={`/products?category=${encodeURIComponent(cat)}`}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-[#2d1b15] hover:bg-white hover:text-[#8b1a1a] transition-colors"
                    >
                      {cat}
                      <span className="ml-2 text-xs text-[#6b5347] font-normal">
                        ({products.filter((p) => p.category === cat).length})
                      </span>
                    </Link>
                  </li>
                ))}
                <li className="pt-2 mt-2 border-t border-[#e8ddd0]">
                  <Link
                    href="/products"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-bold text-[#8b1a1a] hover:bg-white transition-colors"
                  >
                    View all products →
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-8 p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c9a45c] mb-3">Featured</p>
              <div className="grid grid-cols-3 gap-4">
                {banners.slice(0, 3).map((b) => (
                  <Link
                    key={b.category}
                    href={`/products?category=${encodeURIComponent(b.category)}`}
                    onClick={() => setOpen(false)}
                    className="group relative block aspect-[4/5] rounded-xl overflow-hidden bg-[#f0e8dc]"
                  >
                    <Image
                      src={b.desktop}
                      alt={b.category}
                      fill
                      sizes="200px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2d1b15]/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-bold uppercase tracking-wider text-sm">{b.category}</p>
                      <p className="text-white/80 text-[11px] mt-0.5">Shop now →</p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-[#e8ddd0] grid grid-cols-3 gap-3">
                {products
                  .filter((p) => p.badge === 'Bestseller' || p.badge === 'Popular' || p.badge === 'New')
                  .slice(0, 3)
                  .map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#faf6f0] transition-colors"
                    >
                      <div className="relative w-12 h-12 rounded-lg bg-[url('/product-bg.webp')] bg-cover bg-center overflow-hidden flex-shrink-0">
                        <Image src={p.image} alt={p.name} fill sizes="48px" className="object-contain p-1.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#2d1b15] truncate">{p.name}</p>
                        {p.badge && <p className="text-[10px] text-[#c9a45c] font-semibold uppercase">{p.badge}</p>}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
