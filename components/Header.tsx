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
  const { count, items, remove } = useCart()
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex flex-col ${
        isScrolled || !isHomePage
          ? 'bg-[#faf6f0]/95 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      }`}>
        
        {/* Top Tier: Utilities, Logo, Actions */}
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            
            {/* Left: Mobile Menu Toggle / Desktop Secondary Links */}
            <div className="flex-1 flex items-center justify-start gap-6">
              {/* Mobile Hamburger */}
              <button
                className={`lg:hidden p-2 -ml-2 rounded-full transition-colors ${
                  isScrolled || !isHomePage ? 'hover:bg-[#8b1a1a]/10' : 'hover:bg-black/20'
                }`}
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className={`w-6 h-6 ${isScrolled || !isHomePage ? 'text-[#8b1a1a]' : 'text-white'}`} />
              </button>

              {/* Desktop Secondary Links */}
              <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold tracking-[0.15em] uppercase">
                <Link 
                  href="/heritage" 
                  className={`transition-colors duration-300 hover:text-[#c9a45c] ${
                    isScrolled || !isHomePage ? 'text-[#2d1b15]' : 'text-white'
                  }`}
                >
                  Heritage
                </Link>
                <Link 
                  href="/contact" 
                  className={`transition-colors duration-300 hover:text-[#c9a45c] ${
                    isScrolled || !isHomePage ? 'text-[#2d1b15]' : 'text-white'
                  }`}
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
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="hidden sm:block text-center">
                  <h1 className={`text-xl lg:text-2xl font-bold tracking-widest uppercase ${
                    isScrolled || !isHomePage ? 'text-[#8b1a1a]' : 'text-white'
                  }`}>
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
                  className={`w-32 xl:w-48 pl-10 pr-4 py-2 rounded-full border text-[10px] font-bold tracking-[0.1em] uppercase transition-all duration-300 focus:outline-none focus:w-64 ${
                    isScrolled || !isHomePage 
                      ? 'bg-transparent border-[#e8ddd0] text-[#2d1b15] focus:border-[#c9a45c]' 
                      : 'bg-white/10 border-white/30 text-white placeholder-white/80 focus:bg-white/20 focus:border-white/60'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      window.location.href = `/products?search=${e.currentTarget.value}`
                    }
                  }}
                />
                <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isScrolled || !isHomePage ? 'text-[#2d1b15]' : 'text-white'
                }`} />
              </div>

              {/* Mobile Search Icon */}
              <Link
                href="/products"
                className={`lg:hidden relative p-2 rounded-full transition-colors ${
                  isScrolled || !isHomePage ? 'hover:bg-[#8b1a1a]/10' : 'hover:bg-black/20'
                }`}
              >
                <Search className={`w-5 h-5 ${isScrolled || !isHomePage ? 'text-[#8b1a1a]' : 'text-white'}`} />
              </Link>

              {/* Desktop User */}
              <Link
                href="/login"
                className={`hidden lg:flex items-center gap-2 p-2 rounded-full transition-colors hover:text-[#c9a45c] ${
                  isScrolled || !isHomePage ? 'text-[#2d1b15]' : 'text-white'
                }`}
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Mobile User */}
              <Link
                href="/login"
                className={`lg:hidden relative p-2 rounded-full transition-colors ${
                  isScrolled || !isHomePage ? 'hover:bg-[#8b1a1a]/10' : 'hover:bg-black/20'
                }`}
              >
                <User className={`w-5 h-5 ${isScrolled || !isHomePage ? 'text-[#8b1a1a]' : 'text-white'}`} />
              </Link>

              {/* Cart */}
              <button
                onClick={() => setShowCart(!showCart)}
                className={`relative p-2 rounded-full transition-colors hover:text-[#c9a45c] ${
                  isScrolled || !isHomePage ? 'text-[#2d1b15]' : 'text-white'
                } ${isScrolled || !isHomePage ? 'hover:bg-[#8b1a1a]/10' : 'hover:bg-black/20 lg:hover:bg-transparent'}`}
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
        <div className={`hidden lg:block border-t transition-colors duration-500 ${
          isScrolled || !isHomePage ? 'border-[#e8ddd0]' : 'border-white/20'
        }`}>
          <div className="container mx-auto px-4">
            <nav className="flex justify-center items-center h-14 gap-12 text-[11px] font-bold tracking-[0.2em] uppercase">
              {navItems.filter(item => !['Heritage', 'Contact', 'Cart'].includes(item.label)).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-2 transition-colors duration-300 hover:text-[#c9a45c] group ${
                    isScrolled || !isHomePage ? 'text-[#2d1b15]' : 'text-white'
                  }`}
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
                  <Image src="/Logo.webp" alt="Annavedah Foods" fill className="object-cover" priority />
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
                        <Image src={item.product.image} alt={item.product.name} fill className="object-contain p-2 drop-shadow-md" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#2d1b15]">{item.product.name}</h4>
                        {item.product.nameHindi !== item.product.name && (
                          <p className="text-sm text-[#6b5347]">{item.product.nameHindi}</p>
                        )}
                        <p className="text-[#8b1a1a] font-bold mt-1">₹{item.product.price} x {item.qty}</p>
                      </div>
                      <button
                        onClick={() => remove(item.product.id)}
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
                  <span className="text-xl font-bold text-[#8b1a1a]">₹{items.reduce((sum, item) => sum + item.product.price * item.qty, 0)}</span>
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
