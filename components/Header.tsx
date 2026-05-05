'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X, User, Search, Heart } from 'lucide-react'
import { useCart } from '@/components/cart-context'
import { useWishlist } from '@/components/wishlist-context'
import AnnouncementBar from '@/components/AnnouncementBar'
import MegaMenu from '@/components/MegaMenu'
import SearchOverlay from '@/components/SearchOverlay'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Heritage', href: '/heritage' },
  { label: 'Commitment', href: '/commitment' },
  { label: 'Benefits', href: '/benefits' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

const mobileNavItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Heritage', href: '/heritage' },
  { label: 'Commitment', href: '/commitment' },
  { label: 'Benefits', href: '/benefits' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  { label: 'Cart', href: '/cart' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { count, openCart } = useCart()
  const { count: wishlistCount } = useWishlist()
  const pathname = usePathname()

  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  return (
    <>
      <AnnouncementBar />

      <header className="fixed top-9 left-0 right-0 z-50 transition-all duration-500 flex flex-col bg-[#faf6f0]/95 backdrop-blur-lg shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">

            {/* Left */}
            <div className="flex-1 flex items-center justify-start gap-6">
              <button
                className="lg:hidden p-2 -ml-2 rounded-full transition-colors hover:bg-[#8b1a1a]/10"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 text-[#8b1a1a]" />
              </button>

              <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold tracking-[0.15em] uppercase">
                <Link href="/heritage" className="transition-colors duration-300 hover:text-[#c9a45c] text-[#2d1b15]">
                  Heritage
                </Link>
                <Link href="/contact" className="transition-colors duration-300 hover:text-[#c9a45c] text-[#2d1b15]">
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Center: Logo */}
            <div className="flex-1 flex justify-center">
              <Link href="/" className="flex items-center gap-3">
                <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden border-2 border-[#c9a45c]/50 shadow-lg">
                  <Image src="/Logo.webp" alt="Annavedah Foods" fill sizes="56px" className="object-cover" priority />
                </div>
                <div className="hidden sm:block text-center">
                  <h1 className="text-xl lg:text-2xl font-bold tracking-widest uppercase text-[#8b1a1a]">Annavedah</h1>
                </div>
              </Link>
            </div>

            {/* Right */}
            <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3 lg:gap-4">

              <button
                onClick={() => setSearchOpen(true)}
                className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold tracking-[0.1em] uppercase transition-all duration-300 bg-transparent border-[#e8ddd0] text-[#6b5347] hover:border-[#c9a45c] hover:text-[#2d1b15] w-32 xl:w-48"
                aria-label="Search products"
              >
                <Search className="w-4 h-4 flex-shrink-0" />
                <span>Search</span>
              </button>

              <button
                onClick={() => setSearchOpen(true)}
                className="lg:hidden relative p-2 rounded-full transition-colors hover:bg-[#8b1a1a]/10"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-[#8b1a1a]" />
              </button>

              <Link
                href="/wishlist"
                className="relative p-2 rounded-full transition-colors hover:text-[#c9a45c] text-[#2d1b15] hover:bg-[#8b1a1a]/10"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#c9a45c] text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-bold ring-2 ring-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
                className="relative p-2 rounded-full transition-colors hover:text-[#c9a45c] text-[#2d1b15] hover:bg-[#8b1a1a]/10"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>

              <button
                onClick={openCart}
                className="relative p-2 rounded-full transition-colors hover:text-[#c9a45c] text-[#2d1b15] hover:bg-[#8b1a1a]/10"
                aria-label="Open cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#8b1a1a] text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-bold ring-2 ring-white">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Tier: Main Navigation (Desktop Only) */}
        <div className="hidden lg:block border-t border-[#e8ddd0]">
          <div className="container mx-auto px-4">
            <nav className="flex justify-center items-center h-14 gap-12 text-[11px] font-bold tracking-[0.2em] uppercase">
              <Link href="/" className="relative py-2 transition-colors duration-300 hover:text-[#c9a45c] group text-[#2d1b15]">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#c9a45c] transition-all duration-300 group-hover:w-full" />
              </Link>
              <MegaMenu />
              {navItems.filter((i) => i.label !== 'Home' && i.label !== 'Heritage' && i.label !== 'Contact').map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative py-2 transition-colors duration-300 hover:text-[#c9a45c] group text-[#2d1b15]"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#c9a45c] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[70] bg-[#faf6f0] animate-in slide-in-from-right-full duration-300 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[#e8ddd0]">
            <Link href="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#c9a45c]/50">
                <Image src="/Logo.webp" alt="Annavedah Foods" fill sizes="40px" className="object-cover" priority />
              </div>
              <span className="text-lg font-bold text-[#8b1a1a] uppercase tracking-widest">Annavedah</span>
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-[#f0e8dc] rounded-full text-[#8b1a1a]" aria-label="Close menu">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
            {mobileNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-4 px-4 text-[#2d1b15] text-lg font-bold uppercase tracking-wider hover:text-[#8b1a1a] hover:bg-[#c9a45c]/10 rounded-xl transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <div className="h-px bg-[#e8ddd0] my-4" />
            {user ? (
              <>
                <Link
                  href={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="py-4 px-4 text-[#2d1b15] text-lg font-bold uppercase tracking-wider hover:text-[#8b1a1a] hover:bg-[#c9a45c]/10 rounded-xl transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {user.role === 'admin' ? 'Admin Portal' : 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left py-4 px-4 text-[#2d1b15] text-lg font-bold uppercase tracking-wider hover:text-[#8b1a1a] hover:bg-[#c9a45c]/10 rounded-xl transition-all"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="py-4 px-4 text-[#2d1b15] text-lg font-bold uppercase tracking-wider hover:text-[#8b1a1a] hover:bg-[#c9a45c]/10 rounded-xl transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="py-4 px-4 text-[#2d1b15] text-lg font-bold uppercase tracking-wider hover:text-[#8b1a1a] hover:bg-[#c9a45c]/10 rounded-xl transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  )
}
