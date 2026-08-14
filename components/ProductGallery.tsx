'use client'

import { useRef, useState, type MouseEvent } from 'react'
import Image from 'next/image'
import { Expand } from 'lucide-react'

type Props = {
  images: string[]
  alt: string
  category?: string
}

export default function ProductGallery({ images, alt, category }: Props) {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const ref = useRef<HTMLDivElement>(null)

  const list = images.length > 0 ? images : ['/placeholder.jpg']
  const current = list[active]

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos({
      x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100)),
    })
  }

  return (
    <div className="space-y-4 lg:sticky site-sticky-top self-start">
      <div
        ref={ref}
        className="group relative overflow-hidden rounded-[2rem] border border-[#d9c9b8] bg-[#eee5d8] shadow-[0_28px_80px_-46px_rgba(58,26,17,0.7)] cursor-zoom-in"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
      >
        <div className="absolute inset-x-8 top-8 z-10 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.24em] text-[#795f50]">
          <span>Annavedah Pantry</span>
          <span>{category || 'Farm selection'}</span>
        </div>

        <div className="absolute inset-8 rounded-full border border-[#c9a45c]/35" aria-hidden="true" />
        <div className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f8f1e7] shadow-[inset_0_0_80px_rgba(201,164,92,0.18)]" aria-hidden="true" />

        <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] xl:aspect-square">
          <Image
            src={current}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 54vw"
            className="object-contain p-12 sm:p-16 lg:p-14 xl:p-20 drop-shadow-[0_30px_28px_rgba(64,31,18,0.22)] transition-transform duration-300"
            style={zoom ? { transform: 'scale(1.65)', transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
          />
        </div>

        <div className="absolute inset-x-8 bottom-8 z-10 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8b1a1a]">Selected with care</p>
            <p className="mt-1 text-sm text-[#5f473b]">From our farm-led food collection</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d1b889] bg-[#fffaf2]/90 text-[#6f201c] shadow-sm" aria-hidden="true">
            <Expand className="h-4 w-4" />
          </span>
        </div>
      </div>

      {list.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {list.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border bg-[#eee5d8] transition-all ${
                active === index ? 'border-[#8b1a1a] ring-2 ring-[#8b1a1a]/15' : 'border-[#d9c9b8] hover:border-[#c9a45c]'
              }`}
              aria-label={`View image ${index + 1}`}
              aria-pressed={active === index}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
