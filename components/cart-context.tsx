'use client'

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { type Product } from '@/lib/content'
import { validateCoupon } from '@/lib/coupons'
import { useProductsData } from '@/components/products-context'
import { toast } from 'sonner'

export const CART_LIMIT = 10
const AUTH_CHANGED_EVENT = 'auth-changed'

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
  changePack: (id: number, currentSize: string | undefined, newPack: { size: string; price: number }) => void
  clearCart: () => void
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
  }

  return merged.slice(0, CART_LIMIT)
}

function hydrateCartItems(items: CartItem[], productMap: Map<number, Product>): CartItem[] {
  const hydrated: CartItem[] = []

  for (const item of items) {
    const product = productMap.get(item.product.id)
    if (!product) continue

    const matchedPack = item.selectedPack?.size
      ? product.packPrices.find((pack) => pack.size === item.selectedPack?.size)
      : undefined

    const fallbackPack = product.packPrices[0]
    const selectedPack = matchedPack
      ? { size: matchedPack.size, price: matchedPack.price }
      : fallbackPack
        ? { size: fallbackPack.size, price: fallbackPack.price }
        : undefined

    if (product.price <= 0 && !selectedPack) continue

    hydrated.push({
      product,
      qty: Math.max(1, Number(item.qty) || 1),
      selectedPack,
    })
  }

  return hydrated
}

