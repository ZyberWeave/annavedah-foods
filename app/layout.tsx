import React from 'react'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/components/cart-context'
import Header from '@/components/Header'
import FacebookPixel from '@/components/FacebookPixel'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Mail, Instagram, Facebook, MessageCircle, Globe } from 'lucide-react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Annavedah Foods | सात्विक, पौष्टिक आणि परिपूर्ण',
  description: 'Traditional nutrition brand offering pure farm-sourced grains, pulses, and premium dehydrated powders for holistic wellness. Pure, authentic, and nutrient-rich.',
  keywords: ['Annavedah', 'farm-sourced grains', 'pure pulses', 'dehydrated powders', 'moringa', 'turmeric', 'ashwagandha', 'millet', 'ragi', 'spinach', 'ayurvedic', 'pure foods'],
  authors: [{ name: 'Annavedah Foods' }],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/icon-light-32x32.png',
  },
  openGraph: {
    title: 'Annavedah Foods | Premium Traditional Nutrition',
    description: 'Discover the wisdom of ancient nutrition with our premium dehydrated powders and Ayurvedic blends.',
    type: 'website',
    locale: 'en_IN',
  },
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased overflow-x-hidden"
        style={{ fontFamily: "'Outfit', 'Cormorant Garamond', Georgia, serif" }}
      >
        <CartProvider>
          <Header />
          {children}
        </CartProvider>
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>
        <Analytics />

        {/* Footer */}
        <footer id="contact" className="bg-[#2d1b15] text-[#faf6f0] py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              {/* Brand */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#c9a45c]/30">
                    <Image
                      src="/Logo.webp"
                      alt="Annavedah Foods"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#c9a45c]">Annavedah</h3>
                    <p className="text-xs text-[#faf6f0]/60">Foods</p>
                  </div>
                </div>
                <p className="text-[#faf6f0]/70 text-sm leading-relaxed mb-6">
                  सात्विक, पौष्टिक आणि परिपूर्ण
                  <br />
                  Traditional nutrition for holistic wellness
                </p>
                <div className="flex gap-4">
                  <a href="https://www.instagram.com/annavedah.foods?igsh=Zmo5YXA0bzRlbHRm&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#faf6f0]/10 hover:bg-[#c9a45c] hover:text-[#2d1b15] flex items-center justify-center transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="https://www.facebook.com/share/1CnPV6U5Ta/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#faf6f0]/10 hover:bg-[#c9a45c] hover:text-[#2d1b15] flex items-center justify-center transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="https://share.google/7br1duJ7uIARO9cDi" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#faf6f0]/10 hover:bg-[#c9a45c] hover:text-[#2d1b15] flex items-center justify-center transition-colors">
                    <Globe className="w-5 h-5" />
                  </a>
                  <a href="https://wa.me/message/WPQ6RK3USIF2M1" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#faf6f0]/10 hover:bg-[#c9a45c] hover:text-[#2d1b15] flex items-center justify-center transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Products */}
              <div>
                <h4 className="font-bold text-[#c9a45c] mb-6 text-lg">Products</h4>
                <ul className="space-y-3 text-sm text-[#faf6f0]/70">
                  {['Vegetable Powders', 'Greens & Superfoods', 'Functional Mixes', 'Heritage Grains'].map((item) => (
                    <li key={item}>
                      <a href="/products" className="hover:text-[#c9a45c] transition-colors">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="font-bold text-[#c9a45c] mb-6 text-lg">Company</h4>
                <ul className="space-y-3 text-sm text-[#faf6f0]/70">
                  {['About Us', 'Our Story', 'Sustainability', 'Careers'].map((item) => (
                    <li key={item}>
                      <a href="/heritage" className="hover:text-[#c9a45c] transition-colors">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-bold text-[#c9a45c] mb-6 text-lg">Contact Us</h4>
                <ul className="space-y-4 text-sm text-[#faf6f0]/70">
                  <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#c9a45c] flex-shrink-0 mt-0.5" />
                    <span>Maharashtra, India</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#c9a45c] flex-shrink-0" />
                    <span>+91 97634 56100</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#c9a45c] flex-shrink-0" />
                    <span>hello@annavedah.com</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-[#faf6f0]/10 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#faf6f0]/60">
                <p>© 2026 Annavedah Foods. All rights reserved.</p>
                <div className="flex gap-6">
                  <Link href="/privacy" className="hover:text-[#c9a45c] transition-colors">Privacy Policy</Link>
                  <Link href="/terms" className="hover:text-[#c9a45c] transition-colors">Terms & Conditions</Link>
                  <Link href="/shipping" className="hover:text-[#c9a45c] transition-colors">Shipping Policy</Link>
                  <Link href="/returns" className="hover:text-[#c9a45c] transition-colors">Cancellation, Return & Refund Policy</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}

