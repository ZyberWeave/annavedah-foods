'use client'

import { useMemo, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCart, CART_LIMIT } from '@/components/cart-context'
import { useProductsData } from '@/components/products-context'
import { Plus, Minus, Trash2, ArrowRight, Tag, X, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import TrustBadges from '@/components/TrustBadges'
import RecentlyViewed from '@/components/RecentlyViewed'

const FREE_SHIPPING_THRESHOLD = 999

export default function CartPage() {
  const { items, remove, updateQty, total, add, changePack, clearCart, appliedCoupon, applyCoupon, removeCoupon, isFull } = useCart()
  const { products } = useProductsData()
  const router = useRouter()
  const [promoCode, setPromoCode] = useState('')
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)

  const handleClearAll = useCallback(() => {
    clearCart()
    setShowClearModal(false)
  }, [clearCart])

  const discountedTotal = appliedCoupon ? Math.max(0, total - appliedCoupon.discount) : total

  const upsells = useMemo(() => {
    const inCart = new Set(items.map((i) => i.product.id))
    return products
      .filter((p) => p.price > 0 && !inCart.has(p.id) && (p.badge === 'Bestseller' || p.badge === 'Popular' || p.badge === 'New'))
      .slice(0, 4)
  }, [items, products])

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total)
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)

  const handleApplyCoupon = async () => {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setPromoError('')
    const result = await applyCoupon(promoCode.trim())
    if (!result.success) {
      setPromoError(result.error || 'Invalid coupon')
    } else {
      setPromoCode('')
    }
    setPromoLoading(false)
  }

  return (
    <div className="container mx-auto px-4 site-page-gap pb-16 space-y-8">
      <Breadcrumbs items={[{ label: 'Cart' }]} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Cart</p>
          <h1 className="text-3xl font-bold text-primary md:text-4xl flex items-center gap-3">
            Your selected products
            {items.length > 0 && (
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                isFull ? 'bg-red-100 text-red-700' : items.length >= CART_LIMIT - 2 ? 'bg-amber-100 text-amber-700' : 'bg-[#f0e8dc] text-[#6b5347]'
              }`}>
                {items.length}/{CART_LIMIT}
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete All
            </button>
          )}
          <Link href="/products" className="text-sm font-semibold text-primary hover:text-accent transition-colors">
            Continue shopping →
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-8 text-center space-y-3">
          <p className="text-lg font-semibold text-foreground">Your cart is empty</p>
          <p className="text-muted-foreground">Browse our collection and add items to proceed.</p>
          <Button asChild className="h-11 px-6 font-semibold bg-[#8b1a1a] hover:bg-[#6d1414] text-white">
            <Link href="/products">Explore products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {total < FREE_SHIPPING_THRESHOLD && (
              <div className="rounded-2xl border border-[#c9a45c]/30 bg-[#c9a45c]/10 p-4">
                <p className="text-sm text-[#2d1b15] mb-2">
                  Add <span className="font-bold text-[#8b1a1a]">₹{remaining}</span> more for{' '}
                  <span className="font-semibold">FREE shipping</span>
                </p>
                <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#c9a45c] to-[#8b1a1a] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {items.map((item, idx) => {
              const { product, qty } = item
              const unitPrice = item.selectedPack ? item.selectedPack.price : product.price
              return (
                <div
                  key={`${product.slug}-${item.selectedPack?.size ?? 'std'}-${idx}`}
                  className="flex flex-col gap-4 rounded-2xl border-2 border-[#e8ddd0] bg-white p-4 md:flex-row md:items-center"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="relative h-28 w-28 rounded-xl bg-[url('/product-bg.webp')] bg-cover bg-center border border-[#e8ddd0]/60 overflow-hidden flex-shrink-0"
                  >
                    <Image src={product.image} alt={product.name} fill sizes="112px" className="object-contain p-3 drop-shadow-md" />
                  </Link>
                  <div className="flex-1 space-y-1">
                    <Link href={`/products/${product.slug}`} className="block">
                      <h3 className="text-lg font-bold text-[#2d1b15] hover:text-[#8b1a1a] transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-[#6b5347]">{product.category}</p>
                    {product.packPrices.length > 1 ? (
                      <div className="pt-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6b5347] block mb-1">Size</label>
                        <select
                          value={item.selectedPack?.size ?? ''}
                          onChange={(e) => {
                            const pack = product.packPrices.find((pp) => pp.size === e.target.value)
                            if (pack) changePack(product.id, item.selectedPack?.size, { size: pack.size, price: pack.price })
                          }}
                          className="text-sm border-2 border-[#e8ddd0] rounded-lg px-3 py-1.5 bg-white text-[#2d1b15] font-semibold focus:outline-none focus:border-[#c9a45c]"
                          aria-label="Change pack size"
                        >
                          {product.packPrices.map((pp) => (
                            <option key={pp.size} value={pp.size}>{pp.size} — ₹{pp.price}</option>
                          ))}
                        </select>
                      </div>
                    ) : item.selectedPack ? (
                      <p className="text-sm text-[#6b5347] pt-1">Size: <span className="font-semibold text-[#2d1b15]">{item.selectedPack.size}</span></p>
                    ) : null}
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex items-center border-2 border-[#e8ddd0] rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQty(product.id, item.selectedPack?.size, qty - 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-[#faf6f0] transition-colors"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5 text-[#2d1b15]" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-[#2d1b15]">{qty}</span>
                        <button
                          onClick={() => updateQty(product.id, item.selectedPack?.size, qty + 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-[#faf6f0] transition-colors"
                          aria-label="Increase"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#2d1b15]" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-bold text-[#8b1a1a]">₹{unitPrice * qty}</p>
                    <button
                      onClick={() => remove(product.id, item.selectedPack?.size)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              )
            })}

            {upsells.length > 0 && (
              <div className="rounded-2xl border-2 border-[#e8ddd0] bg-white p-5">
                <h3 className="text-lg font-bold text-[#2d1b15] mb-4">Complete your order</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {upsells.map((p) => {
                    const firstPack = p.packPrices[0]
                    return (
                      <div key={p.id} className="bg-[#faf6f0]/50 rounded-xl border border-[#e8ddd0] overflow-hidden">
                        <Link href={`/products/${p.slug}`} className="block relative aspect-square bg-[url('/product-bg.webp')] bg-cover bg-center">
                          <Image src={p.image} alt={p.name} fill sizes="160px" className="object-contain p-3" />
                        </Link>
                        <div className="p-3 space-y-2">
                          <p className="text-xs font-bold text-[#2d1b15] line-clamp-1">{p.name}</p>
                          <p className="text-sm font-bold text-[#8b1a1a]">₹{firstPack?.price ?? p.price}</p>
                          <button
                            onClick={() => add(p.id, firstPack)}
                            className="w-full py-2 text-[10px] font-bold uppercase tracking-wider bg-[#8b1a1a] hover:bg-[#6d1414] text-white rounded-lg transition-colors"
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

          <div className="space-y-4 lg:sticky lg:self-start site-sticky-top">
            <div className="rounded-2xl border-2 border-[#e8ddd0] bg-white p-6 space-y-4">
              <h3 className="text-xl font-bold text-[#2d1b15]">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-[#6b5347]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#2d1b15]">₹{total}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-[#6b5347]">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-700">{total >= FREE_SHIPPING_THRESHOLD ? 'FREE' : 'Calculated at checkout'}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="pt-2 border-t border-[#e8ddd0] space-y-3">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border-2 border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-green-800">{appliedCoupon.code}</p>
                        <p className="text-[10px] text-green-600">{appliedCoupon.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="p-1 hover:bg-green-100 rounded-full transition-colors"
                      aria-label="Remove coupon"
                    >
                      <X className="w-4 h-4 text-green-700" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2 items-center">
                      <Tag className="w-4 h-4 text-[#c9a45c] flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError('') }}
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-[#e8ddd0] text-sm focus:outline-none focus:border-[#c9a45c] uppercase tracking-wider font-bold"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleApplyCoupon()
                          }
                        }}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={promoLoading || !promoCode.trim()}
                        className="px-3 py-2 text-xs font-bold uppercase tracking-wider border-2 border-[#e8ddd0] text-[#6b5347] rounded-lg hover:border-[#c9a45c] hover:bg-[#c9a45c]/10 transition-colors disabled:opacity-50"
                      >
                        {promoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-red-500 mt-1.5 pl-6">{promoError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Discount line */}
              {appliedCoupon && (
                <div className="flex items-center justify-between text-sm text-green-700">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">-₹{appliedCoupon.discount}</span>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t border-[#e8ddd0]">
                <span className="text-base font-bold text-[#2d1b15]">Total</span>
                <div className="text-right">
                  {appliedCoupon && (
                    <span className="text-sm text-[#6b5347] line-through mr-2">₹{total}</span>
                  )}
                  <span className="text-2xl font-bold text-[#8b1a1a]">₹{discountedTotal}</span>
                </div>
              </div>

              <Button
                className="w-full h-12 font-bold bg-[#8b1a1a] hover:bg-[#6d1414] text-white text-base rounded-xl"
                onClick={() => router.push('/checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-[11px] text-[#6b5347] text-center">Shipping &amp; taxes calculated at checkout.</p>
            </div>

            <TrustBadges variant="grid" limit={4} compact />
          </div>
        </div>
      )}

      {items.length > 0 && <RecentlyViewed />}

      {/* Delete All Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowClearModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2d1b15]">Delete all items?</h3>
                <p className="text-sm text-[#6b5347] mt-1">
                  This will remove all <span className="font-semibold text-[#2d1b15]">{items.length} item{items.length !== 1 ? 's' : ''}</span> from your cart. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-[#6b5347] bg-[#f0e8dc] hover:bg-[#e8ddd0] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