function getCartSignature(items: CartItem[]): string {
  return JSON.stringify(
    items
      .map((item) => ({
        id: item.product.id,
        size: item.selectedPack?.size ?? '',
        qty: item.qty,
      }))
      .sort((a, b) => {
        if (a.id !== b.id) return a.id - b.id
        return a.size.localeCompare(b.size)
      }),
  )
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { productMap } = useProductsData()
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const isFirstRender = useRef(true)
  const itemsRef = useRef<CartItem[]>([])
  const productMapRef = useRef(productMap)
  const syncInFlight = useRef(false)
  const pendingSyncRef = useRef(false)
  const pendingSyncToastRef = useRef(false)

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    productMapRef.current = productMap
  }, [productMap])

  const writeLocalCart = useCallback((nextItems: CartItem[]) => {
    localStorage.setItem('annavedah_cart', JSON.stringify(nextItems))
  }, [])

  const persistServerCart = useCallback(async (nextItems: CartItem[]) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: nextItems }),
      cache: 'no-store',
    })

    return res.ok
  }, [])

  const replaceCart = useCallback((nextItems: CartItem[]) => {
    setItems(nextItems)
    writeLocalCart(nextItems)
  }, [writeLocalCart])

  const syncAccountCart = useCallback(async ({
    baseItems,
    mergeLocal = true,
    showMergeToast = false,
  }: {
    baseItems?: CartItem[]
    mergeLocal?: boolean
    showMergeToast?: boolean
  } = {}) => {
    if (syncInFlight.current) {
      pendingSyncRef.current = true
      pendingSyncToastRef.current = pendingSyncToastRef.current || showMergeToast
      return
    }
    syncInFlight.current = true

    try {
      const authRes = await fetch('/api/auth/me', { cache: 'no-store' })
      if (!authRes.ok) return

      const cartRes = await fetch('/api/cart', { cache: 'no-store' })
      if (!cartRes.ok) return

      const data = await cartRes.json()
      const localItems = baseItems ?? itemsRef.current
      const serverItems = Array.isArray(data.cart)
        ? hydrateCartItems(data.cart, productMapRef.current).slice(0, CART_LIMIT)
        : []

      if (serverItems.length > 0 && mergeLocal && localItems.length > 0) {
        const merged = mergeCartItems(serverItems, localItems)
        const mergedSignature = getCartSignature(merged)
        const localSignature = getCartSignature(localItems)
        const serverSignature = getCartSignature(serverItems)

        if (mergedSignature !== localSignature) {
          replaceCart(merged)
        }

        if (mergedSignature !== serverSignature) {
          await persistServerCart(merged)
          if (showMergeToast) {
            toast.info('Cart synced', {
              description: 'Your account cart was combined with this device cart.',
            })
          }
        }

        return
      }

      if (serverItems.length > 0) {
        if (getCartSignature(serverItems) !== getCartSignature(localItems)) {
          replaceCart(serverItems)
        }
        return
      }

      if (localItems.length > 0) {
        await persistServerCart(localItems)
      }
    } catch {
      // Best-effort sync only. Local cart stays usable even if auth or network fails.
    } finally {
      syncInFlight.current = false
      if (pendingSyncRef.current) {
        pendingSyncRef.current = false
        const showQueuedToast = pendingSyncToastRef.current
        pendingSyncToastRef.current = false
        void syncAccountCart({ showMergeToast: showQueuedToast })
      }
    }
  }, [persistServerCart, replaceCart])

  useEffect(() => {
    let localItems: CartItem[] = []
    const localCart = localStorage.getItem('annavedah_cart')
    if (localCart) {
      try {
        localItems = hydrateCartItems(JSON.parse(localCart), productMapRef.current)
        if (localItems.length > CART_LIMIT) {
          localItems = localItems.slice(0, CART_LIMIT)
        }
        setItems(localItems)
      } catch {}
    }

    void syncAccountCart({
      baseItems: localItems,
      showMergeToast: localItems.length > 0,
    })
  }, [syncAccountCart])

  useEffect(() => {
    const handleAuthChanged = () => {
      void syncAccountCart({ showMergeToast: true })
    }

    const handleFocus = () => {
      void syncAccountCart()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncAccountCart()
      }
    }

    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [syncAccountCart])

  useEffect(() => {
    setItems((prev) => hydrateCartItems(prev, productMap))
  }, [productMap])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    writeLocalCart(items)

    const timer = setTimeout(() => {
      persistServerCart(items).catch(() => {})
    }, 1000)

    return () => clearTimeout(timer)
  }, [items, persistServerCart, writeLocalCart])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const add = useCallback((id: number, pack?: { size: string; price: number }, qty: number = 1, opts?: { silent?: boolean }) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === id && item.selectedPack?.size === pack?.size)
      if (existing) {
        return prev.map((item) =>
          item.product.id === id && item.selectedPack?.size === pack?.size
            ? { ...item, qty: item.qty + qty }
            : item,
        )
      }

      if (uniqueItemCount(prev) >= CART_LIMIT) {
        toast.warning('Cart is full', {
          description: `You can have up to ${CART_LIMIT} different items in your cart. Remove an item to add more.`,
        })
        return prev
      }

      const product = productMap.get(id)
      if (!product || product.price <= 0) return prev
      return [...prev, { product, qty, selectedPack: pack }]
    })

    if (!opts?.silent) {
      setIsOpen(true)
    }
  }, [productMap])

  const remove = useCallback((id: number, size?: string) => {
    setItems((prev) => prev.filter((item) => !(item.product.id === id && item.selectedPack?.size === size)))
  }, [])

  const changePack = useCallback((id: number, currentSize: string | undefined, newPack: { size: string; price: number }) => {
    setItems((prev) => {
      const target = prev.find((item) => item.product.id === id && item.selectedPack?.size === currentSize)
      if (!target) return prev
      if (newPack.size === currentSize) return prev

      const existingNewSize = prev.find((item) => item.product.id === id && item.selectedPack?.size === newPack.size)
      if (existingNewSize) {
        return prev
          .filter((item) => !(item.product.id === id && item.selectedPack?.size === currentSize))
          .map((item) =>
            item.product.id === id && item.selectedPack?.size === newPack.size
              ? { ...item, qty: item.qty + target.qty }
              : item,
          )
      }

      return prev.map((item) =>
        item.product.id === id && item.selectedPack?.size === currentSize
          ? { ...item, selectedPack: newPack }
          : item,
      )
    })
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

  const clearCart = useCallback(() => {
    setItems([])
    setAppliedCoupon(null)
    localStorage.removeItem('annavedah_cart')
    persistServerCart([]).catch(() => {})
  }, [persistServerCart])

  const total = items.reduce((sum, item) => sum + (item.selectedPack ? item.selectedPack.price : item.product.price) * item.qty, 0)
  const count = items.reduce((sum, item) => sum + item.qty, 0)

  useEffect(() => {
    if (appliedCoupon) {
      const result = validateCoupon(appliedCoupon.code, total)
      if (!result.valid) {
        setAppliedCoupon(null)
      } else {
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
    <CartContext.Provider value={{ items, add, remove, updateQty, changePack, clearCart, total, count, isOpen, openCart, closeCart, appliedCoupon, applyCoupon, removeCoupon, isFull: uniqueItemCount(items) >= CART_LIMIT }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
