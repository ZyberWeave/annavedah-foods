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

const fiveStarTestimonials = testimonials.filter((t) => t.rating === 5)

export default function TestimonialsPage() {
  return (
    <div className="container mx-auto px-4 pt-[120px] lg:pt-[190px] pb-16 space-y-10">
      <div className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Testimonials</p>
        <h1 className="text-4xl font-bold text-primary md:text-5xl">Trusted by families across India</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real experiences from customers who use Annavedah products in their daily routines.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {fiveStarTestimonials.map((testimonial) => (
          <div key={testimonial.name} className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col gap-3">
            {/* 5 gold stars */}
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="#c9a45c"
                  className="w-5 h-5"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed flex-1">"{testimonial.text}"</p>

            <div className="flex items-center gap-3 pt-2 border-t border-border">
              {/* Avatar placeholder with initials */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg, #8b1a1a, #c9a45c)' }}
              >
                {testimonial.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
