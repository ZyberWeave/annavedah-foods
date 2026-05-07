'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X, User, Search, Heart, LogOut, ChevronDown, LayoutDashboard, Package } from 'lucide-react'
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
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)
  const headerShellRef = useRef<HTMLDivElement>(null)
  const { count, openCart } = useCart()
  const { count: wishlistCount } = useWishlist()
  const pathname = usePathname()

  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user)
        else setUser(null)
      })
      .catch(() => setUser(null))
  }, [pathname])

  useEffect(() => {
    setMobileMenuOpen(false)
    setAccountDropdownOpen(false)
  }, [pathname])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const headerShell = headerShellRef.current
    if (!headerShell) return

    const updateHeaderOffset = () => {
      const { height } = headerShell.getBoundingClientRect()
      document.documentElement.style.setProperty('--site-header-offset', `${Math.ceil(height)}px`)
    }

    updateHeaderOffset()

    const resizeObserver = new ResizeObserver(updateHeaderOffset)
    resizeObserver.observe(headerShell)
    window.addEventListener('resize', updateHeaderOffset)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateHeaderOffset)
    }
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.dispatchEvent(new Event('auth-changed'))
    window.location.href = '/'
  }

  return (
    <>
      <div ref={headerShellRef} className="fixed inset-x-0 top-0 z-[60]">
        <AnnouncementBar />

        <header
          className="transition-all duration-500 flex flex-col backdrop-blur-lg shadow-lg relative"
          style={{
            background:
              'linear-gradient(180deg,#fbf6ec 0%, #f7efdf 55%, #f3e7ce 100%)',
            borderTop: '1px solid rgba(201,164,92,0.55)',
            borderBottom: '1px solid rgba(201,164,92,0.35)',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.6) inset, 0 -1px 0 rgba(139,26,26,0.08) inset, 0 10px 28px -16px rgba(45,27,21,0.35)',
          }}
        >
          {/* Ornamental gold hairline */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, #c9a45c 20%, #e6c884 50%, #c9a45c 80%, transparent 100%)',
            }}
          />

          <div className="container mx-auto px-4">
            <div className="flex h-24 lg:h-28 items-center justify-between">

              {/* Left */}
              <div className="flex-1 flex items-center justify-start gap-6">
                <button
                  className="lg:hidden p-2 -ml-2 rounded-full transition-colors hover:bg-[#8b1a1a]/10"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6 text-[#8b1a1a]" />
                </button>

                <div
                  className="hidden lg:flex items-center gap-8 text-[11px] tracking-[0.32em] uppercase"
                  style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif", fontWeight: 600 }}
                >
                  <Link href="/heritage" className={`transition-colors duration-300 hover:text-[#c9a45c] ${pathname === '/heritage' ? 'text-[#c9a45c]' : 'text-[#2d1b15]'}`}>
                    Heritage
                  </Link>
                  <span aria-hidden className="text-[#c9a45c] text-xs">✦</span>
                  <Link href="/contact" className={`transition-colors duration-300 hover:text-[#c9a45c] ${pathname === '/contact' ? 'text-[#c9a45c]' : 'text-[#2d1b15]'}`}>
                    Contact
                  </Link>
                </div>
              </div>

              {/* Center: Royal brand mark */}
              <div className="flex-1 flex justify-center">
                <Link href="/" className="group flex items-center gap-3 sm:gap-5">
                  {/* Left ornament */}
                  <span
                    aria-hidden
                    className="hidden sm:flex items-center gap-2 text-[#c9a45c] select-none"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    <span className="block h-px w-8 lg:w-12" style={{ background: 'linear-gradient(90deg, transparent, #c9a45c)' }} />
                    <span className="text-base leading-none">❦</span>
                  </span>

                  {/* Logo medallion: double gold ring */}
                  <span
                    className="relative inline-flex items-center justify-center rounded-full p-[3px] shadow-[0_4px_18px_-6px_rgba(139,26,26,0.45)]"
                    style={{
                      background:
                        'conic-gradient(from 210deg, #d8b46a, #f4dba0, #b88a3f, #efd393, #c9a45c, #d8b46a)',
                    }}
                  >
                    <span
                      className="relative block rounded-full overflow-hidden ring-1 ring-[#8b1a1a]/20"
                      style={{ width: 56, height: 56, background: '#faf6f0' }}
                    >
                      <Image
                        src="/Logo.webp"
                        alt="Annavedah Foods"
                        fill
                        sizes="56px"
                        className="object-cover"
                        priority
                      />
                    </span>
                  </span>

                  {/* Wordmark */}
                  <div className="hidden sm:block text-center leading-none">
                    <div
                      className="text-[10px] tracking-[0.45em] uppercase text-[#c9a45c]"
                      style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif", fontWeight: 600 }}
                    >
                      ✦  Est. Heritage  ✦
                    </div>
                    <h1
                      className="mt-1.5 whitespace-nowrap text-[20px] lg:text-[28px] tracking-[0.22em] uppercase"
                      style={{
                        fontFamily: "'Cinzel', 'Cormorant Garamond', serif",
                        fontWeight: 700,
                        color: '#6d1414',
                        textShadow: '0 1px 0 rgba(255,255,255,0.55), 0 2px 4px rgba(109,20,20,0.18)',
                      }}
                    >
                      Annavedah <span style={{ color: '#c9a45c' }}>Foods</span>
                    </h1>
                    <div
                      className="mt-2 text-[10px] lg:text-[11px] italic tracking-[0.18em] text-[#6b5347] whitespace-nowrap"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      अन्नवेद &middot; सात्विक · पौष्टिक · परिपूर्ण
                    </div>
                  </div>

                  {/* Right ornament */}
                  <span
                    aria-hidden
                    className="hidden sm:flex items-center gap-2 text-[#c9a45c] select-none"
                  >
                    <span className="text-base leading-none">❦</span>
                    <span className="block h-px w-8 lg:w-12" style={{ background: 'linear-gradient(90deg, #c9a45c, transparent)' }} />
                  </span>
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

                {/* Account Button / Dropdown */}
                <div className="relative" ref={accountRef}>
                  {user ? (
                    <button
                      onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                      className="relative flex items-center gap-1.5 p-2 rounded-full transition-colors hover:text-[#c9a45c] text-[#2d1b15] hover:bg-[#8b1a1a]/10"
                      aria-label="Account menu"
                      aria-expanded={accountDropdownOpen}
                    >
                      <span className="w-7 h-7 rounded-full bg-[#8b1a1a] text-white flex items-center justify-center text-[11px] font-bold uppercase leading-none">
                        {user.name?.charAt(0) || 'U'}
                      </span>
                      <span className="hidden sm:inline text-[11px] font-bold tracking-wide uppercase text-[#2d1b15] max-w-[80px] truncate">
                        {user.name?.split(' ')[0]}
                      </span>
                      <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-[#6b5347] transition-transform duration-200 ${accountDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="relative p-2 rounded-full transition-colors hover:text-[#c9a45c] text-[#2d1b15] hover:bg-[#8b1a1a]/10"
                      aria-label="Log in"
                    >
                      <User className="w-5 h-5" />
                    </Link>
                  )}

                  {/* Account Dropdown */}
                  {accountDropdownOpen && user && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-[#e8ddd0] shadow-2xl py-2 z-[80] animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-[#e8ddd0]">
                        <p className="text-sm font-bold text-[#2d1b15] truncate">{user.name}</p>
                        <p className="text-xs text-[#6b5347] truncate">{user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2d1b15] hover:bg-[#c9a45c]/10 transition-colors"
                          onClick={() => setAccountDropdownOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#8b1a1a]" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard?tab=orders"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2d1b15] hover:bg-[#c9a45c]/10 transition-colors"
                          onClick={() => setAccountDropdownOpen(false)}
                        >
                          <Package className="w-4 h-4 text-[#8b1a1a]" />
                          My Orders
                        </Link>
                        <Link
                          href="/wishlist"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2d1b15] hover:bg-[#c9a45c]/10 transition-colors"
                          onClick={() => setAccountDropdownOpen(false)}
                        >
                          <Heart className="w-4 h-4 text-[#8b1a1a]" />
                          Wishlist
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-[#e8ddd0] pt-1">
                        <button
                          onClick={() => { setAccountDropdownOpen(false); handleLogout(); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

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
          <div className="hidden lg:block relative">
            {/* Gold double-rule with center diamond */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,164,92,0.55) 25%, #c9a45c 50%, rgba(201,164,92,0.55) 75%, transparent 100%)' }}
            />
            <div
              aria-hidden
              className="absolute inset-x-0 top-[3px] h-px"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,164,92,0.25) 30%, rgba(201,164,92,0.5) 50%, rgba(201,164,92,0.25) 70%, transparent 100%)' }}
            />
            <div
              aria-hidden
              className="absolute left-1/2 -translate-x-1/2 top-[-5px] w-2.5 h-2.5 rotate-45"
              style={{
                background: 'linear-gradient(135deg, #efd393, #c9a45c)',
                boxShadow: '0 0 0 2px #fbf6ec, 0 1px 4px rgba(109,20,20,0.35)',
              }}
            />
            <div className="container mx-auto px-4">
              <nav
                className="flex justify-center items-center h-14 gap-10 xl:gap-14 text-[12px] tracking-[0.32em] uppercase"
                style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif", fontWeight: 600 }}
              >
                <Link href="/" className={`relative py-2 transition-colors duration-300 hover:text-[#c9a45c] group ${pathname === '/' ? 'text-[#c9a45c]' : 'text-[#2d1b15]'}`}>
                  Home
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-[#c9a45c] transition-all duration-300 ${pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
                <MegaMenu />
                {navItems.filter((i) => i.label !== 'Home' && i.label !== 'Heritage' && i.label !== 'Contact').map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative py-2 transition-colors duration-300 hover:text-[#c9a45c] group ${isActive ? 'text-[#c9a45c]' : 'text-[#2d1b15]'}`}
                    >
                      {item.label}
                      <span className={`absolute bottom-0 left-0 h-0.5 bg-[#c9a45c] transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[70] bg-[#faf6f0] animate-in slide-in-from-right-full duration-300 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[#e8ddd0]">
            <Link href="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#c9a45c]/50">
                <Image src="/Logo.webp" alt="Annavedah Foods" fill sizes="40px" className="object-cover" priority />
              </div>
              <span
                className="text-lg uppercase tracking-[0.2em]"
                style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif", fontWeight: 700, color: '#6d1414' }}
              >
                Annavedah <span style={{ color: '#c9a45c' }}>Foods</span>
              </span>
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-[#f0e8dc] rounded-full text-[#8b1a1a]" aria-label="Close menu">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
            {mobileNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-4 px-4 text-lg font-bold uppercase tracking-wider rounded-xl transition-all ${
                    isActive
                      ? 'text-[#8b1a1a] bg-[#c9a45c]/15 border-l-4 border-[#c9a45c]'
                      : 'text-[#2d1b15] hover:text-[#8b1a1a] hover:bg-[#c9a45c]/10'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            })}

            <div className="h-px bg-[#e8ddd0] my-4" />
            {user ? (
              <>
                <div className="px-4 py-3 mb-2 rounded-xl bg-[#c9a45c]/10">
                  <span className="text-sm font-bold text-[#8b1a1a]">Hi, {user.name?.split(' ')[0] || 'User'} 👋</span>
                </div>
                <Link
                  href="/dashboard"
                  className="py-4 px-4 text-[#2d1b15] text-lg font-bold uppercase tracking-wider hover:text-[#8b1a1a] hover:bg-[#c9a45c]/10 rounded-xl transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
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
