'use client'

import { Heart } from 'lucide-react'
import { useWishlist } from '@/components/wishlist-context'

type Props = {
  productId: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'pill'
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export default function WishlistButton({ productId, className = '', size = 'md', variant = 'icon' }: Props) {
  const { has, toggle, isFull } = useWishlist()
  const active = has(productId)
  // Disable add when full (still allow removal)
  const isDisabled = !active && isFull

  if (variant === 'pill') {
    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggle(productId)
        }}
        disabled={isDisabled}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
          active
            ? 'border-[#8b1a1a] bg-[#8b1a1a]/5 text-[#8b1a1a]'
            : isDisabled
            ? 'border-[#e8ddd0] text-[#b8a898] cursor-not-allowed opacity-60'
            : 'border-[#e8ddd0] text-[#6b5347] hover:border-[#c9a45c] hover:text-[#8b1a1a]'
        } ${className}`}
        aria-label={active ? 'Remove from wishlist' : isDisabled ? 'Wishlist is full' : 'Add to wishlist'}
        aria-pressed={active}
        title={isDisabled ? 'Wishlist is full (max 10 items)' : undefined}
      >
        <Heart className={`w-4 h-4 ${active ? 'fill-[#8b1a1a]' : ''}`} />
        {active ? 'Saved' : isFull ? 'Full' : 'Save'}
      </button>
    )
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(productId)
      }}
      disabled={isDisabled}
      className={`${sizes[size]} rounded-full bg-white/95 backdrop-blur-sm shadow-md hover:shadow-lg flex items-center justify-center transition-all ${
        active ? 'text-[#8b1a1a]' : isDisabled ? 'text-[#b8a898] cursor-not-allowed opacity-60' : 'text-[#6b5347] hover:text-[#8b1a1a]'
      } ${className}`}
      aria-label={active ? 'Remove from wishlist' : isDisabled ? 'Wishlist is full' : 'Add to wishlist'}
      aria-pressed={active}
      title={isDisabled ? 'Wishlist is full (max 10 items)' : undefined}
    >
      <Heart
        className={`${iconSizes[size]} transition-transform ${active ? 'fill-[#8b1a1a] scale-110' : ''}`}
      />
    </button>
  )
}
