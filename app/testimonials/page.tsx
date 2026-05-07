'use client';

import { useEffect, useState } from 'react';
import { Loader2, Star, Quote, MapPin } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  text: string;
  rating: number;
  active: boolean;
  displayOrder: number;
  createdAt: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/testimonials')
      .then((res) => res.json())
      .then((data) => {
        if (data.testimonials) setTestimonials(data.testimonials);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf6f0] via-white to-[#faf6f0]">
      <div className="container mx-auto px-4 site-page-gap pb-16 space-y-12">
        {/* Hero Header */}
        <div className="relative text-center space-y-5">
          <div className="absolute inset-0 -top-8 pointer-events-none overflow-hidden">
            <div className="w-64 h-64 mx-auto rounded-full bg-[#c9a45c]/5 blur-3xl" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a45c]">
              ✦ Testimonials ✦
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2d1b15] font-serif leading-tight">
              Trusted by families<br className="hidden sm:block" /> across India
            </h1>
            <p className="text-lg text-[#6b5347] max-w-2xl mx-auto mt-4">
              Real experiences from customers who use Annavedah products in their daily routines.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#c9a45c]" />
            <p className="text-sm text-[#6b5347]">Loading testimonials...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && testimonials.length === 0 && (
          <div className="text-center py-20">
            <Quote className="w-16 h-16 text-[#e8ddd0] mx-auto mb-4" />
            <p className="text-lg text-[#6b5347]">No testimonials yet.</p>
            <p className="text-sm text-[#c9a45c] mt-2">Check back soon for customer reviews!</p>
          </div>
        )}

        {/* Testimonials Grid */}
        {!loading && testimonials.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <div
                key={testimonial.id}
                className="group relative rounded-3xl border border-[#e8ddd0] bg-white p-7 shadow-sm hover:shadow-lg hover:border-[#c9a45c]/30 transition-all duration-300 flex flex-col gap-4"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Decorative Quote */}
                <div className="absolute top-5 right-5 opacity-[0.06] pointer-events-none">
                  <Quote className="w-16 h-16 text-[#8b1a1a]" />
                </div>

                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 transition-colors ${
                        i < testimonial.rating
                          ? 'fill-[#c9a45c] text-[#c9a45c]'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Body */}
                <p className="text-sm text-[#2d1b15]/80 leading-relaxed flex-1 relative z-10">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-3 border-t border-[#e8ddd0]">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md"
                    style={{ background: 'linear-gradient(135deg, #8b1a1a, #c9a45c)' }}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2d1b15]">{testimonial.name}</p>
                    <p className="text-xs text-[#6b5347] flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
