'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X, User } from 'lucide-react'
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
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || !isHomePage
          ? 'bg-[#faf6f0]/95 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto flex h-20 items-center px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#c9a45c]/50 shadow-lg">
              <Image
                src="/Logo.jpg"
                alt="Annavedah Foods"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-xl font-bold tracking-wide ${isScrolled || !isHomePage ? 'text-[#8b1a1a]' : 'text-white'}`}>
                Annavedah Foods
              </h1>
              <p className={`text-xs font-medium ${isScrolled || !isHomePage ? 'text-[#8b1a1a]/70' : 'text-white/80'}`}>
                सात्विक • पौष्टिक • परिपूर्ण
              </p>
            </div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex gap-8 text-sm font-medium absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative transition-colors duration-300 hover:text-[#c9a45c] ${
                  isScrolled || !isHomePage ? 'text-[#2d1b15]' : 'text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <Link
              href="/dashboard"
              className={`relative p-2 rounded-full transition-colors ${
                isScrolled || !isHomePage ? 'hover:bg-[#8b1a1a]/10' : 'hover:bg-black/20'
              }`}
            >
              <User className={`w-6 h-6 ${isScrolled || !isHomePage ? 'text-[#8b1a1a]' : 'text-white'}`} />
            </Link>

            <button
              onClick={() => setShowCart(!showCart)}
              className={`relative p-2 rounded-full transition-colors ${
                isScrolled || !isHomePage ? 'hover:bg-[#8b1a1a]/10' : 'hover:bg-black/20'
              }`}
            >
              <ShoppingCart className={`w-6 h-6 ${isScrolled || !isHomePage ? 'text-[#8b1a1a]' : 'text-white'}`} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#c9a45c] text-[#2d1b15] rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>

            <button
              className={`md:hidden p-2 rounded-full transition-colors ${
                isScrolled || !isHomePage ? 'hover:bg-[#8b1a1a]/10' : 'hover:bg-black/20'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className={`w-6 h-6 ${isScrolled || !isHomePage ? 'text-[#8b1a1a]' : 'text-white'}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#faf6f0] border-t border-[#e8ddd0]">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="py-3 px-4 text-[#2d1b15] hover:text-[#8b1a1a] hover:bg-[#8b1a1a]/5 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl">
            <div className="p-6 border-b border-[#e8ddd0] flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#8b1a1a]">Your Cart</h3>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-[#f0e8dc] rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-auto max-h-[calc(100vh-200px)]">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-[#c9a45c]/50 mx-auto mb-4" />
                  <p className="text-[#6b5347]">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-[#f0e8dc]/50 rounded-xl">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                        <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
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
              <div className="p-6 border-t border-[#e8ddd0]">
                <div className="flex justify-between mb-4">
                  <span className="text-[#6b5347]">Subtotal</span>
                  <span className="text-xl font-bold text-[#8b1a1a]">₹{items.reduce((sum, item) => sum + item.product.price * item.qty, 0)}</span>
                </div>
                <Link href="/cart" className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white h-12 flex items-center justify-center text-lg rounded-xl">
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
