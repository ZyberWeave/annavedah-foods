'use client'

import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'

type Props = {
  endsAt: Date | string
  label?: string
  compact?: boolean
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export default function CountdownTimer({ endsAt, label = 'Flash sale ends in', compact = false }: Props) {
  const target = typeof endsAt === 'string' ? new Date(endsAt) : endsAt
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const diff = Math.max(0, target.getTime() - now)
  if (diff <= 0) return null

  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  if (compact) {
    return (
      <span className="inline-flex items-center gap-2 text-xs font-bold text-white bg-white/20 px-4 py-2 rounded-full whitespace-nowrap border border-white/30">
        <Flame className="w-3.5 h-3.5 text-[#c9a45c] shrink-0" />
        {label && <span className="text-white/70 mr-1">{label}</span>}
        <span className="tabular-nums tracking-wider">
          {days > 0 ? `${days}d ` : ''}{pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </span>
      </span>
    )
  }

  const Box = ({ value, unit }: { value: number; unit: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-[#2d1b15] text-[#c9a45c] font-bold text-2xl md:text-3xl rounded-xl px-3 md:px-4 py-2 md:py-3 min-w-[60px] md:min-w-[72px] text-center tabular-nums shadow-inner">
        {pad(value)}
      </div>
      <span className="text-[10px] uppercase tracking-widest text-[#6b5347] mt-1.5 font-semibold">{unit}</span>
    </div>
  )

  return (
    <div className="inline-flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-[#8b1a1a] font-bold text-sm uppercase tracking-widest">
        <Flame className="w-4 h-4 animate-pulse" />
        {label}
      </div>
      <div className="flex items-end gap-2 md:gap-3">
        {days > 0 && (
          <>
            <Box value={days} unit="Days" />
            <span className="text-[#c9a45c] text-2xl font-bold pb-6">:</span>
          </>
        )}
        <Box value={hours} unit="Hours" />
        <span className="text-[#c9a45c] text-2xl font-bold pb-6">:</span>
        <Box value={minutes} unit="Mins" />
        <span className="text-[#c9a45c] text-2xl font-bold pb-6">:</span>
        <Box value={seconds} unit="Secs" />
      </div>
    </div>
  )
}
