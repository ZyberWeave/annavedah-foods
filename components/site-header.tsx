'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/components/cart-context'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/gifting', label: 'Gifting & Hampers' },
  { href: '/heritage', label: 'Heritage' },
  { href: '/benefits', label: 'Benefits' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { count } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-primary tracking-wide">
          Annavedah Foods
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-foreground/80 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${active ? 'text-primary' : 'hover:text-primary'}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <Link
          href="/products"
          className="rounded-full border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Shop Now
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
            Login
          </Link>
          <Link
            href="/cart"
            className="rounded-full border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Cart ({count})
          </Link>
        </div>
      </div>
    </header>
  )
}
