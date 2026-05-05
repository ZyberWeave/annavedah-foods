'use client'

import { useState, useRef, type MouseEvent } from 'react'
import Image from 'next/image'
import { ZoomIn } from 'lucide-react'

type Props = {
  images: string[]
  alt: string
}

export default function ProductGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const ref = useRef<HTMLDivElement>(null)

  const list = images.length > 0 ? images : ['/placeholder.jpg']
  const current = list[active]

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }

  return (
    <div className="space-y-4">
      <div
        ref={ref}
        className="relative group bg-[url('/product-bg.webp')] bg-cover bg-center border border-border rounded-3xl shadow-xl overflow-hidden cursor-zoom-in"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
      >
        <div className="relative aspect-square">
          <Image
            src={current}
            alt={alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-8 drop-shadow-2xl transition-transform duration-300"
            style={
              zoom
                ? {
                    transform: 'scale(2)',
                    transformOrigin: `${pos.x}% ${pos.y}%`,
                  }
                : undefined
            }
          />
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4 text-[#2d1b15]" />
        </div>
      </div>

      {list.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              onClick={() => setActive(i)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all bg-[url('/product-bg.webp')] bg-cover bg-center ${
                active === i ? 'border-[#8b1a1a] ring-2 ring-[#8b1a1a]/20' : 'border-[#e8ddd0] hover:border-[#c9a45c]'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
