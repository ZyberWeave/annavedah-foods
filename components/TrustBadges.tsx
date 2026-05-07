'use client'

import { ShieldCheck, Truck, Award, RefreshCcw, Leaf, Lock } from 'lucide-react'

const items = [
  { icon: Lock, label: '100% Secure Payment', sub: 'Razorpay protected' },
  { icon: Truck, label: 'Fast Pan-India Shipping', sub: 'On orders ₹999+' },
  { icon: Award, label: 'FSSAI Certified', sub: 'Quality assured' },
  { icon: RefreshCcw, label: 'Easy Returns', sub: '7-day window' },
  { icon: Leaf, label: 'Farm-Sourced', sub: 'No middlemen' },
  { icon: ShieldCheck, label: 'Authentic Products', sub: '100% pure' },
]

export default function TrustBadges({ variant = 'grid', limit, compact = false }: { variant?: 'grid' | 'row'; limit?: number; compact?: boolean }) {
  const display = limit ? items.slice(0, limit) : items

  if (variant === 'row') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-6">
        {display.map((b) => {
          const Icon = b.icon
          return (
            <div key={b.label} className="flex items-center gap-2 text-[#6b5347]">
              <Icon className="w-5 h-5 text-[#c9a45c]" />
              <span className="text-sm font-semibold uppercase tracking-wider">{b.label}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={compact ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'}>
      {display.map((b) => {
        const Icon = b.icon
        return (
          <div
            key={b.label}
            className="rounded-2xl border border-[#e8ddd0] bg-white p-4 flex flex-col items-center text-center gap-2 hover:border-[#c9a45c] hover:shadow-md transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-[#c9a45c]/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-[#8b1a1a]" />
            </div>
            <p className="text-xs font-bold text-[#2d1b15] leading-tight">{b.label}</p>
            <p className="text-[10px] text-[#6b5347] leading-tight">{b.sub}</p>
          </div>
        )
      })}
    </div>
  )
}
