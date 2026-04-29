import type { Metadata } from 'next'
import { testimonials } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Customer Testimonials | Annavedah Foods',
  description: 'Read real stories from families who trust Annavedah for their daily nutrition. Discover how our traditional products have made a difference in their lives.',
  keywords: ['testimonials', 'customer reviews', 'family nutrition', 'traditional foods', 'Ayurvedic products', 'Annavedah customers'],
  openGraph: {
    title: 'Loved by Families | Annavedah Foods',
    description: 'Real experiences from customers who use Annavedah products in their daily routines.',
    type: 'website',
  },
}

export default function TestimonialsPage() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-10">
      <div className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Testimonials</p>
        <h1 className="text-4xl font-bold text-primary md:text-5xl">Trusted by families across India</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real experiences from customers who use Annavedah products in their daily routines.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <div key={testimonial.name} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-lg font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.location}</p>
              </div>
              <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">{testimonial.rating} / 5</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">"{testimonial.text}"</p>
          </div>
        ))}
      </div>
    </div>
  )
}
