'use client'

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { products, type Product } from '@/lib/content'
import { validateCoupon } from '@/lib/coupons'
import { toast } from 'sonner'

export const CART_LIMIT = 10

type CartItem = {
  product: Product
  qty: number
  selectedPack?: { size: string; price: number }
}

export type AppliedCoupon = {
  code: string
  description: string
  discount: number
  type: 'percentage' | 'flat'
  value: number
}

type CartContextValue = {
  items: CartItem[]
  add: (id: number, pack?: { size: string; price: number }, qty?: number, opts?: { silent?: boolean }) => void
  remove: (id: number, size?: string) => void
  updateQty: (id: number, size: string | undefined, qty: number) => void
  total: number
  count: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  appliedCoupon: AppliedCoupon | null
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>
  removeCoupon: () => void
  isFull: boolean
}

const CartContext = createContext<CartContextValue | null>(null)

/** Unique line-item count (different product+size combos) */
function uniqueItemCount(items: CartItem[]): number {
  return items.length
}

/**
 * Merge two cart arrays.
 * Server items take priority for duplicates (same product id + pack size).
 * Result is capped at CART_LIMIT unique line items.
 */
function mergeCartItems(serverItems: CartItem[], localItems: CartItem[]): CartItem[] {
  const merged = [...serverItems]
  const existsKey = (item: CartItem) => `${item.product.id}__${item.selectedPack?.size ?? ''}`

  const serverKeys = new Set(serverItems.map(existsKey))

  for (const localItem of localItems) {
    if (merged.length >= CART_LIMIT) break
    const key = existsKey(localItem)
    if (!serverKeys.has(key)) {
      merged.push(localItem)
    }
    // If duplicate, server version already in merged — skip
  }

  return merged.slice(0, CART_LIMIT)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    let localItems: CartItem[] = []
    const localCart = localStorage.getItem('annavedah_cart')
    if (localCart) {
      try {
        localItems = JSON.parse(localCart)
        // Enforce limit on stale localStorage data
        if (localItems.length > CART_LIMIT) {
          localItems = localItems.slice(0, CART_LIMIT)
        }
        setItems(localItems)
      } catch {}
    }

    fetch('/api/cart')
      .then(res => res.json())
      .then(data => {
        if (data.cart && data.cart.length > 0) {
          const serverItems: CartItem[] = data.cart

          if (localItems.length > 0) {
            // --- Smart Merge: combine server + local, capped at CART_LIMIT ---
            const merged = mergeCartItems(serverItems, localItems)

            const localOnlyCount = merged.length - serverItems.length
            if (localOnlyCount > 0 && localItems.length > localOnlyCount) {
              toast.info('Cart merged', {
                description: `Your saved cart was combined with your browsing cart. Max ${CART_LIMIT} items kept.`,
              })
            }

            setItems(merged)
            localStorage.setItem('annavedah_cart', JSON.stringify(merged))

            // Persist merged result to server
            fetch('/api/cart', {
              method: 'POST',
              body: JSON.stringify({ items: merged }),
              headers: { 'Content-Type': 'application/json' }
            }).catch(() => {})
          } else {
            // No local cart — just use server
            setItems(serverItems.slice(0, CART_LIMIT))
            localStorage.setItem('annavedah_cart', JSON.stringify(serverItems.slice(0, CART_LIMIT)))
          }
        } else if (localItems.length > 0) {
          // Server empty, push local to server
          fetch('/api/cart', {
            method: 'POST',
            body: JSON.stringify({ items: localItems }),
            headers: { 'Content-Type': 'application/json' }
          }).catch(() => {})
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    localStorage.setItem('annavedah_cart', JSON.stringify(items))

    const timer = setTimeout(() => {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      }).catch(() => {})
    }, 1000)

    return () => clearTimeout(timer)
  }, [items])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const add = useCallback((id: number, pack?: { size: string; price: number }, qty: number = 1, opts?: { silent?: boolean }) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === id && item.selectedPack?.size === pack?.size)
      if (existing) {
        // Updating quantity of existing item — always allowed
        return prev.map((item) =>
          item.product.id === id && item.selectedPack?.size === pack?.size
            ? { ...item, qty: item.qty + qty }
            : item,
        )
      }
      // Adding new line item — check limit
      if (uniqueItemCount(prev) >= CART_LIMIT) {
        toast.warning('Cart is full', {
          description: `You can have up to ${CART_LIMIT} different items in your cart. Remove an item to add more.`,
        })
        return prev
      }
      const product = products.find((p) => p.id === id)
      if (!product || product.price <= 0) return prev
      return [...prev, { product, qty, selectedPack: pack }]
    })
    if (!opts?.silent) {
      setIsOpen(true)
    }
  }, [])

  const remove = useCallback((id: number, size?: string) => {
    setItems((prev) => prev.filter((item) => !(item.product.id === id && item.selectedPack?.size === size)))
  }, [])

  const updateQty = useCallback((id: number, size: string | undefined, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((item) => !(item.product.id === id && item.selectedPack?.size === size)))
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === id && item.selectedPack?.size === size ? { ...item, qty } : item,
      ),
    )
  }, [])

  const total = items.reduce((sum, item) => sum + (item.selectedPack ? item.selectedPack.price : item.product.price) * item.qty, 0)
  const count = items.reduce((sum, item) => sum + item.qty, 0)

  // Re-validate coupon when cart total changes
  useEffect(() => {
    if (appliedCoupon) {
      const result = validateCoupon(appliedCoupon.code, total)
      if (!result.valid) {
        setAppliedCoupon(null)
      } else {
        // Update discount in case cart total changed
        setAppliedCoupon((prev) => prev ? { ...prev, discount: result.discount } : null)
      }
    }
  }, [total, appliedCoupon?.code])

  const applyCoupon = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    const result = validateCoupon(code, total)
    if (!result.valid) {
      return { success: false, error: result.error }
    }
    setAppliedCoupon({
      code: result.coupon.code,
      description: result.coupon.description,
      discount: result.discount,
      type: result.coupon.type,
      value: result.coupon.value,
    })
    return { success: true }
  }, [total])

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null)
  }, [])

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, total, count, isOpen, openCart, closeCart, appliedCoupon, applyCoupon, removeCoupon, isFull: uniqueItemCount(items) >= CART_LIMIT }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
