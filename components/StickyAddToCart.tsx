'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/lib/content'

type Props = {
  product: Product
  price: number
  packLabel?: string
  onAdd: () => void
  disabled?: boolean
}

export default function StickyAddToCart({ product, price, packLabel, onAdd, disabled }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-transform duration-300 ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-hidden={!show}
    >
      <div className="bg-white border-t border-[#e8ddd0] shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.2)] px-4 py-3 flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-lg bg-[url('/product-bg.webp')] bg-cover bg-center overflow-hidden flex-shrink-0">
          <Image src={product.image} alt={product.name} fill sizes="48px" className="object-contain p-1.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#2d1b15] truncate">{product.name}</p>
          <p className="text-base font-bold text-[#8b1a1a]">
            ₹{new Intl.NumberFormat('en-IN').format(price)}
            {packLabel && <span className="text-xs text-[#6b5347] font-medium ml-1">/ {packLabel}</span>}
          </p>
        </div>
        <button
          onClick={onAdd}
          disabled={disabled}
          className="h-12 px-5 bg-[#8b1a1a] hover:bg-[#6d1414] disabled:opacity-50 text-white font-bold flex items-center transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  )
}
