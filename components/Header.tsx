'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X, User, Search } from 'lucide-react'
import { useCart } from '@/components/cart-context'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Heritage', href: '/heritage' },
  { label: 'Commitment', href: '/commitment' },
  { label: 'Benefits', href: '/benefits' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  { label: 'Cart', href: '/cart' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { count, items, remove, total } = useCart()
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-[#8b1a1a] text-white">
        <div className="container mx-auto px-4 h-9 flex items-center justify-between text-[10px] tracking-widest uppercase font-semibold">
          {/* Marathi Tagline */}
          <span className="hidden sm:block text-[#f5e6c8] font-medium tracking-[0.18em]">
            सात्त्विक&nbsp;|&nbsp;पौष्टिक&nbsp;|&nbsp;परिपूर्ण&nbsp;|&nbsp;प्राकृतिक
          </span>
          <span className="sm:hidden text-[#f5e6c8] font-medium tracking-[0.12em] text-[9px]">
            सात्त्विक · पौष्टिक · परिपूर्ण · प्राकृतिक
          </span>
          {/* Phone Number */}
          <a
            href="tel:+919763456100"
            className="flex items-center gap-1.5 text-[#f5e6c8] hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
            </svg>
            +91 97634 56100
          </a>
        </div>
      </div>

      <header 
        className="fixed top-9 left-0 right-0 z-50 transition-all duration-500 flex flex-col bg-[#faf6f0]/95 backdrop-blur-lg shadow-lg"
      >
        
        {/* Top Tier: Utilities, Logo, Actions */}
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            
            {/* Left: Mobile Menu Toggle / Desktop Secondary Links */}
            <div className="flex-1 flex items-center justify-start gap-6">
              {/* Mobile Hamburger */}
              <button
                className="lg:hidden p-2 -ml-2 rounded-full transition-colors hover:bg-[#8b1a1a]/10"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6 text-[#8b1a1a]" />
              </button>

              {/* Desktop Secondary Links */}
              <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold tracking-[0.15em] uppercase">
                <Link 
                  href="/heritage" 
                  className="transition-colors duration-300 hover:text-[#c9a45c] text-[#2d1b15]"
                >
                  Heritage
                </Link>
                <Link 
                  href="/contact" 
                  className="transition-colors duration-300 hover:text-[#c9a45c] text-[#2d1b15]"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Center: Logo */}
            <div className="flex-1 flex justify-center">
              <Link href="/" className="flex items-center gap-3">
                <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden border-2 border-[#c9a45c]/50 shadow-lg">
                  <Image
                    src="/Logo.webp"
                    alt="Annavedah Foods"
                    fill
                    sizes="56px"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="hidden sm:block text-center">
                  <h1 className="text-xl lg:text-2xl font-bold tracking-widest uppercase text-[#8b1a1a]">
                    Annavedah
                  </h1>
                </div>
              </Link>
            </div>

            {/* Right: Search, User, Cart */}
            <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4 lg:gap-6">
              
              {/* Desktop Search */}
              <div className="hidden lg:flex items-center relative group">
                <input 
                  type="text" 
                  placeholder="SEARCH" 
                  className="w-32 xl:w-48 pl-10 pr-4 py-2 rounded-full border text-[10px] font-bold tracking-[0.1em] uppercase transition-all duration-300 focus:outline-none focus:w-64 bg-transparent border-[#e8ddd0] text-[#2d1b15] focus:border-[#c9a45c]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      window.location.href = `/products?search=${e.currentTarget.value}`
                    }
                  }}
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2d1b15]" />
              </div>

              {/* Mobile Search Icon */}
              <Link
                href="/products"
                className="lg:hidden relative p-2 rounded-full transition-colors hover:bg-[#8b1a1a]/10"
              >
                <Search className="w-5 h-5 text-[#8b1a1a]" />
              </Link>

              {/* Desktop User */}
              <Link
                href={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
                className="hidden lg:flex items-center gap-2 p-2 rounded-full transition-colors hover:text-[#c9a45c] text-[#2d1b15]"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Mobile User */}
              <Link
                href={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
                className="lg:hidden relative p-2 rounded-full transition-colors hover:bg-[#8b1a1a]/10"
              >
                <User className="w-5 h-5 text-[#8b1a1a]" />
              </Link>

              {/* Cart */}
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative p-2 rounded-full transition-colors hover:text-[#c9a45c] text-[#2d1b15] hover:bg-[#8b1a1a]/10"
              >
                <ShoppingCart className="w-5 h-5 lg:w-5 lg:h-5" />
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
        <div className="hidden lg:block border-t border-[#e8ddd0] transition-colors duration-500">
          <div className="container mx-auto px-4">
            <nav className="flex justify-center items-center h-14 gap-12 text-[11px] font-bold tracking-[0.2em] uppercase">
              {navItems.filter(item => !['Heritage', 'Contact', 'Cart'].includes(item.label)).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative py-2 transition-colors duration-300 hover:text-[#c9a45c] group text-[#2d1b15]"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#c9a45c] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-[#faf6f0] animate-in slide-in-from-right-full duration-300 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[#e8ddd0]">
            <Link href="/" className="flex items-center gap-3">
               <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#c9a45c]/50">
                  <Image src="/Logo.webp" alt="Annavedah Foods" fill sizes="40px" className="object-cover" priority />
               </div>
               <span className="text-lg font-bold text-[#8b1a1a] uppercase tracking-widest">Annavedah</span>
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-[#f0e8dc] rounded-full text-[#8b1a1a]">
               <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-4 px-4 text-[#2d1b15] text-lg font-bold uppercase tracking-wider hover:text-[#8b1a1a] hover:bg-[#c9a45c]/10 rounded-xl transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="h-px bg-[#e8ddd0] my-4"></div>
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

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="p-6 border-b border-[#e8ddd0] flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#8b1a1a]">Your Cart</h3>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-[#f0e8dc] rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-auto">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-[#c9a45c]/50 mx-auto mb-4" />
                  <p className="text-[#6b5347]">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-[#f0e8dc]/50 rounded-xl">
                      <div className="relative w-20 h-20 rounded-lg bg-[url('/product-bg.webp')] bg-cover bg-center overflow-hidden shadow-inner">
                        <Image src={item.product.image} alt={item.product.name} fill sizes="80px" className="object-contain p-2 drop-shadow-md" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#2d1b15]">
                          {item.product.name} {item.selectedPack && `(${item.selectedPack.size})`}
                        </h4>
                        {item.product.nameHindi !== item.product.name && (
                          <p className="text-sm text-[#6b5347]">{item.product.nameHindi}</p>
                        )}
                        <p className="text-[#8b1a1a] font-bold mt-1">₹{item.selectedPack ? item.selectedPack.price : item.product.price} x {item.qty}</p>
                      </div>
                      <button
                        onClick={() => remove(item.product.id, item.selectedPack?.size)}
                        className="p-2 hover:bg-red-50 rounded-full transition-colors h-fit"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-[#e8ddd0] bg-white">
                <div className="flex justify-between mb-4">
                  <span className="text-[#6b5347]">Subtotal</span>
                  <span className="text-xl font-bold text-[#8b1a1a]">₹{total}</span>
                </div>
                <Link href="/cart" onClick={() => setShowCart(false)} className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white h-12 flex items-center justify-center text-lg rounded-xl transition-colors">
                  View Cart
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
