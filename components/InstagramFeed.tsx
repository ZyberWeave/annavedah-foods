'use client'

import Image from 'next/image'
import { Instagram, Heart, MessageCircle } from 'lucide-react'
import { products } from '@/lib/content'

export default function InstagramFeed() {
  const tiles = products.filter((p) => p.image && p.image !== '/placeholder.jpg').slice(0, 6)

  return (
    <section className="py-16 bg-[#faf6f0]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#c9a45c] mb-2 flex items-center justify-center gap-2">
            <Instagram className="w-4 h-4" /> Follow @annavedah.foods
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#2d1b15]">From our community</h2>
          <p className="text-[#6b5347] mt-2 max-w-2xl mx-auto">Real kitchens, real recipes, real wellness journeys with Annavedah.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {tiles.map((p, i) => (
            <a
              key={p.id}
              href="https://www.instagram.com/annavedah.foods?igsh=Zmo5YXA0bzRlbHRm&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl bg-[url('/product-bg.webp')] bg-cover bg-center"
            >
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#2d1b15]/0 group-hover:bg-[#2d1b15]/70 transition-colors duration-300 flex items-center justify-center gap-4 text-white opacity-0 group-hover:opacity-100">
                <span className="flex items-center gap-1 text-sm font-bold">
                  <Heart className="w-4 h-4 fill-white" /> {120 + i * 13}
                </span>
                <span className="flex items-center gap-1 text-sm font-bold">
                  <MessageCircle className="w-4 h-4 fill-white" /> {8 + i * 2}
                </span>
              </div>
              <Instagram className="absolute top-2 right-2 w-4 h-4 text-white/80 drop-shadow-md" />
            </a>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="https://www.instagram.com/annavedah.foods?igsh=Zmo5YXA0bzRlbHRm&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#c9a45c] text-[#8b1a1a] font-bold uppercase tracking-wider text-sm rounded-xl hover:bg-[#c9a45c]/10 transition-colors"
          >
            <Instagram className="w-4 h-4" /> Follow us on Instagram
          </a>
        </div>
      </div>
    </section>
  )
}
