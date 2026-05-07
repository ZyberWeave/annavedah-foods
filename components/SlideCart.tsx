'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ShoppingCart, Plus, Minus, Trash2, ShieldCheck, Truck, Tag } from 'lucide-react'
import { useCart, CART_LIMIT } from '@/components/cart-context'
import { products } from '@/lib/content'

const FREE_SHIPPING_THRESHOLD = 999

export default function SlideCart() {
  const { items, isOpen, closeCart, total, count, remove, updateQty, add, changePack, appliedCoupon, isFull } = useCart()

  const upsells = useMemo(() => {
    const inCart = new Set(items.map((i) => i.product.id))
    return products
      .filter((p) => p.price > 0 && !inCart.has(p.id) && (p.badge === 'Bestseller' || p.badge === 'Popular' || p.badge === 'New'))
      .slice(0, 6)
  }, [items])

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total)
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <div
      className={`fixed inset-0 z-[80] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeCart}
      />
      <aside
        className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="px-6 py-5 border-b border-[#e8ddd0] flex items-center justify-between bg-[#faf6f0]">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-[#8b1a1a]" />
            <h3 className="text-lg font-bold text-[#8b1a1a] uppercase tracking-wider">
              Cart {count > 0 && <span className="text-[#6b5347] font-medium">({count})</span>}
            </h3>
            {items.length > 0 && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isFull ? 'bg-red-100 text-red-700' : items.length >= CART_LIMIT - 2 ? 'bg-amber-100 text-amber-700' : 'bg-[#f0e8dc] text-[#6b5347]'
              }`}>
                {items.length}/{CART_LIMIT}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-[#f0e8dc] rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-[#2d1b15]" />
          </button>
        </div>

        {items.length > 0 && (
          <div className="px-6 py-4 border-b border-[#e8ddd0] bg-[#faf6f0]/40">
            {remaining > 0 ? (
              <p className="text-xs text-[#6b5347] mb-2">
                Add <span className="font-bold text-[#8b1a1a]">₹{remaining}</span> more for{' '}
                <span className="font-semibold">FREE shipping</span>
              </p>
            ) : (
              <p className="text-xs text-green-700 font-semibold mb-2 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> You've unlocked free shipping!
              </p>
            )}
            <div className="h-1.5 w-full bg-[#e8ddd0] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#c9a45c] to-[#8b1a1a] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#f0e8dc] flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 text-[#c9a45c]" />
              </div>
              <p className="text-lg font-semibold text-[#2d1b15]">Your cart is empty</p>
              <p className="text-sm text-[#6b5347] mt-1 mb-6">Discover our nutrient-rich essentials.</p>
              <Link
                href="/products"
                onClick={closeCart}
                className="inline-block px-6 py-3 bg-[#8b1a1a] hover:bg-[#6d1414] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-colors"
              >
                Shop Products
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#e8ddd0]">
              {items.map((item, idx) => {
                const unitPrice = item.selectedPack ? item.selectedPack.price : item.product.price
                return (
                  <li key={`${item.product.id}-${item.selectedPack?.size ?? 'std'}-${idx}`} className="px-6 py-4 flex gap-4">
                    <Link
                      href={`/products/${item.product.slug}`}
                      onClick={closeCart}
                      className="relative w-20 h-20 rounded-lg bg-[url('/product-bg.webp')] bg-cover bg-center overflow-hidden shadow-inner flex-shrink-0"
                    >
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-contain p-2 drop-shadow-md"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        onClick={closeCart}
                        className="font-semibold text-[#2d1b15] hover:text-[#8b1a1a] text-sm line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      {item.product.packPrices.length > 1 ? (
                        <select
                          value={item.selectedPack?.size ?? ''}
                          onChange={(e) => {
                            const pack = item.product.packPrices.find((pp) => pp.size === e.target.value)
                            if (pack) changePack(item.product.id, item.selectedPack?.size, { size: pack.size, price: pack.price })
                          }}
                          className="mt-1 text-xs border border-[#e8ddd0] rounded-md px-2 py-1 bg-white text-[#2d1b15] focus:outline-none focus:border-[#c9a45c]"
                          aria-label="Change pack size"
                        >
                          {item.product.packPrices.map((pp) => (
                            <option key={pp.size} value={pp.size}>{pp.size} — ₹{pp.price}</option>
                          ))}
                        </select>
                      ) : item.selectedPack ? (
                        <p className="text-xs text-[#6b5347] mt-1">{item.selectedPack.size}</p>
                      ) : null}
                      <p className="text-[#8b1a1a] font-bold text-sm mt-1">₹{unitPrice * item.qty}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-[#e8ddd0] rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQty(item.product.id, item.selectedPack?.size, item.qty - 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-[#f0e8dc] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 text-[#2d1b15]" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-[#2d1b15]">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.product.id, item.selectedPack?.size, item.qty + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-[#f0e8dc] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 text-[#2d1b15]" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(item.product.id, item.selectedPack?.size)}
                          className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {items.length > 0 && upsells.length > 0 && (
            <div className="px-6 py-5 border-t border-[#e8ddd0] bg-[#faf6f0]/30">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#6b5347] mb-3">You might also like</h4>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 snap-x">
                {upsells.map((p) => {
                  const firstPack = p.packPrices[0]
                  return (
                    <div
                      key={p.id}
                      className="flex-shrink-0 w-32 snap-start bg-white border border-[#e8ddd0] rounded-xl overflow-hidden hover:border-[#c9a45c] transition-colors"
                    >
                      <Link
                        href={`/products/${p.slug}`}
                        onClick={closeCart}
                        className="block relative aspect-square bg-[url('/product-bg.webp')] bg-cover bg-center"
                      >
                        <Image src={p.image} alt={p.name} fill sizes="128px" className="object-contain p-3" />
                      </Link>
                      <div className="p-2 space-y-1">
                        <p className="text-[11px] font-semibold text-[#2d1b15] line-clamp-1">{p.name}</p>
                        <p className="text-xs font-bold text-[#8b1a1a]">₹{firstPack?.price ?? p.price}</p>
                        <button
                          onClick={() => add(p.id, firstPack, 1, { silent: true })}
                          className="w-full mt-1 text-[10px] font-bold uppercase tracking-wider py-1.5 bg-[#8b1a1a] hover:bg-[#6d1414] text-white rounded-md transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#e8ddd0] bg-white">
            <div className="px-6 py-3 flex items-center justify-around text-[10px] font-semibold text-[#6b5347] border-b border-[#e8ddd0]/60 bg-[#faf6f0]/40">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c9a45c]" /> Secure
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#c9a45c]" /> Fast Ship
              </span>
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#c9a45c]" /> FSSAI
              </span>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-[#6b5347]">Subtotal</span>
                <div className="text-right">
                  {appliedCoupon && (
                    <span className="text-xs text-[#6b5347] line-through mr-2">₹{total}</span>
                  )}
                  <span className="text-2xl font-bold text-[#8b1a1a]">₹{appliedCoupon ? Math.max(0, total - appliedCoupon.discount) : total}</span>
                </div>
              </div>
              {appliedCoupon && (
                <p className="text-[11px] text-green-600 font-semibold flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {appliedCoupon.code} applied • -₹{appliedCoupon.discount} off
                </p>
              )}
              <p className="text-[11px] text-[#6b5347]">Shipping &amp; taxes calculated at checkout.</p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="h-12 flex items-center justify-center text-sm font-bold uppercase tracking-wider rounded-xl border-2 border-[#c9a45c] text-[#8b1a1a] hover:bg-[#c9a45c]/10 transition-colors"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="h-12 flex items-center justify-center text-sm font-bold uppercase tracking-wider rounded-xl bg-[#8b1a1a] hover:bg-[#6d1414] text-white transition-colors"
                >
                  Checkout →
                </Link>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
