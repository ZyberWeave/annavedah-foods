import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Our Heritage | Annavedah Foods',
  description: 'Discover the ancient wisdom and traditional knowledge behind Annavedah Foods. Learn about our commitment to authentic Ayurvedic nutrition and sustainable practices.',
  keywords: ['heritage', 'Ayurveda', 'traditional wisdom', 'ancient nutrition', 'sustainable practices', 'Annavedah story'],
  openGraph: {
    title: 'Wisdom of Generations | Annavedah Foods',
    description: 'Drawing from centuries of Ayurvedic knowledge, our blends preserve the authentic formulations passed down through generations.',
    type: 'website',
  },
}

export default function HeritagePage() {
  return (
    <div className="container mx-auto px-4 pt-32 lg:pt-40 pb-16 space-y-12">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Heritage</p>
          <h1 className="text-4xl font-bold text-primary md:text-5xl">Wisdom of generations, refined for today.</h1>
          <p className="text-lg text-foreground/80">
            Annavedah brings together time-tested Indian nutrition and modern quality practices. Our name combines "Anna" (food) and "Veda" (knowledge), reflecting our commitment to nourishing traditions. Everything we do is to provide you with the best.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: 'Sattvic', subtitle: 'Pure & balanced foods' },
              { title: 'Paushtik', subtitle: 'Nutrient-rich formulations' },
              { title: 'Paripurna', subtitle: 'Complete nourishment' },
              { title: 'Prakritik', subtitle: 'Pure farm-sourced processes' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-primary">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
            ))}
          </div>
          <Button className="h-11 px-6 font-semibold w-fit" asChild>
            <Link href="/products">Shop the collection</Link>
          </Button>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border shadow-2xl bg-white">
            <Image src="/Logo.jpg" alt="Annavedah heritage" fill className="object-contain p-6" />
          </div>
          <div className="absolute -left-8 -bottom-8 h-40 w-40 rounded-3xl border-4 border-accent/30" />
        </div>
      </div>

      <div className="grid gap-6 rounded-3xl border border-border bg-muted/20 p-10 md:grid-cols-3">
        {[
          { title: 'Source', text: 'Everything is farm-sourced with no middlemen. We work directly with growers who share our view on soil health and clean inputs.' },
          { title: 'Process', text: 'Low-temperature dehydration keeps micronutrients intact while removing excess moisture.' },
          { title: 'Testing', text: 'Every batch is tested for purity, potency, and consistency before it reaches you.' },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
